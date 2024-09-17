<?php 
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') { 
    $mail = new PHPMailer(true);

    $email = $_POST['email'];
    $code = $_POST['code'];

    try {
        //Server settings
        $mail->isSMTP();
        $mail->Host       = '';
        $mail->SMTPAuth   = true;
        $mail->Username   = '';
        $mail->Password   = '';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        //Recipients
        $mail->setFrom('chillnetpi@gmail.com', 'Chill Net');
        $mail->addAddress($email, 'User'); 

        //Content
        $mail->isHTML(true); 
        $mail->Subject = 'ChillNet Confirmation Code';
        $mail->Body    = 'Your one time verification code for ChillNet is ' . $code . '.';

        $mail->send();
        echo 'Message has been sent';
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
}
?>
