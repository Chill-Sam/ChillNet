<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $servername = "";
    $username = "";
    $password = "";
    $database = "";

    $mysqli = new mysqli($servername, $username, $password, $database);

    $user_username = $_POST['username'];
    $user_username = $mysqli->real_escape_string($user_username);
    $user_email = $_POST['email'];
    $user_email = $mysqli->real_escape_string($user_email);

    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    $sql_name = "SELECT COUNT(*) AS count FROM User WHERE Username = '$user_username'";
    $sql_email = "SELECT COUNT(*) AS count FROM User WHERE Email = '$user_username'";

    $username_result = $mysqli->query($sql_name);
    $email_result = $mysqli->query($sql_email);

    // Check the result
    if ($username_result) {
        $row = $username_result->fetch_assoc();
        if ($row['count'] > 0) {
            echo "UE";
        } else {
            echo "UD";
        }
    } else {
        echo "Error: " . $conn->error;
    }
    if ($email_result) {
        $row = $email_result->fetch_assoc();
        if ($row['count'] > 0) {
            echo "EE";
        } else {
            echo "ED";
        }
    } else {
        echo "Error: " . $conn->error;
    }


    // Close the connection
    $mysqli->close();
}
?>
