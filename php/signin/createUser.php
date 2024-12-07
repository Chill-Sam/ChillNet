<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include 'db_config.php';

    // Establish database connection
    $mysqli = new mysqli($servername, $username, $password, $database);

    if ($mysqli->connect_error) {
        error_log('Database connection failed: ' . $mysqli->connect_error);
        die('An error occurred. Please try again later.');
    }

    // Sanitize and validate inputs
    $user_username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $user_email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $user_password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);

    if (!$user_username || !$user_email || !$user_password) {
        http_response_code(400);
        die('Invalid input.');
    }

    // Check for existing username or email
    $check_user_query = 'SELECT COUNT(*) AS count FROM Users WHERE Username = ? OR Email = ?';
    $stmt = $mysqli->prepare($check_user_query);
    if (!$stmt) {
        http_response_code(500);
        die('Failed to prepare query.');
    }

    $stmt->bind_param('ss', $user_username, $user_email);
    $stmt->execute();
    $stmt->bind_result($existing_count);
    $stmt->fetch();
    $stmt->close();

    if ($existing_count > 0) {
        http_response_code(409);  // Conflict
        die('Username or email already exists.');
    }

    $stmt = $mysqli->prepare('SELECT verified FROM CreationOTP WHERE email = ? ORDER BY created_at DESC LIMIT 1');
    $stmt->bind_param('s', $user_email);
    $stmt->execute();
    $stmt->bind_result($verified);
    $stmt->fetch();

    if ($verified !== 1) {
        http_response_code(500);
        die('Not validated');
    }

    $stmt->close();

    $stmt = $mysqli->prepare('DELETE FROM CreationOTP WHERE email = ?');
    $stmt->bind_param('s', $user_email);
    $stmt->execute();
    $stmt->close();

    // Hash password securely
    $hashed_password = password_hash($user_password, PASSWORD_BCRYPT);

    // Insert new user into database
    $create_user_query = 'INSERT INTO Users (Username, Email, Password) VALUES (?, ?, ?)';
    $stmt = $mysqli->prepare($create_user_query);
    if (!$stmt) {
        http_response_code(500);
        die('Failed to prepare query.');
    }

    $stmt->bind_param('sss', $user_username, $user_email, $hashed_password);
    if ($stmt->execute()) {
        // Set session variables for the newly created user
        $_SESSION['username'] = $user_username;
        $_SESSION['loggedin'] = true;

        http_response_code(201);  // Created
        echo 'User created successfully.';
    } else {
        http_response_code(500);
        echo 'Error creating user.';
    }

    $stmt->close();
    $mysqli->close();
}
?>

