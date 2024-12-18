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
    $email = htmlspecialchars($_POST['email']);
    $bookingID = intval($_POST['bookingID']);

    require_once 'checkNotifications.php';

    if (!checkNotificationsEnabled($conn, $email)) {
        echo "Notifications are disabled for this user.";
        exit();
    }
    
    // Fetch booking details from the database
    $sql = "SELECT * FROM CreatedBookings WHERE ID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $bookingID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $booking = $result->fetch_assoc();

        // Decode MeetingDates from JSON
        $meetingDates = json_decode($booking['MeetingDates'], true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Invalid MeetingDates JSON for booking ID $bookingID: " . $booking['MeetingDates']);
            $meetingDatesString = "Invalid data"; // Fallback for invalid JSON
        } elseif (is_array($meetingDates)) {
            $meetingDatesString = implode(', ', $meetingDates); // Handle arrays
        } else {
            $meetingDatesString = (string)$meetingDates; // Handle single values
        }

        // Prepare additional attributes
        $bookingName = $booking['BookingName'];
        $recurrenceDays = $booking['RecurrenceDays'];
        $recurrenceFrequency = $booking['RecurrenceFrequency'];
        $startTimes = $booking['StartTimes'];
        $endTimes = $booking['EndTimes'];
        $hashedID = $booking['hashedID'];
        $bookingURL = "http://localhost/RedBird/pages/book_meeting.html?id=$hashedID";

        $location = $booking['Location'];
        $startDate = $booking['StartRecurringDate'];
        $endDate = $booking['EndRecurringDate'];
        $details = $booking['Details'];
        $attachments = $booking['Attachments'];
        $meetingLink = $booking['MeetingLink'];

        // Prepare email content
        $emailContentPlain = "Created booking '$bookingName'.\n\n" .
            "Details:\n" .
            "Start Date: $startDate\n" .
            "End Date: $endDate\n" .
            "Location: $location\n" .
            "Meeting Dates: $meetingDatesString\n" .
            "Recurrence Frequency: $recurrenceFrequency\n" .
            "Recurrence Days: $recurrenceDays\n" .
            "Start Times: $startTimes\n" .
            "End Times: $endTimes\n" .
            "Details: $details\n" .
            "Booking URL: $bookingURL";
            

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
                .details {
                    color: #555;
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 20px 0;
                }
                .details strong {
                    color: #d32f2f;
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
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <img src="https://i.imgur.com/V4lqM2r.png" alt="Logo">
                    <h2>Booking Creation</h2>
                </div>
                <p>Dear User,</p>
                <p>You have successfully created the following booking:</p>
                <div class="details">
                    <p><strong>Booking Name:</strong> ' . htmlspecialchars($bookingName) . '</p>
                    <p><strong>Location:</strong> ' . htmlspecialchars($location) . '</p>
                    <p><strong>Meeting Dates:</strong> ' . htmlspecialchars($meetingDatesString) . '</p>
                    <p><strong>Recurrence Frequency:</strong> ' . htmlspecialchars($recurrenceFrequency) . '</p>
                    <p><strong>Details:</strong> ' . htmlspecialchars($details) . '</p>';
        
        // Add Attachments if valid
        if ($attachments !== '-1') {
            $emailContentHtml .= '<p><strong>Attachments:</strong> ' . htmlspecialchars($attachments) . '</p>';
        }
    
        // Add Meeting Link if valid
        if ($meetingLink !== '-1') {
            $emailContentHtml .= '<p><strong>Meeting Link:</strong> <a href="' . htmlspecialchars($meetingLink) . '">' . htmlspecialchars($meetingLink) . '</a></p>';
        }
    
        $emailContentHtml .= '
                </div>
                <a class="button" href="' . htmlspecialchars($bookingURL) . '">View Your Booking</a>
                <div class="link-container">
                    <p>Copy the booking link below:</p>
                    <input type="text" value="' . htmlspecialchars($bookingURL) . '" readonly>
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
        $sendgridEmail->setSubject("Booking Creation");
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
        echo "Booking not found.";
    }

    $stmt->close();
} else {
    echo "Invalid request.";
}

$conn->close();
?>
