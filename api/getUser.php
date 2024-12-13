<?php
include 'db_config.php';

// Establish database connection
$mysqli = new mysqli($servername, $username, $password, $database);

if ($mysqli->connect_error) {
    error_log('Database connection failed: ' . $mysqli->connect_error);
    die('An error occurred, please try again later.');
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['UserId'])) {
    $UserId = intval($_GET['UserId']);

    // Fetch user info from database
    $stmt = $mysqli->prepare('SELECT Username, ProfilePicture FROM Users WHERE UserId = ?');
    $stmt->bind_param('i', $UserId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($userInfo = $result->fetch_assoc()) {
        echo json_encode([
            'success' => true,
            'data' => $userInfo
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }

    $stmt->close();
}

$mysqli->close();
?>
