<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "Bookings";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get UserID from request (e.g., passed via GET method)
#$userId = $_GET['userId'];
$userId = -1;

$sql = "SELECT BookingName, RecurrenceFrequency, StartRecurringDate, EndRecurringDate, MeetingDates, RecurrenceDays, StartTime, EndTime, Location
        FROM createdBookings 
        WHERE UserID = $userId AND Status = 'current'";

$result = $conn->query($sql);

$scheduledBookings = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $scheduledBookings[] = $row;
    }
}

header('Content-Type: application/json');
echo json_encode($scheduledBookings);

$conn->close();
?>
