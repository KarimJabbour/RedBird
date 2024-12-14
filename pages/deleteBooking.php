<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname ="fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Get the JSON data from the request
$data = json_decode(file_get_contents('php://input'), true);
$bookingId = $data['bookingId'];

if (!$bookingId) {
    echo json_encode(["success" => false, "message" => "Invalid booking ID"]);
    exit();
}

// Prepare the SQL statement to delete the booking
$stmt = $conn->prepare("DELETE FROM createdBookings WHERE ID = ?");
$stmt->bind_param("i", $bookingId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Booking deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete booking"]);
}

$stmt->close();
$conn->close();
?>
