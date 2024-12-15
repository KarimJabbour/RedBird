<?php
require_once '../includes/auth.php'; // Ensure the user is logged in

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["error" => "User not logged in."]);
    exit;
}

$userId = intval($_SESSION['user_id']);

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
    die("Connection failed: " . $conn->connect_error);
}

try {
    // Insert or update the BookingParticipants table
    $stmt = $conn->prepare("
        INSERT INTO BookingParticipants (BookingID, UserID, MeetingDates, StartTimes, EndTimes)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            MeetingDates = VALUES(MeetingDates),
            StartTimes = VALUES(StartTimes),
            EndTimes = VALUES(EndTimes)
    ");
    $stmt->bind_param("iisss", $bookingId, $userId, $meetingDates, $startTimes, $endTimes);

    if ($stmt->execute()) {
        echo json_encode(["success" => "Booking successfully updated."]);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(["error" => "Failed to update booking."]);
    }
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $conn->close();
}
?>
