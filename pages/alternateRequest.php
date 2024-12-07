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
    
    $name = htmlspecialchars($_POST['name']);
    $email = $_POST['email'];
    $details = htmlspecialchars($_POST['details']);

    $dates = htmlspecialchars($_POST['dates']);
    $dates = '"' . $dates . '"';
    $startTimes = htmlspecialchars($_POST['startTimes']);
    $startTimes = '"' . $startTimes . '"';
    $endTimes = htmlspecialchars($_POST['endTimes']);
    $endTimes = '"' . $endTimes . '"';

    // echo $dates;
    // echo $startTimes;
    // echo $endTimes;

    //placeholder value
    $userId = -1;
    $linkedBookingID = 38; //replace with booking id of booking associated with alternate request
    // $dateTimeOptions = '" "';

    $sql = "INSERT INTO AlternateRequests (
                FullName,
                Email,
                Details,
                LinkedBookingID,
                DateOptions,
                StartTimes,
                EndTimes
            ) VALUES (
                '$name',
                '$email',
                '$details',
                '$linkedBookingID',
                '$dates',
                '$startTimes',
                '$endTimes'
            )";

    echo $sql;


    if ($conn->query($sql) === TRUE) {
        // Redirect to dashboard if alternate request was successful
        echo '<script>
            setTimeout(function() {
                    window.location.href = "dashboard.html";
                }, 0);
            </script>';
    
    } else {
        echo "Alternate request failed! Try again";
        echo "Error: " . $sql . "<br>" . $conn->error;

        // On failure, user can pick between dashboard or requesting again
        echo '<button onclick="redirectToForm()">Try Again</button>';
        echo '<button onclick="redirectToDashboard()">Go to Dashboard</button>';
        echo '<script>
                function redirectToForm() {
                    window.location.href = "alternate_request.html";
                }
                function redirectToDashboard() {
                    window.location.href = "dashboard.html";
                }
            </script>';
    }

}
else {
    echo "Alternate request failed! Try again";
}

$conn->close();
 
?>
