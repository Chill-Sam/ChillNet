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

        $this->db = new mysqli('p:' . $servername, $username, $password, $database);

        if ($this->db->connect_error) {
            die('Connection failed: ' . $this->db->connect_error);
        }

        $this->db->query('SET SESSION wait_timeout = 28800');
    }

    public function onOpen(ConnectionInterface $conn)
    {
        echo "New connection to PostWebSocket: {$conn->resourceId}\n";

        $posts = $this->getLatestPosts();

        // Send the latest 15 posts to the client
        $conn->send(json_encode([
            'type' => 'latest_posts',
            'data' => $posts
        ]));
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        echo "Message recieved: {$msg}\n";

        $data = json_decode($msg, true);

        if (isset($data['action'])) {
            switch ($data['action']) {
                case 'load_initial':
                    $response = [
                        'type' => 'latest_posts',
                        'data' => $this->getLatestPosts()
                    ];
                    break;

                case 'load_more_posts':
                    if (!isset($data['index'])) {
                        $response = [
                            'error' => 'No index provided',
                        ];
                        break;
                    }
                    $response = [
                        'type' => 'older_posts',
                        'index' => $data['index'],
                        'data' => $this->getMorePosts($data['index']),
                    ];
                    break;
            }

            $from->send(json_encode($response));
        } else {
            $from->send(json_encode(['error' => 'Invalid request']));
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        echo "Connection to PostWebSocket {$conn->resourceId} closed\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "Error on PostWebSocket: {$e->getMessage()}\n";
        $conn->close();
    }

    private function getLatestPosts()
    {
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

        return $posts;
    }

    private function getMorePosts($index)
    {
        $posts = [];
        $query = 'SELECT * FROM Posts ORDER BY PostDate DESC LIMIT 15 OFFSET ?';

        if ($stmt = $this->db->prepare($query)) {
            $stmt->bind_param('i', $index);

            $stmt->execute();

            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $posts[] = $row;  // Collect posts in an array
                }
            }

            $stmt->close();
        } else {
            error_log('Database query error: ' . $this->db->error);
        }

        return $posts;
    }
}
