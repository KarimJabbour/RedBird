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

// Fetch the user's email from the Users table
$sql = "SELECT email FROM Users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $email = $user['email'];
} else {
    echo "User email not found!";
    exit;
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
    $pollCloseDateTime = empty($_POST['poll-close-time']) ? null : htmlspecialchars($_POST['poll-close-time']);

    $dateTimeOptionsCount = count(explode(',', $dates));
    $voteCounts = implode(',', array_fill(0, $dateTimeOptionsCount, '0'));
    $voteCounts = '"' . $voteCounts . '"';

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

        $emailData = [
            "email" => $email,
            "pollID" => $hashedId
        ];

        // Make a POST request to the email script
        $emailScriptUrl = "http://localhost/RedBird/mail/sendPollCreation.php";
        $ch = curl_init($emailScriptUrl);

        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Execute the request and handle the response
        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            error_log("Error sending email: " . curl_error($ch));
        }
        curl_close($ch);

        if ($response) {
            error_log("Email script response: $response");
        }

        $confirmationUrl = "pollcreated_confirmation.html";
            $queryParams = http_build_query([
                'title' => $pollName,
                'details' => $details,
                'link' => urlencode("http://localhost/RedBird/pages/answer_poll.html?pollID=$hashedId"),
            ]);

            echo '<script>
                setTimeout(function() {
                    window.location.href = "' . $confirmationUrl . '?' . $queryParams . '";
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

} else {
    echo "Poll creation failed! Try again";
}

$conn->close();
?>
