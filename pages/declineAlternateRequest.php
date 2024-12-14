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
$requestID = $data['requestID'];
$status = $data['status'];
$message = $data['message'];

if (!$requestID || !$status) {
    echo json_encode(["success" => false, "message" => "Invalid request ID or status"]);
    exit();
}

// Update the request status and optional message in the database
$stmt = $conn->prepare("UPDATE AlternateRequests SET Status = ?, ResponseMessage = ? WHERE ID = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Failed to prepare statement: " . $conn->error]);
    exit();
}

$stmt->bind_param("ssi", $status, $message, $requestID);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Request declined successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to execute update: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
