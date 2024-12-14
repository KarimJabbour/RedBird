-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 10, 2024 at 10:35 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Bookings`
--

-- --------------------------------------------------------

--
-- Table structure for table `AlternateRequests`
--

CREATE TABLE `AlternateRequests` (
  `ID` int(11) NOT NULL,
  `FullName` varchar(40) NOT NULL,
  `Email` varchar(30) NOT NULL,
  `Details` text NOT NULL,
  `LinkedBookingID` int(11) NOT NULL,
  `DateOptions` longtext NOT NULL,
  `StartTimes` longtext NOT NULL,
  `EndTimes` longtext NOT NULL,
  `ResponseMessage` text DEFAULT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `AlternateRequests`
--

INSERT INTO `AlternateRequests` (`ID`, `FullName`, `Email`, `Details`, `LinkedBookingID`, `DateOptions`, `StartTimes`, `EndTimes`, `ResponseMessage`, `Status`) VALUES
(4, 'Khyati Singh', 'testing@gmail.com', 'busy', 38, '\"2024-12-06,2024-12-17\"', '\"16:04,17:00\"', '\"17:05,18:00\"', '', 'pending'),
(6, 'k s', 'ks@gmail.com', 'bcjbajsk', 38, '\"2024-12-11\"', '\"16:05\"', '\"17:05\"', '', 'pending'),
(7, 'test', 'a@gmail.com', 'ctvg', 38, '\"2024-12-06,2024-12-17\"', '\"16:00,15:06\"', '\"17:00,16:07\"', 'some msg', 'accepted');

-- --------------------------------------------------------

--
-- Table structure for table `CreatedBookings`
--

CREATE TABLE `CreatedBookings` (
  `ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `BookingName` varchar(30) NOT NULL,
  `RecurrenceFrequency` varchar(20) NOT NULL,
  `MeetingDates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`MeetingDates`)),
  `RecurrenceDays` varchar(20) NOT NULL,
  `StartTimes` longtext NOT NULL,
  `EndTimes` longtext NOT NULL,
  `RecurrenceStartTimes` longtext DEFAULT NULL,
  `RecurrenceEndTimes` longtext DEFAULT NULL,
  `StartRecurringDate` date NOT NULL,
  `EndRecurringDate` date NOT NULL,
  `Details` text NOT NULL DEFAULT '-1',
  `MaxAttendees` int(11) NOT NULL DEFAULT -1,
  `TimeSlotLength` int(11) NOT NULL DEFAULT -1,
  `Location` text NOT NULL DEFAULT '-1',
  `MeetingLink` text NOT NULL DEFAULT '-1',
  `BookingURL` text NOT NULL DEFAULT '-1',
  `Attachments` text NOT NULL DEFAULT '-1',
  `Status` varchar(20) NOT NULL DEFAULT 'current'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `CreatedBookings`
--

INSERT INTO `CreatedBookings` (`ID`, `UserID`, `BookingName`, `RecurrenceFrequency`, `MeetingDates`, `RecurrenceDays`, `StartTimes`, `EndTimes`, `RecurrenceStartTimes`, `RecurrenceEndTimes`, `StartRecurringDate`, `EndRecurringDate`, `Details`, `MaxAttendees`, `TimeSlotLength`, `Location`, `MeetingLink`, `BookingURL`, `Attachments`, `Status`) VALUES
(1, 4, '', 'weekly', '\"04-11-2024,11-11-2024,18-11-2024\"', 'M', '17:00', '', NULL, NULL, '2024-11-04', '2024-11-18', '', 5, 10, 'McConnell 320', '', '-1', '', 'past'),
(2, 1, 'Office Hours', 'Weekly', '\"08-11-2024,15-11-2024\"', 'F', '4:00PM', '5:30PM', NULL, NULL, '2024-11-08', '2024-11-15', '', 4, 15, 'Trottier 3120', '', '-1', '', 'past'),
(3, 1, 'One-Time Meeting', '', '\"17-11-2024\"', '', '6:00PM', '7:00PM', NULL, NULL, '2024-11-17', '2024-11-17', '', 1, 8, 'Leacock 26', '', '-1', '', 'past'),
(4, -1, 'Boing', 'daily', '\"2024-12-04,2024-12-11,2024-12-18\"', ' ', '19:42', '21:40', NULL, NULL, '2024-11-18', '2024-11-30', 'Pinkie Pie', -1, -1, 'McConnell 324', '-1', '-1', '-1', 'past'),
(5, -1, 'Gummy', 'monthly', '\"2025-01-02,2025-01-07,2025-01-09\"', ' ', '19:42', '21:40', NULL, NULL, '2024-11-15', '2024-11-30', 'Pinkie Pie', -1, -1, 'McConnell 323', '-1', '-1', '-1', 'past'),
(38, -1, 'Thomas', 'weekly', '\"2025-01-02,2025-01-07,2025-01-09,2025-01-14,2025-01-16,2025-01-21,2025-01-23,2025-01-28,2025-01-30\"', 'T,Th', '00:08', '12:09', NULL, NULL, '2024-12-01', '2025-01-31', 'another test', -1, 30, 'idk somewhere in Equestria', 'https://googlemeet.com/6dgxaq29jmx', '-1', '-1', 'current'),
(43, -1, 'test1', 'weekly', '\"2024-12-04,2024-12-11,2024-12-18,2024-12-25\"', 'W', '13:09', '14:09', NULL, NULL, '2024-12-01', '2024-12-31', '', -1, -1, 'dbjad', '-1', '-1', '-1', 'current'),
(50, -1, 'test3', 'monthly', '\"2024-12-21,2025-01-21\"', '21', '13:06', '13:07', NULL, NULL, '2024-12-02', '2025-01-29', '', -1, -1, 'Conus', '-1', '-1', '-1', 'current'),
(51, -1, 'test4', 'monthly', '\"2024-12-02,2025-01-02\"', '2', '13:06', '13:07', NULL, NULL, '2024-11-07', '2025-01-29', 'hello this is a test', 3, 10, 'McConnell 204', 'https://zoom.com/hfuahidkchk', 'https://pookie.com', '-1', 'current'),
(53, -1, 'month test 2', 'monthly', '\"2024-12-04,2024-12-23,2024-12-15,2025-01-04,2025-01-23,2025-01-15,2025-02-04\"', '4,23,15', '16:00', '17:00', NULL, NULL, '2024-12-02', '2025-02-05', '', -1, -1, 'idk', '-1', '-1', '-1', 'current'),
(54, -1, 'Alternate - Thomas', 'non-recurring', '\"2024-12-17\"', '', '17:00', '18:00', NULL, NULL, '2024-12-17', '2024-12-17', 'another test', -1, -1, '-1', 'https://googlemeet.com/6dgxaq29jmx', '-1', '-1', 'current'),
(58, -1, 'fixed database', 'weekly', '\"2024-12-04,2024-12-11,2024-12-18,2024-12-25\"', 'W', '\"16:00,16:00,16:00,16:00\"', '\"17:00,17:00,17:00,17:00\"', NULL, NULL, '2024-12-01', '2024-12-31', 'info', -1, -1, 'idk', '-1', '-1', '-1', 'current'),
(60, -1, 'check monthly', 'monthly', '\"2024-12-12,2025-01-12\"', '12', '\"16:00,16:00\"', '\"17:00,17:00\"', NULL, NULL, '2024-12-01', '2025-01-31', 'info', -1, -1, 'idk', '-1', '-1', '-1', 'current'),
(61, -1, 'non recurring test', 'non-recurring', '\"2024-12-05,2024-12-10,2024-12-21\"', '', '\"20:00,20:00,20:00\"', '\"21:00,21:00,21:00\"', NULL, NULL, '2024-12-01', '2024-12-31', 'info', -1, -1, 'k', '-1', '-1', '-1', 'current'),
(62, -1, 'Alternate - Thomas', 'non-recurring', '\"2024-12-16\"', '', '\"15:06\"', '\"16:07\"', NULL, NULL, '2024-12-16', '2024-12-16', 'another test', -1, -1, '-1', 'https://googlemeet.com/6dgxaq29jmx', '-1', '-1', 'current'),
(63, -1, 'multi times in day', 'non-recurring', '\"2024-12-04,2024-12-04\"', '', '\"16:00,18:00\"', '\"17:00,19:00\"', NULL, NULL, '2024-12-01', '2024-12-31', '', -1, -1, 't', '-1', '-1', '-1', 'current');

-- --------------------------------------------------------

--
-- Table structure for table `CreatedPolls`
--

CREATE TABLE `CreatedPolls` (
  `ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `PollName` varchar(30) NOT NULL,
  `DateOptions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `StartTimes` longtext NOT NULL,
  `EndTimes` longtext NOT NULL,
  `Details` text NOT NULL,
  `PollOpenDateTime` datetime NOT NULL DEFAULT current_timestamp(),
  `PollCloseDateTime` datetime DEFAULT NULL,
  `VoteCounts` longtext NOT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'current'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `CreatedPolls`
--

INSERT INTO `CreatedPolls` (`ID`, `UserID`, `PollName`, `DateOptions`, `StartTimes`, `EndTimes`, `Details`, `PollOpenDateTime`, `PollCloseDateTime`, `VoteCounts`, `Status`) VALUES
(2, -1, 'test', '\"2024-12-06,2024-12-17\"', '\"14:03,13:02\"', '\"16:05,14:03\"', 'info', '2024-12-05 21:54:06', '2024-12-08 20:18:47', '\"20,20\"', 'past'),
(3, -1, 'test2', '\"2024-12-04,2024-12-14\"', '\"17:00,14:00\"', '\"18:00,15:00\"', 'random info about poll', '2024-12-07 13:18:59', '2024-12-07 22:08:46', '\"5,10\"', 'past'),
(9, -1, 'poll 7', '\"2024-12-05,2024-12-23,2024-12-08\"', '\"13:00,18:00,17:00\"', '\"14:00,19:00,18:00\"', 'info', '2024-12-08 11:52:05', '2024-12-10 11:48:00', '6,5,3', 'current'),
(10, -1, 'null test', '\"2024-12-12\"', '\"16:00\"', '\"17:00\"', 'idk', '2024-12-08 12:38:35', '2024-12-08 17:38:54', '\"0\"', 'past');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `AlternateRequests`
--
ALTER TABLE `AlternateRequests`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `CreatedBookings`
--
ALTER TABLE `CreatedBookings`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `CreatedPolls`
--
ALTER TABLE `CreatedPolls`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `AlternateRequests`
--
ALTER TABLE `AlternateRequests`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `CreatedBookings`
--
ALTER TABLE `CreatedBookings`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `CreatedPolls`
--
ALTER TABLE `CreatedPolls`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('Professor', 'TA', 'Student') NOT NULL,
    default_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notifications_enabled BOOLEAN DEFAULT TRUE);

-- Insert sample users into the 'users' table
INSERT INTO Users (email, password, full_name, role, default_location, created_at, notifications_enabled)
VALUES
('alice@mail.mcgill.ca', 'password123', 'Alice Johnson', 'Student', 'Downtown Campus', NOW(), TRUE),
('bob@mail.mcgill.ca', 'securepass456', 'Bob Smith', 'Professor', 'Main Campus', NOW(), TRUE),
('carol@mail.mcgill.ca', 'qwerty789', 'Carol White', 'TA', 'Engineering Building', NOW(), FALSE),
('dave@mail.mcgill.ca', 'mypassword321', 'Dave Brown', 'Student', NULL, NOW(), TRUE),
('eve@mail.mcgill.ca', 'letmein654', 'Eve Green', 'Professor', 'Law Library', NOW(), FALSE);
COMMIT;