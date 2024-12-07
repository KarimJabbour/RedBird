
document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Replace with the actual logged-in user's ID
    const bookingContainer = document.querySelector('.bookings .booking-container');
    const pollsContainer = document.querySelector('.polls .booking-container');
    const historyContainer = document.querySelector('.bookings-history .booking-container');

    console.log('Starting fetch');
    fetch(`http://localhost/redbird/pages/displayDashboard.php`)
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
                    bookingRow.onclick = () => showBookingPopup(booking);
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
                    pollRow.onclick = () => showPollPopup(poll);
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
    //console.log("Raw Meeting Dates String:", meetingDatesStr);

    const meetingDates = meetingDatesStr.split(',').map(dateStr => {
        //console.log("Raw Date Entry:", dateStr);
        const [year, month, day] = dateStr.trim().replace(/^"|"$/g, '').split('-').map(Number); // Remove leading and trailing double quotes
        //console.log("Parsed Date Components:", { year, month, day });
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

function closePopup(popupID) {
    const popup = document.getElementById(popupID);
    popup.style.display = 'none';
}

function showBookingPopup(booking) {
    const bookingPopup = document.getElementById("booking-details-popup");
    bookingPopup.style.display = 'flex';

    bookingPopup.querySelector(".modal-header h2").textContent = booking.BookingName;
    bookingPopup.querySelector(".delete-btn").setAttribute('onclick', `deleteBooking(${booking.ID})`);
    bookingPopup.querySelector(".modal-body").innerHTML = `
        <p><b>Details:</b> ${booking.Details}</p>
        <p><b>Location:</b> ${booking.Location}</p>
        <p><b>Max Participants:</b> ${booking.MaxAttendees}</p>
        <p><b>Time Slot:</b> ${booking.TimeSlotLength} minutes</p>
        <div class="copy-container">
            <b>Zoom Link:</b>
            <a href="${booking.MeetingLink}" target="_blank" id="zoom-link">${booking.MeetingLink || "N/A"}</a>
            <button class="copy-btn" onclick="copyToClipboard('zoom-link')">Copy</button>
        </div>
        <div class="copy-container">
            <b>Booking URL:</b>
            <a href="${booking.BookingURL}" target="_blank" id="meeting-url">${booking.BookingURL || "N/A"}</a>
            <button class="copy-btn" onclick="copyToClipboard('meeting-url')">Copy</button>
        </div>
        <div class="meeting-times">
            <h3>Booking Schedule</h3>
            <div class="scroll">
                <ul class="schedule-list" id="schedule-list">
                </ul>
            </div>
        </div>
    `;

    // Populate meeting times
    const scheduleList = document.querySelector(".schedule-list");

    if (booking.MeetingDates.length > 0) {
        const meetingDates = booking.MeetingDates.trim().replace(/^"|"$/g, '').split(',');

        const startTime = booking.StartTime;
        const endTime = booking.EndTime;

        meetingDates.forEach(date => {

            const [year, month, day] = date.trim().replace(/^"|"$/g, '').split('-').map(Number);
            const formattedDate = new Date(year, month - 1, day)

            var dayOfWeek = formattedDate.toLocaleString("en-US", { weekday: "short" });
            var letterDay = dayOfWeek.charAt(0);

            if (dayOfWeek === 'Tue' || dayOfWeek === 'Thu' || dayOfWeek === 'Sun') {
                letterDay = dayOfWeek.substring(0,2);
            }

            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <div class="day-icon">${letterDay}</div>
                <div class="time-info">
                    <h4>${formattedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                    <span>${formatTime(startTime)} - ${formatTime(endTime)}</span>
                </div>
            `;
            scheduleList.appendChild(listItem);
        });
    } else {
        scheduleList.innerHTML = "<li>No scheduled meetings</li>";
    }
}

function showPollPopup(poll) {
    const pollPopup = document.getElementById("poll-details-popup");
    pollPopup.style.display = 'flex';

    pollPopup.querySelector(".modal-header h2").textContent = poll.PollName;
    pollPopup.querySelector(".delete-btn").setAttribute('onclick', `closePoll(${poll.ID})`);
    pollPopup.querySelector(".modal-body").innerHTML = `
        <p><b>Details:</b> ${poll.Details}</p>
        <p><b>Poll Close Date:</b> ${poll.PollCloseDateTime}</p>
        <div class="poll-results">
            <h3>Poll Results</h3>
            <ul class="poll-results-list">
            </ul>
        </div>
    `;
    populatePollResults(poll);
}

function populatePollResults(poll) {
    const dates = poll.DateOptions.split(',').map(date => date.trim().replace(/^"|"$/g, ''));
    const startTimes = poll.StartTimes.split(',').map(time => time.trim().replace(/^"|"$/g, ''));
    const endTimes = poll.EndTimes.split(',').map(time => time.trim().replace(/^"|"$/g, ''));
    const voteCounts = poll.VoteCounts.split(',').map(vote => parseInt(vote.trim().replace(/^"|"$/g, ''), 10));

    const maxVotes = Math.max(...voteCounts);

    // Sort the pollData by votes in descending order
    const pollData = dates.map((date, index) => ({
        date: date,
        startTime: startTimes[index],
        endTime: endTimes[index],
        votes: voteCounts[index],
    }));
    pollData.sort((a, b) => b.votes - a.votes);

    const pollResultsList = document.querySelector('.poll-results-list');
    pollResultsList.innerHTML = '';

    pollData.forEach(option => {
        const pollOption = document.createElement('div');
        pollOption.classList.add('poll-option');

        const pollLabel = document.createElement('div');
        pollLabel.classList.add('poll-label');
        pollLabel.innerHTML = `
            <h4>${formatDate(option.date)}</h4>
            <span>${formatTime(option.startTime)} - ${formatTime(option.endTime)}</span>
        `;

        const pollBar = document.createElement('div');
        pollBar.classList.add('poll-bar');
        const percentage = (option.votes / maxVotes) * 100;
        pollBar.style.setProperty('--bar-width', `${percentage}%`);
        pollBar.innerHTML = `<span>${option.votes} votes</span>`;

        pollOption.appendChild(pollLabel);
        pollOption.appendChild(pollBar);

        pollResultsList.appendChild(pollOption);
    });
}

function copyToClipboard(elementId) {
    const copyText = document.getElementById(elementId).href;
    navigator.clipboard.writeText(copyText).then(() => {
        showAlert("Copied to clipboard!");
    });
}

function showAlert(message) {
    const alert = document.getElementById("copy-alert");
    alert.textContent = message;
    alert.className = "copy-alert show";
    setTimeout(() => {
        alert.className = alert.className.replace("show", "");
    }, 2500);
}

function deleteBooking(bookingId) {
    if (!confirm("Are you sure you want to delete this booking?")) {
        return; // Exit if the user cancels the action
    }

    console.log("bookingid"+bookingId);

    fetch('http://localhost/redbird/pages/deleteBooking.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert("Booking deleted successfully!");
                location.reload(); // Reload the page to update the booking list
            } else {
                alert("Failed to delete booking. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error deleting booking:", error);
            alert("An error occurred while deleting the booking. Please try again.");
        });
}


function closePoll(pollID) {
    if (!confirm("Are you sure you want to close this poll?")) {
        return;
    }

    const closeTime = new Date().toISOString().replace('Z', '');; // Current timestamp
    console.log("closetime"+closeTime);

    fetch('http://localhost/redbird/pages/closePoll.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollID, closeTime }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Response from server:", data);
            if (data.success) {
                alert("Poll closed successfully!");
                location.reload();
            } else {
                alert("Failed to close poll: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error closing poll:", error);
            alert("An error occurred while closing the poll. Please try again.");
        });
}
