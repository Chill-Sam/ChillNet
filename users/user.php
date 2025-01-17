<?php
// Include your database connection
include ('db_config.php');

$mysqli = new mysqli($servername, $username, $password, $database);

// Get the username from the query parameter
$username = $_GET['username'];

// Validate and sanitize the username
$username = filter_var($username, FILTER_SANITIZE_STRING);

// Fetch user-specific data from the database
$query = $mysqli->prepare('SELECT * FROM Users WHERE username = ?');
$query->bind_param('s', $username);
$query->execute();
$result = $query->get_result();
if ($result->num_rows > 0) {  // Fetch user data
    $user = $result->fetch_assoc();  // Display the user's unique page
} else {  // Handle case where the user does not exist
    header('Location: /404.php');
    exit;
}
?>
