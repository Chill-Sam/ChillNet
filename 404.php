<?php
http_response_code(404);  // Set the HTTP status code to 404
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap");

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: "Montserrat", sans-serif;
            overflow: hidden;
        }
    
        html {
            color-scheme: dark !important;
        }
        
        body {
            text-align: center;
            margin-top: 50px;
        }
        h1 {
            font-size: 50px;
            color: red;
        }
        p {
            font-size: 20px;

        }
        a {
            text-decoration: none;
            color: blue;
        }
    </style>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a href="/">Return to Homepage</a>
</body>
</html>
