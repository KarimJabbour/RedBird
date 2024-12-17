<?php
session_start();
require_once '../includes/users_db.php';

// Check if user is already logged in
if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    header('Location: dashboard.html');
    exit;
}

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

    // Validation and Registration Logic
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
        // Check if the email is already registered
        $stmt = $conn->prepare("SELECT id FROM Users WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->bind_result($existing_user_id);
        $stmt->fetch();
        $stmt->close();

        if ($existing_user_id) {
            $error = 'Email is already registered. Please log in.';
        } else {
            // Register new user
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("
                INSERT INTO Users (email, password, full_name, role, default_location, notifications_enabled)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->bind_param('sssssi', $email, $hashed_password, $full_name, $role, $default_location, $notifications_enabled);

            if ($stmt->execute()) {
                $_SESSION['user_id'] = $conn->insert_id;
                header('Location: dashboard.html');
                exit;
            } else {
                $error = 'An error occurred. Please try again.';
            }

            $stmt->close();
        }
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

        function validateStep1() {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm_password').value.trim();

            // Email Validation
            const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:mail\.)?mcgill\.ca$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid McGill email address.');
                return false;
            }

            // Password Validation
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                alert('Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number.');
                return false;
            }

            // Confirm Password Validation
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return false;
            }

            // If all validations pass
            showStep2();
            return true;
        }

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

    <div class="container">

        <!-- Navigation Bar -->
        <nav class="navbar">
            <div class="logo">
                <a href="landing.html">
                    <img src="Images/logo.png" alt="RedBird Logo" class="logo-img">RedBird Roster
                </a>
            </div>
        </nav>

        <!-- Register Box -->
        <div class="main-content">
            <div class="form-container">
                <img src="Images/logo.png" alt="Logo" class="dialog-logo">
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
                            <button type="button" class="btn-submit" onclick="validateStep1()">Next</button>
                        </div>
                        <p class="links">
                            <a href="login.php">Already have an account? Login Here</a>
                        </p>
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
                            <label for="default_location">Default Meeting Location (Optional):</label>
                            <input type="text" id="default_location" name="default_location">
                        </div>
                        <div class="form-group">
                            <label class="emailcheckbox">
                                <input type="checkbox" id="notifications_enabled" name="notifications_enabled" value="1" checked>
                                Enable Email Notifications
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

    </div>

</body>

</html>
