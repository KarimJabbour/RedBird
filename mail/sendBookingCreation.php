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
        $bookingURL = "http://localhost/RedBird/pages/book_meeting.html?id=$hashedID"; // Generate Booking URL

        $location = $booking['Location'];
        $startDate = $booking['StartRecurringDate'];
        $endDate = $booking['EndRecurringDate'];
        $details = $booking['Details'];

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

        $emailContentHtml = "<strong>Created booking '$bookingName'.</strong><br><br>" .
            "<p><strong>Details:</strong></p>" .
            "<ul>" .
            "<li><strong>Start Date:</strong> $startDate</li>" .
            "<li><strong>End Date:</strong> $endDate</li>" .
            "<li><strong>Location:</strong> $location</li>" .
            "<li><strong>Meeting Dates:</strong> $meetingDatesString</li>" .
            "<li><strong>Recurrence Frequency:</strong> $recurrenceFrequency</li>" .
            "<li><strong>Recurrence Days:</strong> $recurrenceDays</li>" .
            "<li><strong>Start Times:</strong> $startTimes</li>" .
            "<li><strong>End Times:</strong> $endTimes</li>" .
            "<li><strong>Details:</strong> $details</li>" .
            "<li><strong>Booking URL:</strong> <a href=\"$bookingURL\">$bookingURL</a></li>" .
            "</ul>";

        // Send email using SendGrid
        $sendgridEmail = new \SendGrid\Mail\Mail();
        $sendgridEmail->setFrom("redbirdnotifs@gmail.com", "RedBird Notifications");
        $sendgridEmail->setSubject("Booking Confirmation");
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
