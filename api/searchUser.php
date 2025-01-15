<?php

include 'db_config.php';

// Establish database connection
$mysqli = new mysqli($servername, $username, $password, $database);

if ($mysqli->connect_error) {
    error_log('Database connection failed: ' . $mysqli->connect_error);
    die('An error occurred, please try again later.');
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['search'])) {
    $search = trim($_GET['search']);

    if (empty($search)) {
        echo json_encode([
            'success' => false,
            'message' => 'Search query cannot be empty.'
        ]);
        exit;
    }
    // Fetch user info from database
    $stmt = $mysqli->prepare('SELECT Username, ProfilePicture FROM Users WHERE Username LIKE ? LIMIT 5');
    $likeSearch = '%' . $search . '%';
    $stmt->bind_param('s', $likeSearch);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($userInfo = $result->fetch_all()) {
        echo json_encode([
            'success' => true,
            'data' => $userInfo
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Users not found'
        ]);
    }

    $stmt->close();
}

$mysqli->close();

?>
