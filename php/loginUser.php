<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include 'db_config.php'; 

    $mysqli = new mysqli($servername, $username, $password, $database);

    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    $user_username = $_POST['username'];
    $user_username = $mysqli->real_escape_string($user_username);
    $user_password = $_POST['password'];
    $user_password = $mysqli->real_escape_string($user_password);

    $user_id_result = $mysqli->query("SELECT UserId FROM Users WHERE Username='$user_username'");
    $user_id_row = $user_id_result -> fetch_assoc();
    if (empty($user_id_row)) {
        echo "NA";
        exit(1);
    }

    $user_id = $user_id_row['UserId'];

    $password_result = $mysqli->query("SELECT Password FROM Users WHERE UserId='$user_id'");
    $password_result_row = $password_result -> fetch_assoc();
    $password_hash = $password_result_row['Password'];

    if (password_verify($user_password, $password_hash)) {
        $username_result = $mysqli->query("SELECT Username FROM Users WHERE UserId='$user_id'");
        $username_row = $username_result -> fetch_assoc();
        $username = $username_row['Username'];
        $_SESSION['username'] = $username;
        $_SESSION['loggedin'] = true;
        $_SESSION['UserId'] = $user_id;
        header("Location: http://chillsam.ddns.net/");
        exit(0);
    } else {
        echo "WP";
        exit(1);
    }
}
?>
