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

// Get the pollID from the request
$pollID = isset($_GET['pollID']) ? intval($_GET['pollID']) : 0;

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
