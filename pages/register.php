<?php
session_start();
require_once '../includes/users_db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    // Check if all fields are filled
    if (empty($email) || empty($password) || empty($confirm_password)) {
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
        // Check for duplicate email
        $stmt = $conn->prepare("SELECT COUNT(*) FROM Users WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $error = 'Email is already registered.';
        } else {
            // Insert user into the database
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
            $stmt->bind_param('ss', $email, $hashed_password);

            if ($stmt->execute()) {
                $success = 'Registration successful! Please log in.';
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
                    <button type="submit" class="btn-submit">Register</button>
                </div>
                <p class="links">
                    <a href="login.php">Already have an account? Log in here.</a>
                </p>
            </form>
        </div>
    </div>
</body>
</html>
