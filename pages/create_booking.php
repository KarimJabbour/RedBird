<?php
session_start();
require_once '../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $details = $_POST['details'];
    $time = $_POST['time'];

    $stmt = $conn->prepare('INSERT INTO bookings (user_email, details, time) VALUES (?, ?, ?)');
    $stmt->bind_param('sss', $_SESSION['user'], $details, $time);
    $stmt->execute();

    echo "<p>Booking created successfully!</p>";
}
?>

<h2>Create a Booking</h2>
<form method="POST">
    <label for="details">Booking Details:</label>
    <input type="text" name="details" required>
    <label for="time">Time:</label>
    <input type="datetime-local" name="time" required>
    <button type="submit">Create</button>
</form>
