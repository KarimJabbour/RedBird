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

// Update status of past bookings
$conn->query("UPDATE createdBookings SET Status = 'past' WHERE Status = 'current' AND EndRecurringDate < CURDATE()");

// Fetch current bookings and polls
$sqlBookings = "SELECT BookingName, RecurrenceFrequency, StartRecurringDate, EndRecurringDate, MeetingDates, RecurrenceDays, StartTime, EndTime, Details, MaxAttendees, TimeSlotLength, Location, MeetingLink, BookingURL
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


// Fetch past bookings
$pastBookingsQuery = "SELECT BookingName, RecurrenceFrequency, StartRecurringDate, EndRecurringDate, MeetingDates, RecurrenceDays, StartTime, EndTime, Location
                      FROM createdBookings 
                      WHERE UserID = -1 AND Status = 'past'";

$resultPastBookings = $conn->query($pastBookingsQuery);

$pastBookings = [];
if ($resultPolls->num_rows > 0) {
    while ($row = $resultPastBookings->fetch_assoc()) {
        $pastBookings[] = $row;
    }
}

$response = [
    'bookings' => $scheduledBookings,
    'polls' => $polls,
    'pastBookings' => $pastBookings,
];

header('Content-Type: application/json');
echo json_encode($response);


$conn->close();
?>
