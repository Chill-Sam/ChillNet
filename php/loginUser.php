<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include 'db_config.php';

    $mysqli = new mysqli($servername, $username, $password, $database);

    if ($mysqli->connect_error) {
        http_response_code(500);
        die('Connection failed: ' . $mysqli->connect_error);
    }

    // Sanitize and validate input
    $user_username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $user_password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);

    if (!$user_username || !$user_password) {
        http_response_code(400);
        die('Invalid input.');
    }

    // Prepare and execute query to get user ID and password hash
    $stmt = $mysqli->prepare('SELECT UserId, Password FROM Users WHERE Username = ?');
    if (!$stmt) {
        http_response_code(500);
        die('Failed to prepare query: ' . $mysqli->error);
    }

    $stmt->bind_param('s', $user_username);
    $stmt->execute();
    $stmt->bind_result($user_id, $password_hash);

    if ($stmt->fetch()) {
        $stmt->close();

        // Verify password
        if (password_verify($user_password, $password_hash)) {
            // Fetch the username
            $stmt = $mysqli->prepare('SELECT Username FROM Users WHERE UserId = ?');
            if (!$stmt) {
                http_response_code(500);
                die('Failed to prepare query: ' . $mysqli->error);
            }

            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            $stmt->bind_result($username);

            if ($stmt->fetch()) {
                $_SESSION['username'] = $username;
                $_SESSION['loggedin'] = true;
                $_SESSION['UserId'] = $user_id;
                $stmt->close();
                $mysqli->close();
                header('Location: http://chillsam.ddns.net/');
                exit(0);
            } else {
                $stmt->close();
                $mysqli->close();
                http_response_code(500);
                die('Failed to fetch username.');
            }
        } else {
            $mysqli->close();
            echo 'WP';  // Wrong password
            exit(1);
        }
    } else {
        $stmt->close();
        $mysqli->close();
        echo 'NA';  // No account found
        exit(1);
    }
}
?>
