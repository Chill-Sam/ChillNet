<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include 'db_config.php';

    $mysqli = new mysqli($servername, $username, $password, $database);

    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    $post_content = $_POST['content'];
    $post_content = $mysqli->real_escape_string($post_content);

    $user_id = $_SESSION["UserId"];

    $create_post_query = "INSERT INTO Posts (Content, AssUserId) VALUES ('$post_content', '$user_id')";

    $mysqli->query($create_post_query);

    header("Location: http://chillsam.ddns.net/");
}
?>
