<?php
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require '../vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include 'db_config.php';

    $mysqli = new mysqli($servername, $username, $password, $database);

    if ($mysqli->connect_error) {
        error_log('Database connection failed: ' . $mysqli->connect_error);
        die('An error occurred. Please try again later.');
    }

    $action = $_POST['action'];  // Determine whether to send or verify OTP

    // Validate email input
    $email = $_POST['email'];
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die('Invalid email format.');
    }

    if ($action === 'send_otp') {
        // Rate limiting: Check if too many requests were made recently
        $stmt = $mysqli->prepare('SELECT COUNT(*) FROM CreationOTP WHERE email = ? AND created_at > NOW() - INTERVAL 1 HOUR');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->bind_result($request_count);
        $stmt->fetch();
        $stmt->close();

        if ($request_count > 5) {
            die('Too many requests. Please try again later.');
        }

        // Generate a 6-digit OTP
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);  // Ensures it's always 6 digits
        $hashed_code = password_hash($code, PASSWORD_DEFAULT);

        // Insert OTP into the database
        $stmt = $mysqli->prepare('INSERT INTO CreationOTP (email, OTP, created_at) VALUES (?, ?, NOW())');
        $stmt->bind_param('ss', $email, $hashed_code);
        if (!$stmt->execute()) {
            error_log('Failed to insert OTP: ' . $stmt->error);
            die('An error occurred. Please try again later.');
        }
        $stmt->close();

        // Send the OTP via email
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = getenv('SMTP_USER');
            $mail->Password = getenv('SMTP_PASS');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom('chillnetpi@gmail.com', 'Chill Net');
            $mail->addAddress($email, 'User');
            $mail->isHTML(true);
            $mail->Subject = 'ChillNet Confirmation Code';
            $mail->Body = 'Your one-time verification code for ChillNet is ' . $code . '.';

            $mail->send();
            echo 'OTP sent successfully.';
        } catch (Exception $e) {
            error_log("Mailer Error: {$mail->ErrorInfo}");
            die('Failed to send OTP. Please try again later.');
        }
    } elseif ($action === 'verify_otp') {
        // Verify OTP
        $otp = $_POST['otp'];

        // Ensure OTP is a valid 6-digit numeric code
        if (!preg_match('/^\d{6}$/', $otp)) {
            die('Invalid OTP format.');
        }

        // Retrieve the hashed OTP from the database
        $stmt = $mysqli->prepare('SELECT OTP FROM CreationOTP WHERE email = ? ORDER BY created_at DESC LIMIT 1');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->bind_result($db_otp);

        if ($stmt->fetch()) {
            $retrieved_otp = $db_otp;
            $stmt->close();

            // Compare the provided OTP with the stored hashed OTP
            if (password_verify($otp, $db_otp)) {
                $updateStmt = $mysqli->prepare('UPDATE CreationOTP SET verified = 1 WHERE email = ?');
                $updateStmt->bind_param('s', $email);
                $updateStmt->execute();
                $updateStmt->close();
                echo 'OTP verification successful.';
            } else {
                echo 'Invalid OTP.';
            }
        } else {
            $stmt->clost();
            echo 'No OTP found for the provided email.';
        }
    } elseif ($action === 'check_verification') {
        $email = $_POST['email'];

        // Query to check if OTP was verified for this email
        $stmt = $mysqli->prepare('SELECT verified FROM CreationOTP WHERE email = ? ORDER BY created_at DESC LIMIT 1');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->bind_result($verified);
        $stmt->fetch();

        if ($verified === 1) {
            echo 'OTP verified.';
        } else {
            echo 'OTP not verified.';
        }

        $stmt->close();
    } else {
        die('Invalid action.');
    }

    $mysqli->close();
}
?>
