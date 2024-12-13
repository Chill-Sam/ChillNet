#!/bin/bash

# Define the name of the PHP script and the log file
SCRIPT="router.php"
LOG_FILE="output.log"

# Check if the WebSocket service is running
PID=$(ps aux | grep "$SCRIPT" | grep -v "grep" | awk '{print $2}')

if [ -n "$PID" ]; then
  echo "Stopping WebSocket service with PID: $PID"
  kill "$PID"
  sleep 2
else
  echo "WebSocket service is not running."
fi

echo "Starting WebSocket service..."
nohup php -q "$SCRIPT" > "$LOG_FILE" 2>&1 &

NEW_PID=$!
echo "WebSocket service started with PID: $NEW_PID"

