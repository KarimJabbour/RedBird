<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname ="fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

$pollID = $_GET['pollID'] ?? null;

if (!$pollID) {
    echo json_encode(["success" => false, "message" => "Invalid or missing poll ID"]);
    exit();
}

// Match the hashed ID to its numeric ID
$stmt = $conn->prepare("SELECT ID FROM CreatedPolls WHERE hashedID = ?");
$stmt->bind_param("s", $pollID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Poll not found"]);
    exit();
}

$pollID = $result->fetch_assoc()['ID'];

if ($pollID === 0) {
    echo json_encode(["success" => false, "message" => "Invalid poll ID"]);
    exit();
}

// Query the database for poll details
$stmt = $conn->prepare("SELECT PollName, Details, PollCloseDateTime, DateOptions, StartTimes, EndTimes, VoteCounts FROM CreatedPolls WHERE ID = ?");
$stmt->bind_param("i", $pollID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Poll not found"]);
    exit();
}

$poll = $result->fetch_assoc();

// Parse the comma-separated fields into arrays
$poll['DateOptions'] = explode(',', trim($poll['DateOptions'], '"'));
$poll['StartTimes'] = explode(',', trim($poll['StartTimes'], '"'));
$poll['EndTimes'] = explode(',', trim($poll['EndTimes'], '"'));
$poll['VoteCounts'] = explode(',', trim($poll['VoteCounts'], '"'));

echo json_encode(["success" => true, "poll" => $poll]);

$stmt->close();
$conn->close();
?>
