<?php
session_start();
require_once '../includes/users_db.php';

// Redirect to login if the user is not logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$user_id = $_SESSION['user_id'];
$error = '';
$success = '';

// Fetch user data
try {
    $stmt = $conn->prepare("SELECT email, full_name, role, default_location, notifications_enabled, mcgillID FROM Users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($email, $full_name, $role, $default_location, $notifications_enabled, $mcgillID);
    $stmt->fetch();
    $stmt->close();
} catch (Exception $e) {
    $error = "Error loading user data: " . $e->getMessage();
}


// Handle form submission to update user data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = trim($_POST['full_name']);
    $role = $_POST['role'];
    $default_location = trim($_POST['default_location']);
    $notifications_enabled = isset($_POST['notifications_enabled']) ? 1 : 0;
    $mcgillID = trim($_POST['mcgillID']);

    try {
        $stmt = $conn->prepare("UPDATE Users SET full_name = ?, role = ?, default_location = ?, notifications_enabled = ?, mcgillID = ? WHERE id = ?");
        $stmt->bind_param("sssisi", $full_name, $role, $default_location, $notifications_enabled, $mcgillID, $user_id);
        $stmt->execute();
        $stmt->close();
        $success = "Settings updated successfully!";
    } catch (Exception $e) {
        $error = "Error updating settings: " . $e->getMessage();
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Settings</title>
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../assets/css/user_settings.css">
</head>
<body>
    <div class="container">
        <nav class="navbar">
            <div class="logo">
            <img
                src="Images/logo.png"
                alt="RedBird Logo"
                class="logo-img"
            />RedBird Roster
            </div>
            <ul class="nav-links">
                <li>
                    <a href="dashboard.html" class="<?= basename($_SERVER['PHP_SELF']) == 'dashboard.php' ? 'active' : '' ?>">
                        <i class="fas fa-tachometer-alt"></i> &nbsp;Dashboard
                    </a>
                </li>
                <li>
                    <a href="create_booking.html" class="<?= basename($_SERVER['PHP_SELF']) == 'create_booking.php' ? 'active' : '' ?>">
                        <i class="fas fa-calendar-plus"></i> &nbsp; Create Booking
                    </a>
                </li>
                <li>
                    <a href="user_settings.php" class="<?= basename($_SERVER['PHP_SELF']) == 'user_settings.php' ? 'active' : '' ?>">
                        <i class="fas fa-user-cog"></i> &nbsp; User Settings
                    </a>
                </li>
                <li>
                    <a href="logout.php" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> &nbsp;Logout
                    </a>
                </li>
            </ul>
        </nav>
        <h1 class="page-title">User Settings</h1>

        <?php if ($error): ?>
            <p style="color: red;"><?= htmlspecialchars($error) ?></p>
        <?php elseif ($success): ?>
            <p style="color: green;"><?= htmlspecialchars($success) ?></p>
        <?php endif; ?>

        <form action="user_settings.php" method="POST" class="form-container">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="<?= htmlspecialchars($email) ?>" readonly>
            </div>
            <div class="form-group">
                <label for="full_name">Full Name:</label>
                <input type="text" id="full_name" name="full_name" value="<?= htmlspecialchars($full_name) ?>" required>
            </div>
            <div class="form-group">
                <label for="role">Role:</label>
                <select id="role" name="role" required>
                    <option value="Professor" <?= $role === 'Professor' ? 'selected' : '' ?>>Professor</option>
                    <option value="TA" <?= $role === 'TA' ? 'selected' : '' ?>>TA</option>
                    <option value="Student" <?= $role === 'Student' ? 'selected' : '' ?>>Student</option>
                </select>
            </div>
            <div class="form-group">
                <label for="default_location">Default Location:</label>
                <input type="text" id="default_location" name="default_location" value="<?= htmlspecialchars($default_location) ?>">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="notifications_enabled" name="notifications_enabled" <?= $notifications_enabled ? 'checked' : '' ?>>
                    Enable Notifications
                </label>
            </div>
            <div class="form-group">
                <label for="mcgillID">McGill ID:</label>
                <input type="text" id="mcgillID" name="mcgillID" value="<?= htmlspecialchars($mcgillID) ?>" required>
            </div>
            <div class="form-group">
                <button type="submit" class="btn-submit">Save Changes</button>
            </div>
        </form>
    </div>
</body>
</html>
