<?php
require_once '../includes/auth.php'; // Ensure the user is logged in

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["error" => "User not logged in."]);
    exit;
}

$userId = intval($_SESSION['user_id']);

// Decode the input JSON
$inputData = json_decode(file_get_contents("php://input"), true);
if (!$inputData) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON payload."]);
    exit;
}

$bookingId = intval($inputData['booking_id']);
$meetingDates = $inputData['MeetingDates'];
$startTimes = $inputData['StartTimes'];
$endTimes = $inputData['EndTimes'];

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

try {
    // Check if the user already booked this booking ID
    $stmt = $conn->prepare("SELECT ID FROM BookingParticipants WHERE BookingID = ? AND UserID = ?");
    $stmt->bind_param("ii", $bookingId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // User already booked. Update the entry
        $stmt->close();
        $stmt = $conn->prepare("
            UPDATE BookingParticipants
            SET MeetingDates = ?, StartTimes = ?, EndTimes = ?
            WHERE BookingID = ? AND UserID = ?
        ");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to prepare the update query: " . $conn->error]);
            exit;
        }
        $stmt->bind_param("sssii", $meetingDates, $startTimes, $endTimes, $bookingId, $userId);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Booking successfully updated."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update booking: " . $stmt->error]);
        }
    } else {
        // User hasn't booked. Insert a new entry
        $stmt->close();
        $stmt = $conn->prepare("
            INSERT INTO BookingParticipants (BookingID, UserID, MeetingDates, StartTimes, EndTimes)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                MeetingDates = VALUES(MeetingDates),
                StartTimes = VALUES(StartTimes),
                EndTimes = VALUES(EndTimes)
        ");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to prepare the insert query: " . $conn->error]);
            exit;
        }
        $stmt->bind_param("iisss", $bookingId, $userId, $meetingDates, $startTimes, $endTimes);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Booking successfully created or updated."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create booking: " . $stmt->error]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $stmt->close();
    $conn->close();
}
?>
