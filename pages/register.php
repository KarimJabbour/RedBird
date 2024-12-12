<?php
error_reporting(E_ALL); // Report all errors
ini_set('display_errors', 1); // Display errors on the page
session_start();
require_once '../includes/users_db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $full_name = trim($_POST['full_name']);
    $role = $_POST['role'];
    $default_location = trim($_POST['default_location']);
    $notifications_enabled = isset($_POST['notifications_enabled']) ? 1 : 0;

    // Validate all fields
    if (empty($email) || empty($password) || empty($confirm_password) || empty($full_name) || empty($role)) {
        $error = 'All fields are required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Invalid email format.';
    } elseif (!preg_match('/@(?:mail\.)?mcgill\.ca$/', $email)) {
        $error = 'Email must be a McGill address.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } elseif (!preg_match('/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/', $password)) {
        $error = 'Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a number.';
    } else {
        // Insert user into the database
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("
            INSERT INTO users (email, password, full_name, role, default_location, notifications_enabled) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param('sssssi', $email, $hashed_password, $full_name, $role, $default_location, $notifications_enabled);

        if ($stmt->execute()) {
            $success = 'Registration successful! Please log in.';
        } else {
            $error = 'An error occurred. Please try again.';
        }

        $stmt->close();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="../assets/css/register.css">
    <script>
        function showStep2() {
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'block';
        }

        function goBackToStep1() {
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step1').style.display = 'block';
        }
    </script>
</head>
<body>
    <nav class="navbar">
        <div class="logo">
            <img src="Images/logo.png" alt="Logo" class="logo-img">RedBird Roster
        </div>
    </nav>
    <div class="register-container">
        <div class="form-container">
            <h1>Register</h1>
            <?php if ($error): ?>
                <p class="error-message"><?php echo htmlspecialchars($error); ?></p>
            <?php elseif ($success): ?>
                <p class="success-message"><?php echo htmlspecialchars($success); ?></p>
            <?php endif; ?>
            <form method="POST" action="register.php">
                <!-- Step 1 -->
                <div id="step1">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirm_password">Confirm Password:</label>
                        <input type="password" id="confirm_password" name="confirm_password" required>
                    </div>
                    <div class="form-buttons">
                        <button type="button" class="btn-submit" onclick="showStep2()">Next</button>
                    </div>
                </div>

                <!-- Step 2 -->
                <div id="step2" style="display: none;">
                    <div class="form-group">
                        <label for="full_name">Full Name:</label>
                        <input type="text" id="full_name" name="full_name" required>
                    </div>
                    <div class="form-group">
                        <label for="role">Role:</label>
                        <select id="role" name="role" required>
                            <option value="Professor">Professor</option>
                            <option value="TA">TA</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="default_location">Default Location:</label>
                        <input type="text" id="default_location" name="default_location">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="notifications_enabled" name="notifications_enabled" value="1" checked>
                            Enable Notifications
                        </label>
                    </div>
                    <div class="form-buttons">
                        <button type="button" class="btn-submit" onclick="goBackToStep1()">Back</button>
                        <button type="submit" class="btn-submit">Register</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</body>
</html>
