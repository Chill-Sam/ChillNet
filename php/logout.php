<?php
session_start();

session_destroy();
header("Location: http://chillsam.ddns.net/");
exit();
?>
