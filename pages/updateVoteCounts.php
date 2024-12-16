<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Decode the input data
$inputData = json_decode(file_get_contents("php://input"), true);

if (!$inputData) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON payload."]);
    exit();
}

$pollID = $inputData['pollID'] ?? null;

if (!$pollID) {
    echo json_encode(["success" => false, "message" => "Invalid poll ID."]);
    exit();
}

// Match the hashed ID to its numeric ID
$stmt = $conn->prepare("SELECT ID FROM CreatedPolls WHERE hashedID = ?");
$stmt->bind_param("s", $pollID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Poll not found."]);
    exit();
}

$pollID = $result->fetch_assoc()['ID'];

// Retrieve input form user data
$userId = $_SESSION['user_id'] ?? null;
$fullName = $inputData['fullname'] ?? null;
$email = $inputData['email'] ?? null;
$mcgillID = $inputData['mcgillid'] ?? null;
$selectedOptions = $inputData['selectedOptions'] ?? [];

if (!$selectedOptions) {
    echo json_encode(["success" => false, "message" => "No options selected."]);
    exit();
}

// Check if the user has already voted
if ($userId) {
    $stmt = $conn->prepare("SELECT ID FROM PollVotes WHERE PollID = ? AND UserID = ?");
    $stmt->bind_param("ii", $pollID, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["duplicate" => true, "message" => "You cannot vote more than once."]);
        exit();
    }
}

// Retrieve the current VoteCounts
$stmt = $conn->prepare("SELECT DateOptions, StartTimes, VoteCounts FROM CreatedPolls WHERE ID = ?");
$stmt->bind_param("i", $pollID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Poll not found."]);
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

if ($userId) {
    $stmt = $conn->prepare("INSERT INTO PollVotes (PollID, UserID, FullName, Email, McGillID, MeetingDates, StartTimes, EndTimes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iissssss", $pollID, $userId, $fullName, $email, $mcgillID, $meetingDatesJson, $startTimesJson, $endTimesJson);
}else {
    $stmt = $conn->prepare("INSERT INTO PollVotes (PollID, FullName, Email, McGillID, MeetingDates, StartTimes, EndTimes) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", $pollID, $fullName, $email, $mcgillID, $meetingDatesJson, $startTimesJson, $endTimesJson);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "You have successfully voted."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to insert poll votes: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
