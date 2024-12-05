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
    // echo "<h3>Debugging Output:</h3>";
    // echo "<pre>";
    // print_r($_POST);
    // echo "</pre>";
    
    $pollName = htmlspecialchars($_POST['name']);
    $details = htmlspecialchars($_POST['details']);
    //$timeCardsJson = $_POST['timeCards'] ?? '[]'; // Fallback to empty array if not set
    //var_dump($_POST['timeCards']);

    // $datesStr = $_POST['dates'] ?? ''; // Comma-separated dates
    // $startTimesStr = $_POST['startTimes'] ?? ''; // Comma-separated start times
    // $endTimesStr = $_POST['endTimes'] ?? ''; // Comma-separated end times

    $dates = htmlspecialchars($_POST['dates']);
    $dates = '"' . $dates . '"';
    $startTimes = htmlspecialchars($_POST['startTimes']);
    $startTimes = '"' . $startTimes . '"';
    $endTimes = htmlspecialchars($_POST['endTimes']);
    $endTimes = '"' . $endTimes . '"';

    echo $dates;
    echo $startTimes;
    echo $endTimes;

    // $timeCards = json_decode($timeCardsJson, true);

    //similar logic for date time options
    // $meetingDates = htmlspecialchars($_POST['highlighted-dates']);
    // $meetingDates = '"' . $meetingDates . '"';
    // echo $meetingDates;

    //placeholder value
    $userId = -1;
    // $dateTimeOptions = '" "';

    $sql = "INSERT INTO CreatedPolls (
                UserID, 
                PollName,
                DateOptions,
                StartTimes,
                EndTimes,
                Details,  
                Status
            ) VALUES (
                '$userId',
                '$pollName',
                '$dates',
                '$startTimes',
                '$endTimes',
                '$details',
                'current'
            )";


    if ($conn->query($sql) === TRUE) {
        // Redirect to dashboard if poll creation was successful
        echo '<script>
            setTimeout(function() {
                    window.location.href = "dashboard.html";
                }, 0);
            </script>';
    
    } else {
        echo "Poll creation failed! Try again";
        echo "Error: " . $sql . "<br>" . $conn->error;

        // On failure, user can pick between dashboard or creating poll again
        echo '<button onclick="redirectToForm()">Try Again</button>';
        echo '<button onclick="redirectToDashboard()">Go to Dashboard</button>';
        echo '<script>
                function redirectToForm() {
                    window.location.href = "create_poll.html";
                }
                function redirectToDashboard() {
                    window.location.href = "dashboard.html";
                }
            </script>';
    }

}
else {
    echo "Poll creation failed! Try again";
}

$conn->close();
 
?>
