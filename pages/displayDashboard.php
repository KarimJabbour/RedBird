<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php"); // Redirect to login
    exit;
}
require_once '../includes/auth.php'; // Ensure the user is logged in
$userId = $_SESSION['user_id'];
$servername = "localhost";
$username = "root";
$password = "";
$dbname ="fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get UserID from request (e.g., passed via GET method)
#$userId = $_GET['userId'];
// $userId = -1;

// Update status of past bookings and past polls
$conn->query("UPDATE CreatedBookings SET Status = 'past' WHERE Status = 'current' AND EndRecurringDate < CURDATE()");
$conn->query("UPDATE CreatedPolls SET Status = 'past' WHERE Status = 'current' AND PollCloseDateTime < NOW()");

// Fetch current bookings and polls
$sqlBookings = "SELECT ID, BookingName, RecurrenceFrequency, StartRecurringDate, EndRecurringDate, MeetingDates, StartTimes, EndTimes, RecurrenceDays, Details, MaxAttendees, TimeSlotLength, Location, MeetingLink, BookingURL
        FROM CreatedBookings 
        WHERE UserID = $userId AND Status = 'current'";

$result = $conn->query($sqlBookings);

$scheduledBookings = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $scheduledBookings[] = $row;
    }
}

$sqlPolls = "SELECT ID, PollName, DateOptions, StartTimes, EndTimes, Details, PollCloseDateTime, VoteCounts 
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
$pastBookingsQuery = "SELECT BookingName, RecurrenceFrequency, StartRecurringDate, EndRecurringDate, MeetingDates, RecurrenceDays, StartTimes, EndTimes, Location
                      FROM CreatedBookings 
                      WHERE UserID = -1 AND Status = 'past'";

$resultPastBookings = $conn->query($pastBookingsQuery);

$pastBookings = [];
if ($resultPastBookings->num_rows > 0) {
    while ($row = $resultPastBookings->fetch_assoc()) {
        $pastBookings[] = $row;
    }
}

// Fetch past polls
$pastPollsQuery = "SELECT ID, PollName, DateOptions, StartTimes, EndTimes, Details, PollCloseDateTime, VoteCounts 
                    FROM CreatedPolls 
                    WHERE UserID = $userId AND Status = 'past'";

$resultPastPolls = $conn->query($pastPollsQuery);

$pastPolls = [];
if ($resultPastPolls->num_rows > 0) {
    while ($row = $resultPastPolls->fetch_assoc()) {
        $pastPolls[] = $row;
    }
}

// Fetch alternate requests for bookings created by the logged-in user
$sqlAlternateRequests = "
    SELECT ar.*, cb.BookingName 
    FROM AlternateRequests ar
    JOIN CreatedBookings cb ON ar.LinkedBookingID = cb.ID
    WHERE cb.UserID = ? AND ar.Status='pending'";

$stmtAlternateRequests = $conn->prepare($sqlAlternateRequests);
$stmtAlternateRequests->bind_param("i", $userId);
$stmtAlternateRequests->execute();
$resultAlternateRequests = $stmtAlternateRequests->get_result();

$alternateRequests = [];
while ($row = $resultAlternateRequests->fetch_assoc()) {
    $alternateRequests[] = $row;
}

$response = [
    'bookings' => $scheduledBookings,
    'polls' => $polls,
    'pastBookings' => $pastBookings,
    'pastPolls' => $pastPolls,
    'alternateRequests' => $alternateRequests,
];
if (empty($response)) {
    echo json_encode(['error' => 'No data found']);
    exit;
}

header('Content-Type: application/json');
echo json_encode($response);


$conn->close();
?>
