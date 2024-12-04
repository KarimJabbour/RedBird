<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "Bookings";

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
    $startTime = htmlspecialchars($_POST['start-time']); // Submitted in 24-hour format
    $endTime = htmlspecialchars($_POST['end-time']);     // Submitted in 24-hour format
    $location = htmlspecialchars($_POST['location']);
    $details = htmlspecialchars($_POST['details']);
    // $maxAttendees = htmlspecialchars($_POST['max-attendees']);
    // $timeSlotLength = htmlspecialchars($_POST['time-slot']);
    // $attachmentLink = htmlspecialchars($_POST['attachment-link']);
    // $meetingLink = htmlspecialchars($_POST['meeting-link']);

    $selectedDays = isset($_POST['days']) ? $_POST['days'] : [];
    $recurrenceDays = implode(",", $selectedDays);

    $meetingDates = htmlspecialchars($_POST['highlighted-dates']);
    $meetingDates = '"' . $meetingDates . '"';
    echo $meetingDates;

    
    $recurrenceDays = htmlspecialchars($_POST['recurring-days']);
    echo "RecurrenceDays: " . $recurrenceDays;

    //placeholder value
    $userId = -1;
    //$meetingDates = '" "';
    //$recurrenceDays = " ";

    $sql = "INSERT INTO createdBookings (
                UserID, 
                BookingName,
                RecurrenceFrequency, 
                MeetingDates,
                RecurrenceDays, 
                StartTime, 
                EndTime,
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
                '$startTime',
                '$endTime',
                '$startDate',
                '$endDate',
                '$details',
                '$location',
                'current'
            )";


    if ($conn->query($sql) === TRUE) {
        // Redirect to dashboard if booking was successful
        echo '<script>
            setTimeout(function() {
                    window.location.href = "dashboard.html";
                }, 0);
            </script>';
    
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

}
else {
    echo "Booking failed! Try again";
}

$conn->close();
 
?>
