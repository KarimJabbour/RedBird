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

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);
$pollID = $data['pollID'];
$closeTime = $data['closeTime'];

if (!$pollID || !$closeTime) {
    echo json_encode(["success" => false, "message" => "Invalid poll ID or close time"]);
    exit();
}

// Update the poll's PollCloseDateTime
$stmt = $conn->prepare("UPDATE CreatedPolls SET PollCloseDateTime = ?, Status = 'past' WHERE ID = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Failed to prepare statement: " . $conn->error]);
    exit();
}

$stmt->bind_param("si", $closeTime, $pollID);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Poll closed successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to execute update: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
