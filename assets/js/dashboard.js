document.addEventListener("DOMContentLoaded", () => {

  const historySection = document.querySelector(".bookings-history .booking-container");
  const toggleArrow = document.querySelector(".bookings-history .arrow");

  toggleArrow.addEventListener("click", () => {
    historySection.classList.toggle("expanded");
    toggleArrow.classList.toggle("rotated");
  });

  const createBookingPlus = document.querySelector(".bookings .plus");
  const createPollPlus = document.querySelector(".polls .plus");

  createBookingPlus.addEventListener("click", () => {
    window.location.href =
      "http://localhost/RedBird/pages/create_booking.html";
  });

  createPollPlus.addEventListener("click", () => {
    window.location.href = "http://localhost/RedBird/pages/create_poll.html";
  });

  const userIconLink = document.getElementById("user-icon-link");
  const dropdownMenu = document.getElementById("dropdown-menu");

  userIconLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (dropdownMenu.style.display === "block") {
          dropdownMenu.style.display = "none";
      } else {
          dropdownMenu.style.display = "block";
      }

  });

  window.addEventListener("click", (e) => {
      if (!userIconLink.contains(e.target) && !dropdownMenu.contains(e.target)) {
          dropdownMenu.style.display = "none";
      }
  });

  const exportPdfBtn = document.getElementById("export-pdf-btn");
  exportPdfBtn.href = `http://localhost/RedBird/pdf/userActivity.php`;

  const bookingContainer = document.querySelector(
    ".bookings .booking-container"
  );
  const pollsContainer = document.querySelector(".polls .booking-container");
  const historyContainer = document.querySelector(
    ".bookings-history .booking-container"
  );
  const alternateRequestsContainer = document.querySelector(
    ".requests .booking-container"
  );
  const otherBookingsContainer = document.querySelector(
    ".other-bookings .booking-container"
  );

  fetch(`http://localhost/RedBird/pages/displayDashboard.php`)
    .then((response) => {
      if (response.status === 401) { // Unauthorized user
        window.location.replace("http://localhost/RedBird/pages/login.php");
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const bookings = data.bookings || [];
      const polls = data.polls || [];
      const pastBookings = data.pastBookings || [];
      const pastPolls = data.pastPolls || [];
      const alternateRequests = data.alternateRequests || [];
      const reservedBookings = data.reservedBookings || [];

      // Clear all containers
      bookingContainer.innerHTML = "";
      pollsContainer.innerHTML = "";
      historyContainer.innerHTML = "";
      alternateRequestsContainer.innerHTML = "";
      otherBookingsContainer.innerHTML = "";

      displayAlternateRequests(alternateRequests, alternateRequestsContainer);
      displayBookings(bookings, bookingContainer);
      displayPolls(polls, pollsContainer);
      displayPastBookingsAndPolls(pastBookings, pastPolls, historyContainer);
      displayReservedBookings(reservedBookings, otherBookingsContainer, bookings);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

function displayAlternateRequests(alternateRequests, container) {
  if (alternateRequests.length > 0) {
    alternateRequests.forEach((request) => {
      const requestRow = document.createElement("div");
      requestRow.className = "booking-row pending";
      requestRow.onclick = () => showAlternatePopup(request);
      requestRow.innerHTML = `
        <div class="column-title">${request.BookingName}</div>
        <div class="column-message"><b>Reason:</b> ${request.Details}</div>
      `;
      container.appendChild(requestRow);
    });
  } else {
    container.innerHTML = '<div class="empty">No alternate requests</div>';
  }
}

function displayBookings(bookings, container) {
  if (bookings.length > 0) {
    bookings.forEach((booking) => {
      const { earliestDate, startTime, endTime } =
        getEarliestUpcomingDateWithTimes(
          booking.MeetingDates.trim().replace(/^"|"$/g, "").split(","),
          booking.StartTimes.trim().replace(/^"|"$/g, "").split(","),
          booking.EndTimes.trim().replace(/^"|"$/g, "").split(",")
        );
      const frequencyAndDays =
        booking.RecurrenceFrequency !== "non-recurring"
          ? ` (${formatFrequency(booking.RecurrenceFrequency)}: ${
              booking.RecurrenceDays
            })`
          : "";
      const bookingRow = document.createElement("div");
      bookingRow.className = "booking-row created";
      bookingRow.onclick = () => showBookingPopup(booking);
      bookingRow.innerHTML = `
        <div class="column-title">${booking.BookingName}</div>
        <div class="column-date"><b>Next Date:</b> ${earliestDate} ${frequencyAndDays}</div>
        <div class="column-time"><b>Time:</b> ${formatTime(
          startTime
        )} - ${formatTime(endTime)}</div>
      `;
      container.appendChild(bookingRow);
    });
  } else {
    container.innerHTML = '<div class="empty">No bookings created yet</div>';
  }
}

function displayPolls(polls, container) {
  if (polls.length > 0) {
    polls.forEach((poll) => {
      const pollRow = document.createElement("div");
      pollRow.className = "booking-row created";
      pollRow.onclick = () => showPollPopup(poll);
      const index = getFirst(poll);
      if (index != -1) {
          pollRow.innerHTML = `
            <div class="column-title">${poll.PollName}</div>
            <div class="column-date"><b>Preferred Date:</b> ${formatDate(poll.DateOptions.trim().replace(/^"|"$/g, "").split(',')[index])}</div>
            <div class="column-time"><b>Preferred Time:</b> ${formatTime(
              poll.StartTimes.trim().replace(/^"|"$/g, "").split(',')[index]
            )} - ${formatTime(poll.EndTimes.trim().replace(/^"|"$/g, "").split(',')[index])}</div>
          `;
      } else {
        pollRow.innerHTML = `
          <div class="column-title">${poll.PollName}</div>
          <div class="column-date">No responses yet.</div>
        `;
      }
      container.appendChild(pollRow);
    });
  } else {
    container.innerHTML = '<div class="empty">No polls created yet</div>';
  }
}

function displayPastBookingsAndPolls(pastBookings, pastPolls, container) {
  if (pastBookings.length > 0 || pastPolls.length > 0) {
    pastBookings.forEach((booking) => {
      const bookingRow = document.createElement("div");
      bookingRow.className = "booking-row past";
      bookingRow.onclick = () => showBookingPopup(booking, true);
      bookingRow.innerHTML = `
        <div class="column-title">${booking.BookingName}</div>
        <div class="column-date"><b>End Date:</b> ${
          booking.EndRecurringDate
        }</div>
        <div class="column-time"><b>Time:</b> ${formatTime(
          booking.StartTime
        )} - ${formatTime(booking.EndTime)}</div>
      `;
      container.appendChild(bookingRow);
    });
    pastPolls.forEach((poll) => {
      const pollRow = document.createElement("div");
      pollRow.className = "booking-row past";
      pollRow.onclick = () => showPollPopup(poll, true);
      const index = getFirst(poll);
      if (index != -1) {
          pollRow.innerHTML = `
            <div class="column-title">${poll.PollName}</div>
            <div class="column-date"><b>Preferred Date:</b> ${formatDate(poll.DateOptions.trim().replace(/^"|"$/g, "").split(',')[index])}</div>
            <div class="column-time"><b>Preferred Time:</b> ${formatTime(
              poll.StartTimes.trim().replace(/^"|"$/g, "").split(',')[index]
            )} - ${formatTime(poll.EndTimes.trim().replace(/^"|"$/g, "").split(',')[index])}</div>
          `;
      } else {
        pollRow.innerHTML = `
          <div class="column-title">${poll.PollName}</div>
          <div class="column-date">No responses yet.</div>
        `;
      }
      container.appendChild(pollRow);
    });
  } else {
    container.innerHTML = '<div class="empty">No past bookings or polls</div>';
  }
}

function displayReservedBookings(reservedBookings, container) {
  if (reservedBookings.length > 0) {
    reservedBookings.forEach((reservedBooking) => {
      const meetingDates = JSON.parse(reservedBooking.MeetingDates || "[]");
      const startTimes = JSON.parse(reservedBooking.StartTimes || "[]");
      const endTimes = JSON.parse(reservedBooking.EndTimes || "[]");

      const bookingRow = document.createElement("div");
      bookingRow.className = "booking-row reserved";
      bookingRow.onclick = () => showAttendingPopup(reservedBooking);
      bookingRow.innerHTML = `
        <div class="column-title">${reservedBooking.BookingName}</div>
        <div class="column-date"><b>Date:</b> ${formatDate(meetingDates[0])}</div>
        <div class="column-time"><b>Time:</b> ${formatTime(
          startTimes[0]
        )} - ${formatTime(endTimes[0])}</div>
      `;
      container.appendChild(bookingRow);
    });
  } else {
    container.innerHTML =
      '<div class="empty">No reserved bookings available</div>';
  }
}



function formatDate(dateStr) {
  if (!dateStr) {
    return null;
  }
  const [year, month, day] = dateStr.split("-");
  const date = new Date(`${year}-${month}-${day}`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(timeStr) {
  if (!timeStr) {
    return null;
  }
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
  return `${formattedHour}:${minutes} ${period}`;
}

function formatDateTime(dateTimeStr) {
  console.log(dateTimeStr);
  if (!dateTimeStr) {
    return null;
  }

  const date = new Date(dateTimeStr);
  console.log(date);
  const options = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
return formattedDate;
console.log(formattedDate);
}

function getEarliestUpcomingDateWithTimes(dates, startTimes, endTimes) {
  const now = new Date();

  let earliestDate = null;
  let earliestStartTime = null;
  let earliestEndTime = null;

  dates.forEach((date, index) => {
    const [year, month, day] = date.trim().split("-").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));

    if (dateObj >= now && (!earliestDate || dateObj < new Date(earliestDate))) {
      earliestDate = dateObj;
      earliestStartTime = startTimes[index];
      earliestEndTime = endTimes[index];
    }
  });

  return {
    earliestDate: earliestDate
      ? earliestDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })
      : null,
    startTime: earliestStartTime,
    endTime: earliestEndTime,
  };
}

function formatFrequency(frequency) {
  return (
    frequency.charAt(0).toUpperCase() + frequency.slice(1).replace(/-/g, " ")
  );
}

function getFirst(poll) {

  const votes = poll.VoteCounts.trim().replace(/^"|"$/g, "").split(",");
  var max = 0;
  var index = 0;
  votes.forEach((vote, i) => {
      if (max < vote) {
          max = vote;
          index = i;
      }
  });

  if (max == 0) {
      index = -1;
  }

  return index;

}

function closePopup(popupID) {
  const popup = document.getElementById(popupID);
  popup.style.display = "none";
}

function showAlternatePopup(request) {
  const alternatePopup = document.getElementById("alternate-details-popup");
  alternatePopup.style.display = "flex";

  alternatePopup.querySelector(".modal-header h2").textContent =
    request.BookingName;
  document.querySelector(".button.decline").addEventListener("click", () => {
    declineAlternateRequest(request.ID);
  });
  const acceptButton = alternatePopup.querySelector(".button.accept");
  acceptButton.style.display = "none"; // Hide button if no date/time option is selected
  acceptButton.onclick = () => {
    const selectedOption = document.querySelector(".time-item.selected");
    if (selectedOption) {
      const date = selectedOption.dataset.date;
      const startTime = selectedOption.dataset.start;
      const endTime = selectedOption.dataset.end;
      const message = document.getElementById("message").value.trim();
      acceptAlternateRequest(request.ID, { date, startTime, endTime }, message);
    }
  };

  const requestInfoHTML = `
        <div class="request-info">
            <p><b>Requester Name:</b> ${request.FullName}</p>
            <p><b>Requester Email:</b> ${request.Email}</p>
            <p><b>Reason:</b> ${request.Details}</p>
        </div>
    `;

  const dates = request.DateOptions.split(",").map((date) =>
    date.trim().replace(/^"|"$/g, "")
  );
  const startTimes = request.StartTimes.split(",").map((time) =>
    time.trim().replace(/^"|"$/g, "")
  );
  const endTimes = request.EndTimes.split(",").map((time) =>
    time.trim().replace(/^"|"$/g, "")
  );

  let timeSuggestionsHTML = dates
    .map((date, index) => {
      const [year, month, day] = date.split("-").map(Number);
      const dateObject = new Date(year, month - 1, day - 1);
      console.log("full date" + dateObject);
      const formattedDateObject = dateObject.toISOString().split("T")[0];

      return `
            <li>
                <div class="time-item"
                    data-date="${formattedDateObject}"
                    data-start="${startTimes[index]}"
                    data-end="${endTimes[index]}">
                    <span>${formatDate(date)}</span>
                    <span>${formatTime(startTimes[index])} - ${formatTime(
        endTimes[index]
      )}</span>
                </div>
            </li>
        `;
    })
    .join("");

  timeSuggestionsHTML = `
        <h3>Time Suggestions</h3>
        <ul class="times-list">
            ${timeSuggestionsHTML}
        </ul>
    `;

  const messageFieldHTML = `
        <div class="message-field">
            <label for="message">Message (Optional):</label>
            <textarea id="message" name="message" rows="4" placeholder="Add a message for the requester..."></textarea>
        </div>
    `;

  alternatePopup.querySelector(".modal-body.alternate").innerHTML = `
        <div class="request-times">
            ${requestInfoHTML}
            ${timeSuggestionsHTML}
        </div>
        ${messageFieldHTML}
    `;

  // Attach event listeners to time suggestion items
  const timeItems = alternatePopup.querySelectorAll(".time-item");
  timeItems.forEach((item) => {
    item.addEventListener("click", () => {
      timeItems.forEach((el) => el.classList.remove("selected")); // Deselect all other time items
      item.classList.add("selected"); // Select the clicked item
      acceptButton.style.display = "block"; // Show the accept button
    });
  });
}

function showBookingPopup(booking, inHistory = false) {
  const bookingPopup = document.getElementById("booking-details-popup");
  bookingPopup.style.display = "flex";

  bookingPopup.querySelector(".modal-header h2").textContent =
    booking.BookingName;
  // bookingPopup.querySelector(".delete-btn").setAttribute('onclick', `deleteBooking(${booking.ID})`);
  const formatParameter = (param) =>
    param === -1 || param === "-1" ? "" : param;

  bookingPopup.querySelector(".modal-body").innerHTML = `
    <p><b>Details:</b> ${formatParameter(booking.Details) || "None"}</p>
    <p><b>Location:</b> ${formatParameter(booking.Location) || "Undecided"}</p>
    <p><b>Max Participants:</b> ${
      formatParameter(booking.MaxAttendees) || "N/A"
    }</p>
        <div class="copy-container">
            <b>Zoom Link:</b>
            ${
              formatParameter(booking.MeetingLink)
                ? `<a href="${formatParameter(
                    booking.MeetingLink
                  )}" target="_blank" id="zoom-link">${formatParameter(
                    booking.MeetingLink
                  )}</a>
                    <button class="copy-btn" onclick="copyToClipboard('zoom-link')">Copy</button>`
                : "N/A"
            }
        </div>
        <div class="copy-container">
            <b>Booking URL:</b>
            ${
              booking.ID
                ? `<a href="http://localhost/RedBird/pages/book_meeting.html?id=${booking.hashedID}" target="_blank" id="meeting-url">http://localhost/RedBird/pages/book_meeting.html?id=${booking.ID}</a>
                    <button class="copy-btn" onclick="copyToClipboard('meeting-url')">Copy</button>`
                : "N/A"
            }

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

  if (booking.MeetingDates && booking.MeetingDates.trim()) {
    const meetingDates = booking.MeetingDates.trim()
      .replace(/^"|"$/g, "")
      .split(",");
    const startTimes = booking.StartTimes.trim()
      .replace(/^"|"$/g, "")
      .split(",");
    const endTimes = booking.EndTimes.trim().replace(/^"|"$/g, "").split(",");

    if (
      meetingDates.length !== startTimes.length ||
      meetingDates.length !== endTimes.length
    ) {
      console.error("Mismatch between dates and times. Please check the data.");
      scheduleList.innerHTML = "<li>Error loading schedule</li>";
      return;
    }

    meetingDates.forEach((date, index) => {
      const [year, month, day] = date
        .trim()
        .replace(/^"|"$/g, "")
        .split("-")
        .map(Number);
      const formattedDate = new Date(year, month - 1, day);

      const dayOfWeek = formattedDate.toLocaleString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      });
      var letterDay = dayOfWeek.charAt(0);

      if (dayOfWeek === "Tue" || dayOfWeek === "Thu" || dayOfWeek === "Sun") {
        letterDay = dayOfWeek.substring(0, 2);
      }

      const listItem = document.createElement("li");
      listItem.innerHTML = `
                <div class="day-icon">${letterDay}</div>
                <div class="time-info">
                    <h4>${formattedDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    })}</h4>
                    <span>${formatTime(startTimes[index])} - ${formatTime(
        endTimes[index]
      )}</span>
                </div>
            `;
      scheduleList.appendChild(listItem);
    });
  } else {
    scheduleList.innerHTML = "<li>No scheduled meetings</li>";
  }

  if (inHistory) {
    // Disable edit and delete buttons for history
    bookingPopup.querySelector(".modal-footer").style.display = "none";
  } else {
    // Enable edit and delete buttons for active bookings
    bookingPopup
      .querySelector(".delete-btn")
      .setAttribute("onclick", `deleteBooking(${booking.ID})`);
    bookingPopup
      .querySelector(".edit-btn")
      .setAttribute("onclick", `editBooking(${booking.ID})`);
  }
}

function showAttendingPopup(reservedBooking) {
  const attendingPopup = document.getElementById("attending-booking-details-popup");
  attendingPopup.style.display = "flex";

  const meetingDates = JSON.parse(reservedBooking.MeetingDates || "[]");
  const startTimes = JSON.parse(reservedBooking.StartTimes || "[]");
  const endTimes = JSON.parse(reservedBooking.EndTimes || "[]");

  attendingPopup.querySelector(".modal-header h2").textContent = reservedBooking.BookingName;

  attendingPopup.querySelector(".modal-body").innerHTML = `
    <p><b>Details:</b> ${reservedBooking.Details || "None"}</p>
    <p><b>Location:</b> ${reservedBooking.Location || "Undecided"}</p>
    <p><b>Date:</b> ${formatDate(meetingDates[0]) || "Undecided"}</p>
    <p><b>Time:</b> ${formatTime(startTimes[0])} - ${formatTime(endTimes[0])}</p>
    <p><b>Meeting Link:</b> ${
      reservedBooking.MeetingLink && reservedBooking.MeetingLink !== "-1"
        ? `<a href="${reservedBooking.MeetingLink}" target="_blank">Join Meeting</a>`
        : "Not provided"
    }</p>
    <p><b>Attachments:</b> ${
      reservedBooking.Attachments && reservedBooking.Attachments !== "-1"
        ? `<a href="${reservedBooking.Attachments}" target="_blank">View Attachments</a>`
        : "No attachments"
    }</p>
  `;
}


function showPollPopup(poll, inHistory = false) {
  const pollPopup = document.getElementById("poll-details-popup");
  pollPopup.style.display = "flex";

  const pollUrl = `http://localhost/RedBird/pages/answer_poll.html?pollID=${poll.hashedID}`;

  pollPopup.querySelector(".modal-header h2").textContent = poll.PollName;
  pollPopup.querySelector(".modal-body").innerHTML = `
        <p><b>Details:</b> ${poll.Details || "None"}</p>
        <p><b>Poll Close Date:</b> ${
          poll.PollCloseDateTime ? formatDateTime(poll.PollCloseDateTime) : "No date set yet"
        }</p>
        <div class="copy-container">
            <b>Poll URL:</b>
            ${
              poll.ID
                ? `<a href="${pollUrl}" target="_blank" id="poll-url">${pollUrl}</a>
                    <button class="copy-btn" onclick="copyToClipboard('poll-url')">Copy</button>`
                : "N/A"
            }

        </div>
        <div class="poll-results">
            <h3>Poll Results</h3>
            <ul class="poll-results-list">
            </ul>
        </div>
    `;
  populatePollResults(poll);

  if (inHistory) {
    pollPopup.querySelector(".modal-footer").style.display = "none";
  } else {
    pollPopup
      .querySelector(".delete-btn")
      .setAttribute("onclick", `closePoll(${poll.ID})`);
  }
}

function populatePollResults(poll) {
  const dates = poll.DateOptions.split(",").map((date) =>
    date.trim().replace(/^"|"$/g, "")
  );
  const startTimes = poll.StartTimes.split(",").map((time) =>
    time.trim().replace(/^"|"$/g, "")
  );
  const endTimes = poll.EndTimes.split(",").map((time) =>
    time.trim().replace(/^"|"$/g, "")
  );
  const voteCounts = poll.VoteCounts.split(",").map((vote) =>
    parseInt(vote.trim().replace(/^"|"$/g, ""), 10)
  );

  const maxVotes = Math.max(...voteCounts);

  // Sort the pollData by votes in descending order
  const pollData = dates.map((date, index) => ({
    date: date,
    startTime: startTimes[index],
    endTime: endTimes[index],
    votes: voteCounts[index],
  }));
  pollData.sort((a, b) => b.votes - a.votes);

  const pollResultsList = document.querySelector(".poll-results-list");
  pollResultsList.innerHTML = "";

  pollData.forEach((option) => {
    const pollOption = document.createElement("div");
    pollOption.classList.add("poll-option");

    const pollLabel = document.createElement("div");
    pollLabel.classList.add("poll-label");
    pollLabel.innerHTML = `
            <h4>${formatDate(option.date)}</h4>
            <span>${formatTime(option.startTime)} - ${formatTime(
      option.endTime
    )}</span>
        `;

    const pollBar = document.createElement("div");
    pollBar.classList.add("poll-bar");
    const percentage = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
    pollBar.style.setProperty("--bar-width", `${percentage}%`);
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

  console.log("bookingid" + bookingId);

  fetch("http://localhost/RedBird/pages/deleteBooking.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bookingId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        alert("Booking deleted successfully!");
        location.reload(); // Reload the page to update the booking list
      } else {
        alert("Failed to delete booking. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error deleting booking:", error);
      alert("An error occurred while deleting the booking. Please try again.");
    });
}

function editBooking(bookingId) {
  if (!confirm("Are you sure you want to edit this booking?")) {
    return; // Exit if the user cancels the action
  }
  console.log("Redirecting to edit booking page with bookingId:", bookingId);
  window.location.replace(`http://localhost/RedBird/pages/edit_booking.html?bookingId=${bookingId}`);
}

function closePoll(pollID) {
  if (!confirm("Are you sure you want to close this poll?")) {
    return;
  }

  const closeTime = new Date().toISOString().replace("Z", ""); // Current timestamp
  // console.log("closetime"+closeTime);

  fetch("http://localhost/RedBird/pages/closePoll.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pollID, closeTime }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response from server:", data);
      if (data.success) {
        alert("Poll closed successfully!");
        location.reload();
      } else {
        alert("Failed to close poll: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error closing poll:", error);
      alert("An error occurred while closing the poll. Please try again.");
    });
}

function declineAlternateRequest(requestID) {
  const message = document.getElementById("message").value.trim(); // Get the optional message
  if (!confirm("Are you sure you want to decline this request?")) {
    return;
  }

  fetch("http://localhost/RedBird/pages/declineAlternateRequest.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestID, status: "declined", message }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response from server:", data);
      if (data.success) {
        alert("Request declined successfully!");
        location.reload();
      } else {
        alert("Failed to decline request: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error declining request:", error);
      alert("An error occurred while declining the request. Please try again.");
    });
}

function acceptAlternateRequest(alternateRequestID, selectedOption, message) {
  const payload = {
    alternateRequestID: alternateRequestID,
    date: selectedOption.date,
    startTime: selectedOption.startTime,
    endTime: selectedOption.endTime,
    message: message,
  };
  console.log(payload);

  fetch("http://localhost/RedBird/pages/acceptAlternateRequest.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const bookingId = data.bookingId;
        alert(
          "A booking has been created for the alternate request! Optionally, make any adjustments now."
        );
        location.reload();
        window.location.replace(`http://localhost/RedBird/pages/edit_booking.html?bookingId=${bookingId}`);
      } else {
        alert("Failed to accept alternate request: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error accepting alternate request:", error);
      alert("An error occurred. Please try again.");
    });
}
