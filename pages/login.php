<?php
session_start();
require_once '../includes/users_db.php';

// Check if user is already logged in
if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    header('Location: dashboard.html');
    exit;
}
$error = '';

if (!$conn) {
    die('Database connection failed: ' . mysqli_connect_error());
}


if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    if (empty($email) || empty($password)) {
        $error = 'Email and password are required.';
    } else {
        $stmt = $conn->prepare("SELECT id, password FROM Users WHERE email = ?");
        if (!$stmt) {
            die('Query preparation failed: ' . $conn->error);
        }
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            header("Location: dashboard.html");
            exit;
        } else {
            $error = 'Invalid email or password.';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="../assets/css/login.css">
</head>

<body>

    <div class="container">

        <!-- Navigation Bar -->
        <nav class="navbar">
            <div class="logo">
                <a href="landing.html">
                    <a href="landing.html"><img src="Images/logo.png" alt="RedBird Logo" class="logo-img">RedBird Roster</a>
                </a>
            </div>
        </nav>

        <!-- Centered Login Box -->
        <div class="main-content">
            <div class="form-container">
                <img src="Images/logo.png" alt="Logo" class="dialog-logo" style="width: 80px; margin-bottom: 20px;">
                <h1>Login</h1>
                <form action="login.php" method="POST">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="text" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn-submit">Login</button>
                </form>
                <p class="links">
                    <a href="register.php">No account? Register Here</a>
                </p>
            </div>
        </div>

    </div>

</body>

</html>
