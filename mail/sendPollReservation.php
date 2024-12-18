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

    require_once 'checkNotifications.php';

    if (!checkNotificationsEnabled($conn, $email)) {
        echo "Notifications are disabled for this user.";
        exit();
    }
    

    // Find the numeric PollID using the hashed ID
    $sql = "SELECT ID, PollName FROM CreatedPolls WHERE hashedID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $hashedPollID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $pollID = $row['ID'];
        $pollName = $row['PollName'];
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

        $emailContentHtml = '
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    color: #333;
                    text-align: center;
                }
                .email-container {
                    background-color: #fff;
                    margin: 30px auto;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                }
                .header {
                    margin-bottom: 20px;
                }
                .header img {
                    max-width: 120px;
                }
                .header h2 {
                    color: #d32f2f;
                    margin: 10px 0;
                    font-size: 24px;
                    font-weight: bold;
                }
                .content {
                    font-size: 16px;
                    color: #555;
                    line-height: 1.6;
                    margin: 20px 0;
                }
                .link-container {
                    margin-top: 10px;
                    text-align: center;
                }
                .link-container input {
                    font-size: 14px;
                    padding: 10px;
                    width: 90%;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    margin-top: 10px;
                    box-sizing: border-box;
                }
                .button {
                    display: inline-block;
                    background-color: #d32f2f;
                    color: #fff;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <img src="https://i.imgur.com/V4lqM2r.png" alt="Logo">
                    <h2>Poll Vote Confirmation</h2>
                </div>
                <div class="content">
                    <p>Dear User,</p>
                    <p>You voted on the poll: <strong>' . htmlspecialchars($pollName) . '</strong>.</p>
                </div>
                <a class="button" href="http://localhost/RedBird/pages/answer_poll.html?pollID=' . htmlspecialchars($hashedPollID) . '">View Poll</a>
                <div class="link-container">
                    <p>Copy the poll link below:</p>
                    <input type="text" value="http://localhost/RedBird/pages/answer_poll.html?pollID=' . htmlspecialchars($hashedPollID) . '" readonly>
                </div>
                <div class="footer">
                    <p>&copy; 2024 RedBird Notifications | McGill University</p>
                </div>
            </div>
        </body>
        </html>';
            
        // Send email using SendGrid
        $sendgridEmail = new \SendGrid\Mail\Mail();
        $sendgridEmail->setFrom("redbirdnotifs@gmail.com", "RedBird Notifications");
        $sendgridEmail->setSubject("Poll Vote");
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
