<?php
require_once __DIR__ . '/vendor/autoload.php';  // Include Ratchet autoload file

use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

class Router implements MessageComponentInterface
{
    private $endpoints = [];

    public function __construct(array $endpoints)
    {
        $this->endpoints = $endpoints;
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $uri = $conn->httpRequest->getUri()->getPath();
        $handler = $this->getHandler($uri);

        if ($handler) {
            $conn->handler = $handler;
            $handler->onOpen($conn);
        } else {
            echo "No handler found for URI: $uri\n";
            $conn->close();
        }
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        if (isset($from->handler)) {
            $from->handler->onMessage($from, $msg);
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        if (isset($conn->handler)) {
            $conn->handler->onClose($conn);
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        if (isset($conn->handler)) {
            $conn->handler->onError($conn, $e);
        }
    }

    private function getHandler($uri)
    {
        return $this->endpoints[$uri] ?? null;
    }
}

include 'postWebsocket.php';

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new Router([
                '/websocket/posts' => new PostWebSocket()
            ])
        )
    ),
    8080
);

echo "WebSocket server running on ws://chillsam.ddns.net:8080\n";
$server->run();
