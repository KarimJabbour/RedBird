<?php
session_start();

// Redirect unauthenticated users to login
if (!isset($_SESSION['user_id'])) {
    header("Content-Type: application/json");
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

// Retrieve the user ID
$userId = $_SESSION['user_id'];

// // Handle API requests
// if ($_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
//     header("Content-Type: application/json");
//     echo json_encode(['user_id' => $userId]);
//     exit;
// }

// // Default behavior for non-AJAX requests
// function getUserId() {
//     global $userId;
//     return $userId;
// }
?>
