<?php
include 'db_config.php';  // Including the DB configuration file

// Create a new connection to the database
$mysqli = new mysqli($servername, $username, $password, $database);

// Check if the connection was successful
if ($mysqli->connect_error) {
    die('Connection failed: ' . $mysqli->connect_error);
}

// SQL query to delete OTPs older than 24 hours
$query = 'DELETE FROM CreationOTP WHERE created_at < NOW() - INTERVAL 1 DAY';

// Execute the query
if ($mysqli->query($query)) {
    echo 'Expired OTPs deleted successfully.';
} else {
    echo 'Error deleting expired OTPs: ' . $mysqli->error;
}

// Close the connection
$mysqli->close();
?>
