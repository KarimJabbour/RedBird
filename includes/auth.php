<?php
session_start();

// Redirect unauthenticated users to login
if (!isset($_SESSION['user_id'])) {
    header("Content-Type: application/json");
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

// Retrieve the user ID
$userId = $_SESSION['user_id'];

?>
