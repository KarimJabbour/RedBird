<?php
session_start();
if (!isset($_SESSION['email'])) {
    header('Location: login.php');
    exit;
}

echo "<h1>Welcome to your dashboard, " . htmlspecialchars($_SESSION['email']) . "!</h1>";
?>
<nav>
    <a href="create_booking.php">Create Booking</a>
    <a href="user_settings.php">User Settings</a>
    <a href="logout.php">Logout</a>
</nav>
