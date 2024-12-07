 <?php
include 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mysqli = new mysqli($servername, $username, $password, $database);

    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }
                        
    $sql = "SELECT Content, AssUserId, PostDate FROM Posts ORDER BY PostDate DESC";
    $result = $mysqli->query($sql);

                   
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $AssUserId = $row["AssUserId"];
            $post_username = "SELECT Username FROM Users WHERE UserId='$AssUserId'";
            $username_result = $mysqli->query($post_username);
            $username_row = $username_result->fetch_assoc();

            echo "<div class='post-div flexcc'>" . htmlspecialchars($row["Content"]) . " - " . $username_row["Username"] . " - " . $row["PostDate"] . "</div>";
        }
    } else {
    echo "<div class='post-div flexcc'>No posts found :'(</div>";
    }

    $mysqli->close();
}
?>

