<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Settings</title>
    <!-- Link Common and Page-Specific CSS -->
    <link rel="stylesheet" href="../assets/css/dashboard.css">
    <link rel="stylesheet" href="../assets/css/user_settings.css">
</head>
<body>
    <!-- Header -->
    <div class="navbar">
        <div class="logo">
            <img src="../assets/images/logo.png" alt="Logo" class="logo-img">
            RedBird Roster
        </div>
        <ul class="nav-links">
            <li><a href="dashboard.php">Dashboard</a></li>
            <li><a href="user_settings.php" class="active">Settings</a></li>
            <li><a href="logout.php">Logout</a></li>
        </ul>
    </div>

    <!-- Main Content -->
    <div class="container">
        <h1 class="page-title">User Settings</h1>
        <div class="user-info">
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Email:</strong> john.doe@example.com</p>
        </div>

        <form action="updateSettings.php" method="POST" class="form-container">
            <!-- Reset Password -->
            <div class="form-group">
                <label for="reset-password">Reset Password:</label>
                <button type="button" id="reset-password" onclick="resetPassword()" class="btn">Reset Password</button>
            </div>

            <!-- Default Room/Office Location -->
            <div class="form-group">
                <label for="default-location">Default Room/Office Location:</label>
                <input type="text" id="default-location" name="default_location" placeholder="Enter location">
            </div>

            <!-- Status -->
            <div class="form-group">
                <label for="status">Set Status:</label>
                <select id="status" name="status">
                    <option value="Professor">Professor</option>
                    <option value="TA">TA</option>
                    <option value="Student">Student</option>
                </select>
            </div>

            <!-- Unavailability Dates -->
            <div class="form-group">
                <label>Set Unavailability Dates:</label>
                <input type="date" id="unavailability-date" name="unavailability_date">
                <input type="time" id="start-time" name="start_time">
                <input type="time" id="end-time" name="end_time">
                <button type="button" onclick="addUnavailability()" class="btn">Add Time Slot</button>
                <div id="unavailability-list">
                    <!-- Dynamically list unavailable slots -->
                </div>
            </div>

            <!-- Save Button -->
            <div class="form-group">
                <button type="submit" class="btn-submit">Save Changes</button>
            </div>
        </form>
    </div>
</body>
<script src="../assets/js/userSettings.js"></script>
</html>
