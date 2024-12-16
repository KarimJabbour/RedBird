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

    // Extract email and hashed poll ID from JSON data
    $email = htmlspecialchars($data['email'] ?? '');
    $hashedID = $data['pollID'] ?? '';

    // Validate required fields
    if (empty($email) || empty($hashedID)) {
        http_response_code(400);
        echo "Missing required fields: email or pollID.";
        exit;
    }

    // Find the poll details using the hashed ID
    $sql = "SELECT * FROM CreatedPolls WHERE hashedID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $hashedID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $pollDetails = $result->fetch_assoc();

        // Decode JSON fields
        $dateOptions = json_decode($pollDetails['DateOptions'], true);
        $startTimes = json_decode($pollDetails['StartTimes'], true);
        $endTimes = json_decode($pollDetails['EndTimes'], true);
        $voteCounts = json_decode($pollDetails['VoteCounts'], true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Invalid JSON for poll details: " . json_last_error_msg());
            http_response_code(500);
            echo "Invalid poll data.";
            exit;
        }

        // Format poll details for email
        $pollName = $pollDetails['PollName'];
        $details = $pollDetails['Details'];
        $status = $pollDetails['Status'];
        $pollCloseDateTime = $pollDetails['PollCloseDateTime'] ?? 'N/A';
        $pollURL = "http://localhost/RedBird/pages/answer_poll.html?pollID=$hashedID"; // Generate Poll URL

        $dateOptionsString = is_array($dateOptions) ? implode(', ', $dateOptions) : $dateOptions;
        $startTimesString = is_array($startTimes) ? implode(', ', $startTimes) : $startTimes;
        $endTimesString = is_array($endTimes) ? implode(', ', $endTimes) : $endTimes;

        // Prepare email content
        $emailContentPlain = "Poll Created: '$pollName'.\n\n" .
            "Details:\n" .
            "Poll Name: $pollName\n" .
            "Poll Description: $details\n" .
            "Date Options: $dateOptionsString\n" .
            "Start Times: $startTimesString\n" .
            "End Times: $endTimesString\n" .
            "Poll Close Time: $pollCloseDateTime\n" .
            "Status: $status\n" .
            "Poll URL: $pollURL";

        $emailContentHtml = "<strong>Poll Created: '$pollName'.</strong><br><br>" .
            "<p><strong>Details:</strong></p>" .
            "<ul>" .
            "<li><strong>Poll Name:</strong> $pollName</li>" .
            "<li><strong>Poll Description:</strong> $details</li>" .
            "<li><strong>Date Options:</strong> $dateOptionsString</li>" .
            "<li><strong>Start Times:</strong> $startTimesString</li>" .
            "<li><strong>End Times:</strong> $endTimesString</li>" .
            "<li><strong>Poll Close Time:</strong> $pollCloseDateTime</li>" .
            "<li><strong>Status:</strong> $status</li>" .
            "<li><strong>Poll URL:</strong> <a href=\"$pollURL\">$pollURL</a></li>" .
            "</ul>";

        // Send email using SendGrid
        $sendgridEmail = new \SendGrid\Mail\Mail();
        $sendgridEmail->setFrom("redbirdnotifs@gmail.com", "RedBird Notifications");
        $sendgridEmail->setSubject("Poll Invitation: $pollName");
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
        echo "Poll not found for the provided pollID.";
    }

    $stmt->close();
} else {
    echo "Invalid request.";
}

$conn->close();
?>
