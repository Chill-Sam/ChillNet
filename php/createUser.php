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
    $user_email = $_POST['email'];
    $user_email = $mysqli->real_escape_string($user_email);
    $user_password = $_POST['password'];
    $user_password = $mysqli->real_escape_string($user_password);
    $user_password = password_hash($user_password, PASSWORD_BCRYPT);

    $create_user_query = "INSERT INTO Users (Username, Email, Password) VALUES ('$user_username', '$user_email', '$user_password')";

    $mysqli->query($create_user_query);

    $_SESSION["username"] = $user_username; 
    $_SESSION["loggedin"] = true;
}
?>
