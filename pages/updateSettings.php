<?php
session_start();
require_once 'db_config.php';

$conn = getDatabaseConnection("Bookings");

$userId = $_SESSION['user_id'];
$defaultLocation = $_POST['default_location'];
$status = $_POST['status'];
$unavailabilityDate = $_POST['unavailability_date'];
$startTime = $_POST['start_time'];
$endTime = $_POST['end_time'];

// Update default location
$stmt = $conn->prepare("UPDATE Users SET default_location = ?, status = ? WHERE id = ?");
$stmt->bind_param("ssi", $defaultLocation, $status, $userId);
$stmt->execute();
$stmt->close();

// Add unavailability
if (!empty($unavailabilityDate) && !empty($startTime) && !empty($endTime)) {
    $stmt = $conn->prepare("INSERT INTO unavailability (user_id, date, start_time, end_time) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $userId, $unavailabilityDate, $startTime, $endTime);
    $stmt->execute();
    $stmt->close();
}

$conn->close();

header("Location: dashboard.php");
exit;
?>
