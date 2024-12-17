<?php
function checkNotificationsEnabled($conn, $email) {
    $stmt = $conn->prepare("SELECT notifications_enabled FROM Users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return false; // User not found, assume notifications disabled
    }
    
    $row = $result->fetch_assoc();
    return (bool) $row['notifications_enabled'];
}
?>
