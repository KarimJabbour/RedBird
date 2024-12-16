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

    // Log the input properly
    if (is_array($data)) {
        error_log("Array: Raw JSON input: " . json_encode($data));
    } else {
        error_log("Raw JSON input: " . $input);
    }

    // Validate JSON decoding
    if ($data === null) {
        http_response_code(400);
        echo "Invalid JSON input.";
        exit;
    }

    // Extract email and hashed poll ID from JSON data
    $email = htmlspecialchars($data['email'] ?? '');
    $hashedPollID = $data['pollID'] ?? '';

    // Validate required fields
    if (empty($email) || empty($hashedPollID)) {
        http_response_code(400);
        echo "Missing required fields: email or hashed poll ID.";
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

    // Fetch participant vote details from the PollVotes table
    $sql = "SELECT * FROM PollVotes WHERE PollID = ? AND Email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $pollID, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $participantDetails = $result->fetch_assoc();

        // Decode JSON fields
        $meetingDates = json_decode($participantDetails['MeetingDates'], true);
        $startTimes = json_decode($participantDetails['StartTimes'], true);
        $endTimes = json_decode($participantDetails['EndTimes'], true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Invalid JSON for participant details: " . json_last_error_msg());
            http_response_code(500);
            echo "Invalid participant data.";
            exit();
        }

        // Format details for email
        $meetingDatesString = is_array($meetingDates) ? implode(', ', $meetingDates) : $meetingDates;
        $startTimesString = is_array($startTimes) ? implode(', ', $startTimes) : $startTimes;
        $endTimesString = is_array($endTimes) ? implode(', ', $endTimes) : $endTimes;

        $fullName = $participantDetails['FullName'] ?? 'N/A';
        $mcgillID = $participantDetails['McGillID'] ?? 'N/A';

        // Prepare email content
        $emailContentPlain = "Poll vote details:\n\n" .
            "Name: $fullName\n" .
            "McGill ID: $mcgillID\n" .
            "Email: $email\n" .
            "Meeting Dates: $meetingDatesString\n" .
            "Start Times: $startTimesString\n" .
            "End Times: $endTimesString\n";

        $emailContentHtml = "<strong>Poll Vote Details:</strong><br><br>" .
            "<ul>" .
            "<li><strong>Name:</strong> $fullName</li>" .
            "<li><strong>McGill ID:</strong> $mcgillID</li>" .
            "<li><strong>Email:</strong> $email</li>" .
            "<li><strong>Meeting Dates:</strong> $meetingDatesString</li>" .
            "<li><strong>Start Times:</strong> $startTimesString</li>" .
            "<li><strong>End Times:</strong> $endTimesString</li>" .
            "</ul>";

        // Send email using SendGrid
        $sendgridEmail = new \SendGrid\Mail\Mail();
        $sendgridEmail->setFrom("redbirdnotifs@gmail.com", "RedBird Notifications");
        $sendgridEmail->setSubject("Poll Vote Details");
        $sendgridEmail->addTo($email);
        $sendgridEmail->addContent("text/plain", $emailContentPlain);
        $sendgridEmail->addContent("text/html", $emailContentHtml);

        // Replace with your valid SendGrid API key
        $sendgrid = new \SendGrid("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");

        try {
            $response = $sendgrid->send($sendgridEmail);
            if ($response->statusCode() == 202) {
                echo "Email sent successfully.";
            } else {
                error_log("Failed to send email. Response code: " . $response->statusCode());
                echo "Failed to send email. Response code: " . $response->statusCode();
                print_r($response->body());
            }
        } catch (Exception $e) {
            error_log('Caught exception: ' . $e->getMessage());
            echo 'Caught exception: ' . $e->getMessage();
        }
    } else {
        echo "No vote details found for the poll.";
    }

    $stmt->close();
} else {
    echo "Invalid request.";
}

$conn->close();
