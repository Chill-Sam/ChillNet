<?php
require_once __DIR__ . '/vendor/autoload.php';  // Include Ratchet autoload file

use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

class PostWebSocket implements MessageComponentInterface
{
    private $db;

    public function __construct()
    {
        include 'db_config.php';

        $this->db = new mysqli($servername, $username, $password, $database);

        if ($this->db->connect_error) {
            die('Connection failed: ' . $this->db->connect_error);
        }

        $this->db->query('SET SESSION wait_timeout = 28800');
    }

    public function onOpen(ConnectionInterface $conn)
    {
        echo "New connection to PostWebSocket: {$conn->resourceId}\n";

        if (!$this->db->ping()) {
            $this->reconnectDatabase();
        }

        $query = 'SELECT * FROM Posts ORDER BY PostDate DESC LIMIT 15';
        $result = $this->db->query($query);

        $posts = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $posts[] = $row;  // Collect posts in an array
            }
        }

        // Send the latest 15 posts to the client
        $conn->send(json_encode([
            'type' => 'latest_posts',
            'data' => $posts
        ]));
    }

    public function onMessage(ConnectionInterface $from, $msg) {}

    public function onClose(ConnectionInterface $conn)
    {
        echo "Connection to PostWebSocket {$conn->resourceId} closed\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "Error on PostWebSocket: {$e->getMessage()}\n";
        $conn->close();
    }
}
