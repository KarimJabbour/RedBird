<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include SendGrid files
require("./SendGrid/sendgrid-php.php");

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Read JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate JSON decoding
    if ($data === null) {
        http_response_code(400);
        echo "Invalid JSON input.";
        exit;
    }

    // Extract email, hashed poll ID, and vote details from JSON data
    $email = htmlspecialchars($data['email'] ?? '');
    $hashedPollID = $data['pollID'] ?? '';
    $meetingDates = $data['MeetingDates'] ?? [];
    $startTimes = $data['StartTimes'] ?? [];
    $endTimes = $data['EndTimes'] ?? [];

    // Validate required fields
    if (empty($email) || empty($hashedPollID) || empty($meetingDates) || empty($startTimes) || empty($endTimes)) {
        http_response_code(400);
        echo "Missing required fields.";
        exit;
    }

    // Find the numeric PollID using the hashed ID
    $sql = "SELECT ID FROM CreatedPolls WHERE hashedID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $hashedPollID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $pollID = $row['ID'];
    } else {
        http_response_code(400);
        error_log("Invalid hashed poll ID provided: $hashedPollID");
        echo "Invalid poll ID.";
        exit;
    }

    // Find the UserID using the email
    $sql = "SELECT id FROM Users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $userID = $row['id'];
    } else {
        http_response_code(400);
        error_log("Invalid email provided: $email");
        echo "Invalid user email.";
        exit;
    }

    // Insert vote into PollVotes table
    $meetingDatesJson = json_encode($meetingDates);
    $startTimesJson = json_encode($startTimes);
    $endTimesJson = json_encode($endTimes);

    $sql = "INSERT INTO PollVotes (PollID, UserID, MeetingDates, StartTimes, EndTimes) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iisss", $pollID, $userID, $meetingDatesJson, $startTimesJson, $endTimesJson);

    if ($stmt->execute()) {
        echo "Vote recorded successfully.";

        $emailContentPlain = "Your vote for the poll has been recorded successfully.\n\n" .
            "Poll ID: $pollID\n" .
            "Meeting Dates: " . implode(', ', $meetingDates) . "\n" .
            "Start Times: " . implode(', ', $startTimes) . "\n" .
            "End Times: " . implode(', ', $endTimes) . "\n";

        $emailContentHtml = "<strong>Your vote for the poll has been recorded successfully.</strong><br><br>" .
            "<ul>" .
            "<li><strong>Poll ID:</strong> $pollID</li>" .
            "<li><strong>Meeting Dates:</strong> " . implode(', ', $meetingDates) . "</li>" .
            "<li><strong>Start Times:</strong> " . implode(', ', $startTimes) . "</li>" .
            "<li><strong>End Times:</strong> " . implode(', ', $endTimes) . "</li>" .
            "</ul>";

        $sendgridEmail = new \SendGrid\Mail\Mail();
        $sendgridEmail->setFrom("redbirdnotifs@gmail.com", "RedBird Notifications");
        $sendgridEmail->setSubject("Poll Vote Confirmation");
        $sendgridEmail->addTo($email);
        $sendgridEmail->addContent("text/plain", $emailContentPlain);
        $sendgridEmail->addContent("text/html", $emailContentHtml);

        $sendgrid = new \SendGrid("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");

        try {
            $response = $sendgrid->send($sendgridEmail);
            if ($response->statusCode() == 202) {
                echo "Confirmation email sent successfully.";
            } else {
                error_log("Failed to send confirmation email. Response code: " . $response->statusCode());
                echo "Failed to send confirmation email. Response code: " . $response->statusCode();
                print_r($response->body());
            }
        } catch (Exception $e) {
            error_log('Caught exception: ' . $e->getMessage());
            echo 'Caught exception: ' . $e->getMessage();
        }
    } else {
        http_response_code(500);
        echo "Failed to record the vote.";
    }

    $stmt->close();
} else {
    echo "Invalid request.";
}

$conn->close();
?>
