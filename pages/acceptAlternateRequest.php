<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "Bookings";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);
error_log("Received payload: " . json_encode($data));

$alternateRequestID = $data['alternateRequestID'];
$date = $data['date'];
$startTime = $data['startTime'];
$endTime = $data['endTime'];
$message = $data['message'] ?? '';

//placeholder value
$userID = -1;

// Validate inputs
if (!$alternateRequestID || !$date || !$startTime || !$endTime) {
    echo json_encode(["success" => false, "message" => "Invalid request data"]);
    exit();
}

// Get the original booking details
$stmt = $conn->prepare("SELECT CB.BookingName, CB.Details, CB.MeetingLink FROM CreatedBookings CB 
                        JOIN AlternateRequests AR ON AR.LinkedBookingID = CB.ID 
                        WHERE AR.ID = ?");

if (!$stmt) {
    error_log("Prepare statement failed: " . $conn->error);
    echo json_encode(["success" => false, "message" => "Prepare statement failed"]);
    exit();
}

$stmt->bind_param("i", $alternateRequestID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    error_log("Original booking not found for AlternateRequestID=$alternateRequestID");
    echo json_encode(["success" => false, "message" => "Original booking not found"]);
    exit();
}

$originalBooking = $result->fetch_assoc();
$alternateBookingName = "Alternate - " . $originalBooking['BookingName'];
$details = $originalBooking['Details'];
$meetingLink = $originalBooking['MeetingLink'];

// Insert the new alternate booking
$stmt = $conn->prepare("INSERT INTO CreatedBookings (UserID, BookingName, RecurrenceFrequency, MeetingDates, RecurrenceDays, StartTimes, EndTimes, StartRecurringDate, EndRecurringDate, Details, MeetingLink, Status) 
                        VALUES (?, ?,'non-recurring', ?, '', ?, ?, ?, ?, ?, ?, 'current')");

$startDate = $date;
$endDate = $date;
$startTimes = '"' . $startTime . '"';
$endTimes = '"' . $endTime . '"';
$date = '"' . $date . '"';

$stmt->bind_param("issssssss", $userID, $alternateBookingName, $date, $startTimes, $endTimes, $startDate, $endDate, $details, $meetingLink);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Failed to create alternate booking: " . $stmt->error]);
    exit();
}

// Update the status of the alternate request to 'accepted'
$stmt = $conn->prepare("UPDATE AlternateRequests SET Status = 'accepted', ResponseMessage = ? WHERE ID = ?");
$stmt->bind_param("si", $message, $alternateRequestID);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Booking has been created for alternate request. Optionally, make any adjustments now."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update alternate request: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
