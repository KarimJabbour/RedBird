<?php
session_start();
require('./fpdf/fpdf.php');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fall2024-comp307-kjabbo2";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (!isset($_SESSION['user_id'])) {
    die("Error: User not authenticated");
}

$userId = $_SESSION['user_id'];

// Fetch data from various tables
$userData = $conn->query("SELECT * FROM Users WHERE id = $userId")->fetch_assoc();
$createdBookings = $conn->query("SELECT * FROM CreatedBookings WHERE UserID = $userId")->fetch_all(MYSQLI_ASSOC);
$alternateRequests = $conn->query("SELECT * FROM AlternateRequests WHERE LinkedBookingID IN (SELECT ID FROM CreatedBookings WHERE UserID = $userId)")->fetch_all(MYSQLI_ASSOC);
$reservedBookings = $conn->query("SELECT * FROM BookingParticipants WHERE UserID = $userId")->fetch_all(MYSQLI_ASSOC);
$pollVotes = $conn->query("SELECT * FROM PollVotes WHERE UserID = $userId")->fetch_all(MYSQLI_ASSOC);

// Initialize FPDF
$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 14);

// User Details
$pdf->Cell(0, 10, 'User Details', 0, 1);
$pdf->SetFont('Arial', '', 12);
$pdf->Cell(0, 10, "Name: " . $userData['full_name'], 0, 1);
$pdf->Cell(0, 10, "Email: " . $userData['email'], 0, 1);
$pdf->Cell(0, 10, "Role: " . $userData['role'], 0, 1);
$pdf->Ln(10);

// Created Bookings
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'Created Bookings', 0, 1);
$pdf->SetFont('Arial', '', 12);
if (count($createdBookings) > 0) {
    foreach ($createdBookings as $booking) {
        $pdf->Cell(0, 10, "Booking Name: " . $booking['BookingName'], 0, 1);
        $pdf->Cell(0, 10, "Dates: " . $booking['MeetingDates'], 0, 1);
        $pdf->Cell(0, 10, "Location: " . $booking['Location'], 0, 1);
        $pdf->Ln(5);
    }
} else {
    $pdf->Cell(0, 10, 'No bookings found.', 0, 1);
}
$pdf->Ln(10);

// Alternate Requests
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'Alternate Requests', 0, 1);
$pdf->SetFont('Arial', '', 12);
if (count($alternateRequests) > 0) {
    foreach ($alternateRequests as $request) {
        $pdf->Cell(0, 10, "Full Name: " . $request['FullName'], 0, 1);
        $pdf->Cell(0, 10, "Details: " . $request['Details'], 0, 1);
        $pdf->Ln(5);
    }
} else {
    $pdf->Cell(0, 10, 'No alternate requests found.', 0, 1);
}
$pdf->Ln(10);

// Reserved Bookings
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'Reserved Bookings', 0, 1);
$pdf->SetFont('Arial', '', 12);
if (count($reservedBookings) > 0) {
    foreach ($reservedBookings as $booking) {
        $pdf->Cell(0, 10, "Booking ID: " . $booking['BookingID'], 0, 1);
        $pdf->Cell(0, 10, "Dates: " . $booking['MeetingDates'], 0, 1);
        $pdf->Ln(5);
    }
} else {
    $pdf->Cell(0, 10, 'No reserved bookings found.', 0, 1);
}
$pdf->Ln(10);

// Poll Votes
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'Poll Votes', 0, 1);
$pdf->SetFont('Arial', '', 12);
if (count($pollVotes) > 0) {
    foreach ($pollVotes as $vote) {
        $pdf->Cell(0, 10, "Poll ID: " . $vote['PollID'], 0, 1);
        $pdf->Cell(0, 10, "Meeting Dates: " . $vote['MeetingDates'], 0, 1);
        $pdf->Ln(5);
    }
} else {
    $pdf->Cell(0, 10, 'No poll votes found.', 0, 1);
}
$pdf->Ln(10);


// Fetch Created Polls
$createdPolls = $conn->query("SELECT * FROM CreatedPolls WHERE UserID = $userId")->fetch_all(MYSQLI_ASSOC);

$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'Created Polls', 0, 1);
$pdf->SetFont('Arial', '', 12);
if (count($createdPolls) > 0) {
    foreach ($createdPolls as $poll) {
        $pdf->Cell(0, 10, "Poll Name: " . $poll['PollName'], 0, 1);
        $pdf->Cell(0, 10, "Details: " . $poll['Details'], 0, 1);
        $pdf->Cell(0, 10, "Date Options: " . $poll['DateOptions'], 0, 1);
        $pdf->Cell(0, 10, "Start Times: " . $poll['StartTimes'], 0, 1);
        $pdf->Cell(0, 10, "End Times: " . $poll['EndTimes'], 0, 1);
        $pdf->Cell(0, 10, "Vote Counts: " . $poll['VoteCounts'], 0, 1);
        $pdf->Ln(5);
    }
} else {
    $pdf->Cell(0, 10, 'No created polls found.', 0, 1);
}
$pdf->Ln(10);


// Output PDF
$pdf->Output('redbird_profile.pdf', 'D');

$conn->close();
?>
