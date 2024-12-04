
document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Replace with the actual logged-in user's ID
    const bookingContainer = document.querySelector('.bookings .booking-container');

    fetch(`http://localhost/displayDashboard.php`)
        .then(response => response.json())
        .then(data => {
            // Clear existing bookings
            bookingContainer.innerHTML = '';

            data.forEach(booking => {
                const earliestUpcomingDate = getEarliestUpcomingDate(booking.MeetingDates);

                const frequencyAndDays =
                    booking.RecurrenceFrequency !== 'non-recurring'
                        ? ` (${formatFrequency(booking.RecurrenceFrequency)}: ${booking.RecurrenceDays})`
                        : '';

                const bookingRow = document.createElement('div');
                bookingRow.className = 'booking-row created';
                bookingRow.innerHTML = `
                    <div class="column-title">${booking.BookingName}</div>
                    <div class="column-date"><b>Next Date:</b> ${earliestUpcomingDate} ${frequencyAndDays} </div>
                    <div class="column-time"><b>Time:</b> ${formatTime(booking.StartTime)} - ${formatTime(booking.EndTime)}</div>
                `;
                bookingContainer.appendChild(bookingRow);
            });
        })
        .catch(error => console.error('Error fetching bookings:', error));
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



