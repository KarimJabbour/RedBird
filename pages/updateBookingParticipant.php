<?php
session_start();

// Decode the input JSON
$inputData = json_decode(file_get_contents("php://input"), true);
if (!$inputData) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON payload."]);
    exit;
}

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

$stmt = $conn->prepare("SELECT ID FROM CreatedBookings WHERE hashedID = ?");
$stmt->bind_param("s", $inputData['booking_id']);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    http_response_code(404); // Not Found
    echo json_encode(["error" => "Booking not found"]);
    exit();
}
$bookingId = $result->fetch_assoc()['ID'];
$meetingDates = $inputData['MeetingDates'];
$startTimes = $inputData['StartTimes'];
$endTimes = $inputData['EndTimes'];
$fullName = $inputData['full_name'] ?? null;
$email = $inputData['email'] ?? null;
$mcgillID = $inputData['mcgill_id'] ?? null;


// Determine if a UserID exists (session login)
$userId = $_SESSION['user_id'] ?? null;

try {

// Check MaxAttendees
$sql = "SELECT MaxAttendees FROM CreatedBookings WHERE ID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $bookingId);
$stmt->execute();
$result = $stmt->get_result();
$maxAttendees = $result->fetch_assoc()['MaxAttendees'];

    if ($maxAttendees > 0) {
        $stmt = $conn->prepare("
            SELECT COUNT(*) AS participantCount
            FROM BookingParticipants
            WHERE BookingID = ? AND MeetingDates = ? AND StartTimes = ? AND EndTimes = ?
        ");
        $stmt->bind_param("isss", $bookingId, $meetingDates, $startTimes, $endTimes);
        $stmt->execute();
        $result = $stmt->get_result();
        $participantCount = $result->fetch_assoc()['participantCount'];

        if ($participantCount >= $maxAttendees) {
            http_response_code(403);
            echo json_encode(["error" => "Max capacity reached for this time slot."]);
            exit();
        }
    }



    if ($userId) {
        // Case 1: Logged-in user
        $stmt = $conn->prepare("
            SELECT ID FROM BookingParticipants WHERE BookingID = ? AND UserID = ?
        ");
        $stmt->bind_param("ii", $bookingId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
    
        $stmt->close();
        $stmt = $conn->prepare("
            INSERT INTO BookingParticipants (BookingID, UserID, Email, McGillID, FullName, MeetingDates, StartTimes, EndTimes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("iissssss", $bookingId, $userId, $email, $mcgillID, $fullName, $meetingDates, $startTimes, $endTimes);
    } else {
        // Case 2: Anonymous user
        $stmt = $conn->prepare("
            INSERT INTO BookingParticipants (BookingID, Email, McGillID, FullName, MeetingDates, StartTimes, EndTimes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                MeetingDates = VALUES(MeetingDates),
                StartTimes = VALUES(StartTimes),
                EndTimes = VALUES(EndTimes),
                FullName = VALUES(FullName),
                Email = VALUES(Email),
                McGillID = VALUES(McGillID)
        ");
        $stmt->bind_param("issssss", $bookingId, $email, $mcgillID, $fullName, $meetingDates, $startTimes, $endTimes);
    }
    
    if ($stmt->execute()) {
        echo json_encode(["success" => "Booking successfully created or updated."]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to save booking: " . $stmt->error]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
?>
