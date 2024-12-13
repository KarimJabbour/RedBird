<?php
// require_once '../includes/auth.php'; // Ensure the user is logged in
// $userId = $_SESSION['user_id'];

// if (!isset($_SESSION['user_id'])) {
//     // Redirect to the login page with an optional return URL
//     $returnUrl = urlencode("http://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
//     echo "<p>You are not logged in. <a href='login.php?return_url={$returnUrl}'>Click here to log in</a> or continue as a guest.</p>";
// }

$userId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : -1; //public users should be allowed to book meetings/request alternate times

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

    $linkedBookingID = 70; //replace with booking id of booking associated with alternate request
    // $dateTimeOptions = '" "';

    $sql = "INSERT INTO AlternateRequests (
                UserID,
                FullName,
                Email,
                Details,
                LinkedBookingID,
                DateOptions,
                StartTimes,
                EndTimes
            ) VALUES (
                '$userId',
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
