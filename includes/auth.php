<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit; // Redirect unauthenticated users to login
}
$userId = $_SESSION['user_id']; // Retrieve the user ID for queries
?>