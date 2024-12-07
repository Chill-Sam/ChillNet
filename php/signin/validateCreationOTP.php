<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include 'db_config.php';

    $mysqli = new mysqli($servername, $username, $password, $database);

    if ($mysqli->connect_error) {
        die('Connection failed: ' . $mysqli->connect_error);
    }

    $email = $_POST['email'];
    $otp = $_POST['otp'];

    $email = $mysqli->real_escape_string($email);

    $query = 'SELECT otp FROM CreationOTP WHERE email = ?';

    $stmt = $mysqli->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($db_otp);

    if ($stmt->fetch()) {
        if ($otp == $db_otp) {
            echo 'true';
        } else {
            echo 'false';
        }
    } else {
        echo 'No otp exists for provided email.';
    }

    $stmt->close();
    $mysqli->close();
}
?>
