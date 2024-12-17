<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname ="fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Validate incoming POST data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("POST Data: " . print_r($_POST, true));
    $bookingId = intval($_POST['booking-id'] ?? 0);
    $bookingName = $_POST['booking-name'] ?? '';
    $location = $_POST['location'] ?? '-1';
    $details = $_POST['details'] ?? '';
    $maxAttendees = intval($_POST['maxAttendees'] ?? -1);
    $meetingDates = $_POST['highlighted-dates'] ?? '';
    $meetingDates = '"' . $meetingDates . '"';
    $startTimes = $_POST['start-times'] ?? '';
    $endTimes = $_POST['end-times'] ?? '';
    $recurringDays = $_POST['recurring-days'] ?? '';
    $recurrenceFrequency = $_POST['recurring-timeline'] ?? '';
    $startDate = $_POST['start-date'] ?? '';
    $endDate = $_POST['end-date'] ?? '';
    $startTimes = '"' . $startTimes . '"';
    $endTimes = '"' . $endTimes . '"';

    if (!$bookingId) {

        echo json_encode(["success" => false, "message" => "Invalid booking ID.", "bookingId" => $bookingId]);
        exit();
    }

    // Update the booking in the database
    $stmt = $conn->prepare("UPDATE CreatedBookings 
    SET 
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
    WHERE ID = ?
");

    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Failed to prepare the update statement."]);
        exit();
    }

    $stmt->bind_param(
        "sssisssssssi",
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
        //echo json_encode(["success" => true, "message" => "Booking updated successfully.", "startTimes" => $startTimes, "endTimes" => $endTimes]);
        echo '<script>
                setTimeout(function() {
                    window.location.href = "dashboard.html";
                }, 0);
            </script>';
    } else {
        //echo json_encode(["success" => false, "message" => "Failed to update booking: " . $stmt->error]);
        echo '<button onclick="redirectToForm()">Try Again</button>';
        echo '<button onclick="redirectToDashboard()">Go to Dashboard</button>';
        echo '<script>
                function redirectToForm() {
                    window.location.href = "edit_booking.html?bookingId=' . $bookingId . '";
                }
                function redirectToDashboard() {
                    window.location.href = "dashboard.html";
                }
            </script>';
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}
?>
