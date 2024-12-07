
document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Replace with the actual logged-in user's ID
    const bookingContainer = document.querySelector('.bookings .booking-container');
    const pollsContainer = document.querySelector('.polls .booking-container');
    const historyContainer = document.querySelector('.bookings-history .booking-container');

    console.log('Starting fetch');
    fetch(`http://localhost/displayDashboard.php`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched Data:", data); // Log the response for debugging
            const bookings = data.bookings || []; 
            const polls = data.polls || [];
            const pastBookings = data.pastBookings || [];

            // Clear existing bookings and polls
            bookingContainer.innerHTML = '';
            pollsContainer.innerHTML = '';
            historyContainer.innerHTML = '';

            // Display bookings
            if (bookings.length > 0) {
                bookings.forEach(booking => {
                    const earliestUpcomingDate = getEarliestUpcomingDate(booking.MeetingDates);

                    const frequencyAndDays =
                        booking.RecurrenceFrequency !== 'non-recurring'
                            ? ` (${formatFrequency(booking.RecurrenceFrequency)}: ${booking.RecurrenceDays})`
                            : '';

                    const bookingRow = document.createElement('div');
                    bookingRow.className = 'booking-row created';
                    bookingRow.innerHTML = `
                        <div class="column-title">${booking.BookingName}</div>
                        <div class="column-date"><b>Next Date:</b> ${earliestUpcomingDate} ${frequencyAndDays}</div>
                        <div class="column-time"><b>Time:</b> ${formatTime(booking.StartTime)} - ${formatTime(booking.EndTime)}</div>
                    `;
                    bookingContainer.appendChild(bookingRow);
                });
            } else {
                bookingContainer.innerHTML = '<div class="empty">No bookings created yet</div>';
            }

            // Display polls
            if (polls.length > 0) {
                polls.forEach(poll => {
                    const pollRow = document.createElement('div');
                    pollRow.className = 'booking-row created';
                    pollRow.innerHTML = `
                        <div class="column-title">${poll.PollName}</div>
                        <div class="column-date"><b>Preferred Date:</b> ${getFirst(poll.DateOptions)}</div>
                        <div class="column-time"><b>Preferred Time:</b> ${formatTime(getFirst(poll.StartTimes))} - ${formatTime(getFirst(poll.EndTimes))}</div>
                    `;
                    pollsContainer.appendChild(pollRow);
                });
            } else {
                pollsContainer.innerHTML = '<div class="empty">No polls created yet</div>';
            }

            // Display past bookings in history
            if (pastBookings.length > 0) {
                pastBookings.forEach(booking => {
                    const bookingRow = document.createElement('div');
                    bookingRow.className = 'booking-row past';
                    bookingRow.innerHTML = `
                        <div class="column-title">${booking.BookingName}</div>
                        <div class="column-date"><b>End Date:</b> ${booking.EndRecurringDate}</div>
                        <div class="column-time"><b>Time:</b> ${formatTime(booking.StartTime)} - ${formatTime(booking.EndTime)}</div>
                    `;
                    historyContainer.appendChild(bookingRow);
                });
            } else {
                historyContainer.innerHTML = '<div class="empty">No past bookings or polls</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            bookingContainer.innerHTML = '<div class="error">Error loading bookings.</div>';
            pollsContainer.innerHTML = '<div class="error">Error loading polls.</div>';
        });
});

function formatDate(dateStr) {
    if (!dateStr) {
        return null; 
    }
    const [year, month, day] = dateStr.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr) {
    if (!timeStr) {
        return null;
    }
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${formattedHour}:${minutes} ${period}`;
}

function getEarliestUpcomingDate(meetingDatesStr) {
    if (!meetingDatesStr) {
        return "No upcoming dates";
    }

    const today = new Date();
    console.log("Raw Meeting Dates String:", meetingDatesStr);

    const meetingDates = meetingDatesStr.split(',').map(dateStr => {
        console.log("Raw Date Entry:", dateStr);
        const [year, month, day] = dateStr.trim().replace(/^"|"$/g, '').split('-').map(Number); // Remove leading and trailing double quotes
        console.log("Parsed Date Components:", { year, month, day });
        return new Date(Date.UTC(year, month - 1, day+1)); // Create UTC date
    });

    const upcomingDates = meetingDates.filter(date => date >= today); // Filter out dates older than today
    upcomingDates.sort((a, b) => a - b); // Sort in ascending order
    console.log("Upcoming Dates:", upcomingDates);

    // Return the earliest date or a fallback message
    if (upcomingDates.length > 0) {
        return upcomingDates[0].toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } else {
        return "No upcoming dates";
    }
}

function formatFrequency(frequency) {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1).replace(/-/g, ' ');
}

function getFirst(options) {
    if (!options) {
        return 'None';
    }
    const optionList = options.split(',');
    const first = optionList[0].trim().replace(/^"|"$/g, '');
    return first || 'None';
}



