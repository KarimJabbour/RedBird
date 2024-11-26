<?php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

echo "<h1>Welcome to your dashboard, " . htmlspecialchars($_SESSION['user']) . "!</h1>";
?>

<nav>
    <a href="create_booking.php">Create Booking</a>
    <a href="user_settings.php">User Settings</a>
    <a href="logout.php">Logout</a>
</nav>
