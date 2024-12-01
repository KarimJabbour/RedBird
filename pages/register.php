<?php
require_once '../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'];

    // Validate if the email belongs to McGill
    if ($email && preg_match('/@(mcgill\.ca|mail\.mcgill\.ca)$/', $email)) {
        if ($password) {
            // Hash the password for security
            $hashed_password = password_hash($password, PASSWORD_BCRYPT);

            // Insert into the database
            $stmt = $conn->prepare('INSERT INTO users (email, password) VALUES (?, ?)');
            $stmt->bind_param('ss', $email, $hashed_password);

            if ($stmt->execute()) {
                echo "Registration successful!";
            } else {
                echo "Error: " . $stmt->error;
            }
        } else {
            echo "Password cannot be empty.";
        }
    } else {
        echo "Invalid email. Please use a McGill email.";
    }
}
?>

<h2>Register</h2>
<form method="POST">
    <input type="email" name="email" placeholder="Email" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Register</button>
</form>
