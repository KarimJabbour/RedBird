<?php
require_once '../includes/auth.php'; // Ensure the user is logged in
$userId = $_SESSION['user_id'];

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo "Booking failed! Try again";
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $bookingName = htmlspecialchars($_POST['booking-name']);
    $frequency = htmlspecialchars($_POST['recurring-timeline']);
    $startDate = htmlspecialchars($_POST['start-date']);
    $endDate = htmlspecialchars($_POST['end-date']);
    $location = htmlspecialchars($_POST['location']);
    $details = htmlspecialchars($_POST['details']);

    $selectedDays = isset($_POST['days']) ? $_POST['days'] : [];
    $recurrenceDays = implode(",", $selectedDays);

    $meetingDates = htmlspecialchars($_POST['highlighted-dates']);
    $meetingDates = '"' . $meetingDates . '"';

    $startTimes = htmlspecialchars($_POST['start-times']);
    $endTimes = htmlspecialchars($_POST['end-times']);
    $startTimes = '"' . $startTimes . '"';
    $endTimes = '"' . $endTimes . '"';

    $recurrenceDays = htmlspecialchars($_POST['recurring-days']);

    $sql = "INSERT INTO CreatedBookings (
                UserID, 
                BookingName,
                RecurrenceFrequency, 
                MeetingDates,
                RecurrenceDays, 
                StartTimes, 
                EndTimes,
                StartRecurringDate, 
                EndRecurringDate,  
                Details,
                Location,  
                Status
            ) VALUES (
                '$userId',
                '$bookingName',
                '$frequency',
                '$meetingDates',
                '$recurrenceDays',
                '$startTimes',
                '$endTimes',
                '$startDate',
                '$endDate',
                '$details',
                '$location',
                'current'
            )";

    if ($conn->query($sql) === TRUE) {
        // Get the ID of the last inserted row
        $lastId = $conn->insert_id;

        // Generate the hashed ID based on the numeric ID
        $hashedID = hash('sha256', $lastId);

        // Update the `hashedID` in the database
        $updateSql = "UPDATE CreatedBookings SET hashedID = ? WHERE ID = ?";
        $stmt = $conn->prepare($updateSql);
        $stmt->bind_param("si", $hashedID, $lastId);

        if ($stmt->execute()) {
            echo '<script>
                setTimeout(function() {
                    window.location.href = "dashboard.html";
                }, 0);
            </script>';
        } else {
            echo "Failed to update hashed ID.";
        }
    } else {
        echo "Booking failed! Try again";
        echo "Error: " . $sql . "<br>" . $conn->error;

        // On failure, user can pick between dashboard or creating booking again
        echo '<button onclick="redirectToForm()">Try Again</button>';
        echo '<button onclick="redirectToDashboard()">Go to Dashboard</button>';
        echo '<script>
                function redirectToForm() {
                    window.location.href = "create_booking.html";
                }
                function redirectToDashboard() {
                    window.location.href = "dashboard.html";
                }
            </script>';
    }
} else {
    echo "Booking failed! Try again";
}

$conn->close();
?>
