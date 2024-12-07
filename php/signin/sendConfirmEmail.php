<?php
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require 'vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include 'db_config.php';
    $mail = new PHPMailer(true);

    $mysqli = new mysqli($servername, $username, $password, $database);

    if ($mysqli->connect_error) {
        error_log('Database connection failed: ' . $mysqli->connect_error);
        die('An error occurred. Please try again later.');
    }

    $email = $_POST['email'];

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die('Invalid email format.');
    }

    // Rate limiting
    $stmt = $mysqli->prepare('SELECT COUNT(*) FROM CreationOTP WHERE email = ? AND created_at > NOW() - INTERVAL 1 HOUR');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($request_count);
    $stmt->fetch();

    if ($request_count > 5) {
        die('Too many requests. Please try again later.');
    }
    $stmt->close();

    $code = rand(100000, 999999);
    $hashed_code = password_hash($code, PASSWORD_DEFAULT);

    // Insert OTP into the database
    $stmt = $mysqli->prepare('INSERT INTO CreationOTP (email, OTP) VALUES (?, ?)');
    $stmt->bind_param('ss', $email, $hashed_code);
    $stmt->execute();

    $stmt->close();
    $mysqli->close();

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USER');  // Secure via environment variables
        $mail->Password = getenv('SMTP_PASS');  // Secure via environment variables
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('chillnetpi@gmail.com', 'Chill Net');
        $mail->addAddress($email, 'User');

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'ChillNet Confirmation Code';
        $mail->Body = 'Your one-time verification code for ChillNet is ' . $code . '.';

        $mail->send();
        echo 'Message has been sent';
    } catch (Exception $e) {
        error_log("Mailer Error: {$mail->ErrorInfo}");
        echo 'An error occurred while sending the email.';
    }
}
?>
