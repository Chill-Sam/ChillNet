<?php
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

    if (!$user_username || !$user_email) {
        http_response_code(400);
        die('Invalid input.');
    }

    // Prepare and execute queries
    $sql_name = 'SELECT COUNT(*) AS count FROM Users WHERE Username = ?';
    $sql_email = 'SELECT COUNT(*) AS count FROM Users WHERE Email = ?';

    $stmt_name = $mysqli->prepare($sql_name);
    $stmt_email = $mysqli->prepare($sql_email);

    if ($stmt_name && $stmt_email) {
        // Bind and execute for username
        $stmt_name->bind_param('s', $user_username);
        $stmt_name->execute();
        $stmt_name->bind_result($username_count);
        $stmt_name->fetch();
        $stmt_name->close();

        // Bind and execute for email
        $stmt_email->bind_param('s', $user_email);
        $stmt_email->execute();
        $stmt_email->bind_result($email_count);
        $stmt_email->fetch();
        $stmt_email->close();

        // Prepare response
        if ($username_count > 0) {
            echo 'UE';  // Username exists
        } else {
            echo 'UD';  // Username does not exist
        }

        if ($email_count > 0) {
            echo 'EE';  // Email exists
        } else {
            echo 'ED';  // Email does not exist
        }
    } else {
        echo 'Error: ' . $mysqli->error;
    }

    // Close the connection
    $mysqli->close();
    exit;
}

// Handle non-POST requests
http_response_code(405);
echo 'Method not allowed.';
?>

