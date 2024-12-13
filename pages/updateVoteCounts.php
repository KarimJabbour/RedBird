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

$pollID = $_POST['pollID'] ?? null;
if (!$pollID) {
    echo json_encode(["success" => false, "message" => "Invalid poll ID"]);
    exit();
}

$selectedOptions = json_decode($_POST['selectedOptions'], true);
if (!$selectedOptions) {
    echo json_encode(["success" => false, "message" => "Invalid selections"]);
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

// Update the vote counts
foreach ($selectedOptions as $option) {
    $dateIndex = array_search($option['date'], $dateOptions);
    $timeIndex = array_search($option['startTime'], $startTimes);

    if ($dateIndex !== false && $timeIndex !== false && $dateIndex === $timeIndex) {
        $voteCounts[$timeIndex] = intval($voteCounts[$timeIndex]) + 1;
    }
}

// Save updated VoteCounts to the database
$newVoteCounts = implode(',', $voteCounts);
$stmt = $conn->prepare("UPDATE CreatedPolls SET VoteCounts = ? WHERE ID = ?");
$stmt->bind_param("si", $newVoteCounts, $pollID);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Vote counts updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update vote counts: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
