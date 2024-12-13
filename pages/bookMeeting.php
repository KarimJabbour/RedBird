<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'Bookings';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

$bookingId = 58; //Replace this with the actual ID from the URL

$sql = "SELECT BookingName, MeetingDates, StartTimes, EndTimes, Details, Location FROM createdBookings WHERE ID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $bookingId);

if (!$stmt->execute()) {
    echo json_encode(["error" => "Query execution failed: " . $stmt->error]);
    exit();
}

$result = $stmt->get_result();
$bookings = $result->fetch_assoc();

$bookings['MeetingDates'] = explode(',', trim($bookings['MeetingDates'], '"'));
$bookings['StartTimes'] = explode(',', trim($bookings['StartTimes'], '"'));
$bookings['EndTimes'] = explode(',', trim($bookings['EndTimes'], '"'));
echo json_encode($bookings);

$stmt->close();
$conn->close();
?>
