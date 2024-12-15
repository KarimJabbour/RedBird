<?php
session_start();
require_once './users_db.php';

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Fetch user data
    $stmt = $conn->prepare("SELECT email, full_name, role, default_location, notifications_enabled, mcgillID FROM Users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        // Return user data as JSON
        echo json_encode([
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
            'default_location' => $user['default_location'],
            'notifications_enabled' => (bool)$user['notifications_enabled'],
            'mcgillID' => $user['mcgillID']
        ]);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(['error' => 'User not found']);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Failed to fetch user data']);
}
