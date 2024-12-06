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

$sqlBookings = "SELECT BookingName, RecurrenceFrequency, StartRecurringDate, EndRecurringDate, MeetingDates, RecurrenceDays, StartTime, EndTime, Location
        FROM createdBookings 
        WHERE UserID = $userId AND Status = 'current'";

$result = $conn->query($sqlBookings);

$scheduledBookings = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $scheduledBookings[] = $row;
    }
}

$sqlPolls = "SELECT PollName, DateOptions, StartTimes, EndTimes, Details 
             FROM CreatedPolls 
             WHERE UserID = $userId AND Status = 'current'";

$resultPolls = $conn->query($sqlPolls);

$polls = [];
if ($resultPolls->num_rows > 0) {
    while ($row = $resultPolls->fetch_assoc()) {
        $polls[] = $row;
    }
}


$response = [
    'bookings' => $scheduledBookings,
    'polls' => $polls,
];

header('Content-Type: application/json');
echo json_encode($response);


$conn->close();
?>
