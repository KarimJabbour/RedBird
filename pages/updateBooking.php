<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "Bookings";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Validate incoming POST data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("POST Data: " . print_r($_POST, true));
    $bookingId = intval($_POST['bookingId'] ?? 0);
    $bookingName = $_POST['booking-name'] ?? '';
    $location = $_POST['location'] ?? '-1';
    $details = $_POST['details'] ?? '';
    $maxAttendees = intval($_POST['maxAttendees'] ?? -1);
    $meetingDates = $_POST['highlighted-dates'] ?? '';
    $startTimes = $_POST['start-times'] ?? '';
    $endTimes = $_POST['end-times'] ?? '';
    $recurringDays = $_POST['recurring-days'] ?? '';
    $recurrenceFrequency = $_POST['recurring-timeline'] ?? '';
    $startDate = $_POST['start-date'] ?? '';
    $endDate = $_POST['end-date'] ?? '';

    if (!$bookingId) {
        echo json_encode(["success" => false, "message" => "Invalid booking ID."]);
        exit();
    }

    // Update the booking in the database
    $stmt = $conn->prepare("UPDATE CreatedBookings SET 
        BookingName = ?, 
        Location = ?, 
        Details = ?, 
        MaxAttendees = ?, 
        MeetingDates = ?, 
        StartTimes = ?, 
        EndTimes = ?, 
        RecurrenceDays = ?, 
        RecurrenceFrequency = ?, 
        StartRecurringDate = ?, 
        EndRecurringDate = ? 
        WHERE ID = ?");

    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Failed to prepare the update statement."]);
        exit();
    }

    $stmt->bind_param(
        "sssisisssssi",
        $bookingName,
        $location,
        $details,
        $maxAttendees,
        $meetingDates,
        $startTimes,
        $endTimes,
        $recurringDays,
        $recurrenceFrequency,
        $startDate,
        $endDate,
        $bookingId
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Booking updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update booking: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}
?>
