<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../includes/auth.php'; // Ensure the user is logged in

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["error" => "User not logged in."]);
    exit;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname ="fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

$pollID = intval($_POST['pollID']) ?? null;
$userId = intval($_SESSION['user_id']);

if (!$pollID) {
    echo json_encode(["success" => false, "message" => "Invalid poll ID"]);
    exit();
}

$selectedOptions = json_decode($_POST['selectedOptions'], true);
if (!$selectedOptions) {
    echo json_encode(["success" => false, "message" => "Invalid selections"]);
    exit();
}

// Check if the user has already voted in this poll
$stmt = $conn->prepare("SELECT ID FROM PollVotes WHERE PollID = ? AND UserID = ?");
$stmt->bind_param("ii", $pollID, $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User has already voted: Update their entry in PollVotes
    $existingVoteID = $result->fetch_assoc()['ID'];

    $meetingDatesJson = json_encode(array_column($selectedOptions, 'date'));
    $startTimesJson = json_encode(array_column($selectedOptions, 'startTime'));
    $endTimesJson = json_encode(array_column($selectedOptions, 'endTime'));

    $stmt = $conn->prepare("UPDATE PollVotes SET MeetingDates = ?, StartTimes = ?, EndTimes = ? WHERE ID = ?");
    $stmt->bind_param("sssi", $meetingDatesJson, $startTimesJson, $endTimesJson, $existingVoteID);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Your vote has been updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update your vote: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit();
}

// Retrieve the current VoteCounts
$stmt = $conn->prepare("SELECT DateOptions, StartTimes, VoteCounts FROM CreatedPolls WHERE ID = ?");
$stmt->bind_param("i", $pollID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Poll not found"]);
    exit();
}

$poll = $result->fetch_assoc();
$dateOptions = explode(',', trim($poll['DateOptions'], '"'));
$startTimes = explode(',', trim($poll['StartTimes'], '"'));
$voteCounts = explode(',', trim($poll['VoteCounts'], '"'));

// Prepare data for PollVotes table
$meetingDates = [];
$startTimesData = [];
$endTimesData = [];

// Update the vote counts
foreach ($selectedOptions as $option) {
    $dateIndex = array_search($option['date'], $dateOptions);
    $timeIndex = array_search($option['startTime'], $startTimes);

    if ($dateIndex !== false && $timeIndex !== false && $dateIndex === $timeIndex) {
        $voteCounts[$timeIndex] = intval($voteCounts[$timeIndex]) + 1;

        // Prepare data for PollVotes table
        $meetingDates[] = $option['date'];
        $startTimesData[] = $option['startTime'];
        $endTimesData[] = $option['endTime'];
    }
}

// Save updated VoteCounts to the database
$newVoteCounts = implode(',', $voteCounts);
$stmt = $conn->prepare("UPDATE CreatedPolls SET VoteCounts = ? WHERE ID = ?");
$stmt->bind_param("si", $newVoteCounts, $pollID);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Failed to update vote counts: " . $stmt->error]);
    exit();
}

// Insert into PollVotes table
$meetingDatesJson = json_encode($meetingDates);
$startTimesJson = json_encode($startTimesData);
$endTimesJson = json_encode($endTimesData);
$stmt = $conn->prepare("INSERT INTO PollVotes (PollID, UserID, MeetingDates, StartTimes, EndTimes) VALUES (?, ?, ?, ?, ?)");
if (!$stmt->bind_param("iisss", $pollID, $userId, $meetingDatesJson, $startTimesJson, $endTimesJson)) {
    error_log("Bind failed: " . $stmt->error);
    exit();
}
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Vote counts and poll votes updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to insert poll votes: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
