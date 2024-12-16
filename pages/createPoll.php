<?php
require_once '../includes/auth.php'; // Ensure the user is logged in
$userId = $_SESSION['user_id'];

$servername = "localhost";
$username = "root";
$password = "";
$dbname ="fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo "Booking failed! Try again";
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $pollName = htmlspecialchars($_POST['name']);
    $details = htmlspecialchars($_POST['details']);

    $dates = htmlspecialchars($_POST['dates']);
    $dates = '"' . $dates . '"';
    $startTimes = htmlspecialchars($_POST['startTimes']);
    $startTimes = '"' . $startTimes . '"';
    $endTimes = htmlspecialchars($_POST['endTimes']);
    $endTimes = '"' . $endTimes . '"';
    //$pollCloseDateTime = htmlspecialchars($_POST['poll-close-time']); //need to figure out a default time stamp maybe not required
    $pollCloseDateTime = empty($_POST['poll-close-time']) ? null : htmlspecialchars($_POST['poll-close-time']);

    echo $pollCloseDateTime;

    // $dateTimeOptions = '" "';

    $dateTimeOptionsCount = count(explode(',', $dates));
    $voteCounts = implode(',', array_fill(0, $dateTimeOptionsCount, '0'));
    $voteCounts = '"' . $voteCounts . '"';
    echo $dateTimeOptionsCount;
    echo $voteCounts;

    if ($pollCloseDateTime === null) {
        $sql = "INSERT INTO CreatedPolls (
                    UserID, 
                    PollName,
                    DateOptions,
                    StartTimes,
                    EndTimes,
                    Details,  
                    VoteCounts,
                    Status
                ) VALUES (
                    '$userId',
                    '$pollName',
                    '$dates',
                    '$startTimes',
                    '$endTimes',
                    '$details',
                    '$voteCounts',
                    'current'
                )";
    } else {
        $sql = "INSERT INTO CreatedPolls (
                    UserID, 
                    PollName,
                    DateOptions,
                    StartTimes,
                    EndTimes,
                    Details,  
                    PollCloseDateTime,
                    VoteCounts,
                    Status
                ) VALUES (
                    '$userId',
                    '$pollName',
                    '$dates',
                    '$startTimes',
                    '$endTimes',
                    '$details',
                    '$pollCloseDateTime',
                    '$voteCounts',
                    'current'
                )";
    }

    if ($conn->query($sql) === TRUE) {
        $lastId = $conn->insert_id; // Get the last inserted ID
        $hashedId = hash('sha256', $lastId); // Make hash
    
        $updateSql = "UPDATE CreatedPolls SET hashedID = '$hashedId' WHERE ID = '$lastId'";
        $conn->query($updateSql);
    
        
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
