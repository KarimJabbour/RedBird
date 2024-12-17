# RedBird Documentation

## Requirements
 - Stack used is the **XAMPP** one so preferable to test everything using XAMPP
 - Brower: **Chrome** Preferred (Safari works in general but there are some inconsistencies when it comes to date/time form related inputs)

## 3rd Party Libraries Used:
**These libraries are included in the code so you don't have to worry about any install with composure or package manager.**
- SendGrid : For email notifications
- fpdf : For pdf generation

 ## Instructions For Setup
1. Create a database (use phpMyAdmin for ease) called :
    - Name : **fall2024-comp307-kjabbo2**
2. Import the SQL tables:
    - You can import the **RedBird.sql** file located in **sql/RedBird.sql**
    - You can use phpMyAdmin to do this; it's easier. You just click the database you just created and hit import then load the file.
3. In your browser, you can try accessing the registration page:
    - Register: **http://localhost/RedBird/pages/register.php**

## SQL Tables

### -  **Users**  
Stores user information --> for account management.
- Key Columns: `id`, `email`, `password`, `full_name`, `role`, `created_at`, `notifications_enabled`.

### -  **CreatedBookings**  
Manages all bookings, including recurrence details.  
- Key Columns: `ID`, `UserID`, `BookingName`, `RecurrenceFrequency`, `MeetingDates`, `StartTimes`, `EndTimes`, `Location`, `Status`.

### -  **BookingParticipants**  
Tracks which users (signed in or not) booked what Bookings
- Key Columns: `ID`, `BookingID`, `UserID`, `Email`, `FullName`,`MeetingDates`,`StartTimes`,`EndTimes`

### -  **CreatedPolls**  
Stores polls for selecting meeting times.  
- Key Columns: `ID`, `UserID`, `PollName`, `DateOptions`, `StartTimes`, `EndTimes`, `PollOpenDateTime`, `PollCloseDateTime`, `Status`.

### -  **PollVotes**  
Tracks votes for polls (signed in users or not)
- Key Columns: `ID`, `PollID`, `UserID`, `Email`, `FullName`.

### -  **AlternateRequests**  
Manages alternate time requests for bookings.  
- Key Columns: `ID`, `FullName`, `Email`, `LinkedBookingID`, `DateOptions`, `StartTimes`, `EndTimes`, `Status`.

## Dashboard
### Main Dash
The dashboard can be accessed by any logged in user with an account and allows the user to :
- See created bookings
- See created polls
- See bookings that you booked with other users (3rd party created bookings)
- See history (created bookings  + polls) that are expired

### Modals
Clicking on created bookings and created polls brings up modals with various details.

- URL(s) : Each booking or poll you make has a public URL which you can share with others and includes the hashedID inside it so that it is hard to access.

## Accounts
### Relevant Pages: 
- Register: http://localhost/RedBird/pages/register.php
- Login: http://localhost/RedBird/pages/login.php
### Details
- Registration form validates inputs:
    - Password complexity
    - Email validity (mcgill.ca / mail.mcgill.ca domains)
    - Forces various inputs (ex: mcgill id, name ,etc.)
 - Registration will store your account in the DB with a hashed password (SHA256).
 - Login retrieves the account from the DB.
 - Login will store the userID in the browser session as a cookie.
 - Accessing various private pages for booking/poll creation will not work unless the user has an account and is logged in
 - Logging in will make it easier when accessing public pages as it helps pre-load info you already put in.
 - Making an account gives the user control over enabling/disabling email notifications. 

 ## Bookings
 ### Relevant Pages:
 - Create Booking: http://localhost/RedBird/pages/create_booking.html
 - Book Meeting: http://localhost/RedBird/pages/book_meeting.html 
    - Note: Book meeting requires a param in the query of a hashed booking id (ex: http://localhost/RedBird/pages/book_meeting.html?id=a68b412c4282555f15546cf6e1fc42893b7e07f271557ceb021821098dd66c1b)

### Details:
- Bookings can be created by any logged in user using the create bookings page.
- Bookings are stored in the _Created Bookings_ SQL table and include a hash for each ID.
- The hashed ID is used as the parameter for booking a meeting.
- Booking a meeting can be done by logged in users or any user without an account since the form requires name,mcgillID, and email in the form (preloaded for logged in users).
- Email notifications are sent whenever a booking is created or booked.

 ## Polls
 ### Relevant Pages:
 - Create Poll: http://localhost/RedBird/pages/create_poll.html
 - Answer Poll: http://localhost/RedBird/pages/answer_poll.html
    - Note: Answer poll equires a param in the query of a poll id hash.

### Details:
- Polls can be created by any logged in user using the create polls page.
- Polls are stored in the _Created Polls_ SQL table and include a hash for each ID.
- The hashed ID is used as the parameter for voting on a poll.
- Voting on a poll can be done by logged in users or any user without an account since the form requires name,mcgillID, and email in the form (preloaded for logged in users).
- Email notifications are sent whenever a poll is created or voted on.