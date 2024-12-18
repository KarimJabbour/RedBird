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

    require_once 'checkNotifications.php';

    if (!checkNotificationsEnabled($conn, $email)) {
        echo "Notifications are disabled for this user.";
        exit();
    }
    
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

        $emailContentHtml = '<!DOCTYPE html>
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
                .details {
                    color: #555;
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 20px 0;
                }
                .details strong {
                    color: #d32f2f;
                }
                .dates {
                    color: #333;
                    background-color: #f9f9f9;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 10px 0;
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
                    <h2>Poll Creation</h2>
                </div>
                <p>Dear User,</p>
                <p>You created the following poll:</p>
                <div class="details">
                    <p><strong>Poll Name:</strong> ' . htmlspecialchars($pollName) . '</p>
                    <div class="dates">
                        <p><strong>Date Options:</strong> ' . htmlspecialchars($dateOptionsString) . '</p>
                        <p><strong>Start Times:</strong> ' . htmlspecialchars($startTimesString) . '</p>
                        <p><strong>End Times:</strong> ' . htmlspecialchars($endTimesString) . '</p>
                        <p><strong>Poll Close Time:</strong> ' . htmlspecialchars($pollCloseDateTime) . '</p>
                    </div>
                </div>
                <a class="button" href="' . htmlspecialchars($pollURL) . '">Visit Poll</a>
                <div class="link-container">
                    <p>Copy the poll link below:</p>
                    <input type="text" value="' . htmlspecialchars($pollURL) . '" readonly>
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
        $sendgridEmail->setSubject("Poll Creation");
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
