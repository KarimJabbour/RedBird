<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname ="fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

if (isset($_GET['bookingId'])) {
    $bookingId = intval($_GET['bookingId']);

    $stmt = $conn->prepare("SELECT * FROM CreatedBookings WHERE ID = ?");
    $stmt->bind_param("i", $bookingId);

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $bookingData = $result->fetch_assoc();
        echo json_encode($bookingData); // Return booking data as JSON
    } else {
        echo json_encode(["error" => "No booking found for ID: " . htmlspecialchars($bookingId)]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "No booking ID provided."]);
}

$conn->close();
?>
