document.addEventListener("DOMContentLoaded", () => {
  const userId = 1; // Replace with the actual logged-in user's ID
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

  console.log("Starting fetch");
  fetch(`http://localhost/redbird/pages/displayDashboard.php`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched Data:", data);
      if (data.error) {
        console.error("Error from server:", data.error);
        if (data.error === "User not authenticated") {
          window.location.replace("http://localhost/redbird/pages/login.php");
        } else {
          alert("An error occurred: " + data.error);
        }
        return;
      }
      const bookings = data.bookings || [];
      const polls = data.polls || [];
      const pastBookings = data.pastBookings || [];
      const pastPolls = data.pastPolls || [];
      const alternateRequests = data.alternateRequests || [];

      // Clear existing bookings and polls
      bookingContainer.innerHTML = "";
      pollsContainer.innerHTML = "";
      historyContainer.innerHTML = "";
      alternateRequestsContainer.innerHTML = "";

      // Display alternate requests
      if (alternateRequests.length > 0) {
        alternateRequests.forEach((request) => {
          const requestRow = document.createElement("div");
          requestRow.className = "booking-row pending";
          requestRow.onclick = () => showAlternatePopup(request);
          requestRow.innerHTML = `
                        <div class="column-title">${request.BookingName}</div>
                        <div class="column-message"><b>Reason:</b> ${request.Details}</div>
                    `;
          alternateRequestsContainer.appendChild(requestRow);
        });
      } else {
        alternateRequestsContainer.innerHTML =
          '<div class="empty">No alternate requests</div>';
      }

      // Display bookings
      if (bookings.length > 0) {
        bookings.forEach((booking) => {
          const meetingDates = booking.MeetingDates.trim()
            .replace(/^"|"$/g, "")
            .split(",");
          const startTimes = booking.StartTimes.trim()
            .replace(/^"|"$/g, "")
            .split(",");
          const endTimes = booking.EndTimes.trim()
            .replace(/^"|"$/g, "")
            .split(",");

          if (
            meetingDates.length !== startTimes.length ||
            meetingDates.length !== endTimes.length
          ) {
            console.error(
              "Mismatch between MeetingDates, StartTimes, and EndTimes for booking:",
              booking.BookingName
            );
            return;
          }

          const { earliestDate, startTime, endTime } =
            getEarliestUpcomingDateWithTimes(
              meetingDates,
              startTimes,
              endTimes
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
          bookingContainer.appendChild(bookingRow);
        });
      } else {
        bookingContainer.innerHTML =
          '<div class="empty">No bookings created yet</div>';
      }

      // Display polls
      if (polls.length > 0) {
        polls.forEach((poll) => {
          const pollRow = document.createElement("div");
          pollRow.className = "booking-row created";
          pollRow.onclick = () => showPollPopup(poll);
          pollRow.innerHTML = `
                        <div class="column-title">${poll.PollName}</div>
                        <div class="column-date"><b>Preferred Date:</b> ${getFirst(
                          poll.DateOptions
                        )}</div>
                        <div class="column-time"><b>Preferred Time:</b> ${formatTime(
                          getFirst(poll.StartTimes)
                        )} - ${formatTime(getFirst(poll.EndTimes))}</div>
                    `;
          pollsContainer.appendChild(pollRow);
        });
      } else {
        pollsContainer.innerHTML =
          '<div class="empty">No polls created yet</div>';
      }

      // Display past bookings in history
      if (pastBookings.length > 0) {
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
          historyContainer.appendChild(bookingRow);
        });
      }
      // Display past polls
      if (pastPolls.length > 0) {
        pastPolls.forEach((poll) => {
          const pollRow = document.createElement("div");
          pollRow.className = "booking-row past";
          pollRow.onclick = () => showPollPopup(poll, true);
          pollRow.innerHTML = `
                        <div class="column-title">${poll.PollName}</div>
                        <div class="column-date"><b>Preferred Date:</b> ${getFirst(
                          poll.DateOptions
                        )}</div>
                        <div class="column-time"><b>Preferred Time:</b> ${formatTime(
                          getFirst(poll.StartTimes)
                        )} - ${formatTime(getFirst(poll.EndTimes))}</div>
                    `;
          historyContainer.appendChild(pollRow);
        });
      }
      if (pastBookings.length === 0 && pastPolls.length === 0) {
        historyContainer.innerHTML =
          '<div class="empty">No past bookings or polls</div>';
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      window.location.replace("http://localhost/RedBird/pages/login.php");
      // bookingContainer.innerHTML =
      //   '<div class="error">Error loading bookings.</div>';
      // pollsContainer.innerHTML =
      //   '<div class="error">Error loading polls.</div>';
    });
});

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

function getFirst(options) {
  if (!options) {
    return "None";
  }
  const optionList = options.split(",");
  const first = optionList[0].trim().replace(/^"|"$/g, "");
  return first || "None";
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
    <p><b>Time Slot:</b> ${
      formatParameter(booking.TimeSlotLength)
        ? `${formatParameter(booking.TimeSlotLength)} minutes`
        : "N/A"
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

function showPollPopup(poll, inHistory = false) {
  const pollPopup = document.getElementById("poll-details-popup");
  pollPopup.style.display = "flex";

  const pollUrl = `http://localhost/RedBird/pages/answer_poll.html?pollID=${poll.hashedID}`;

  pollPopup.querySelector(".modal-header h2").textContent = poll.PollName;
  pollPopup.querySelector(".modal-body").innerHTML = `
        <p><b>Details:</b> ${poll.Details || "None"}</p>
        <p><b>Poll Close Date:</b> ${
          poll.PollCloseDateTime ? poll.PollCloseDateTime : "No date set yet"
        }</p>
        <p><b>Poll URL:</b> 
            <a href="${pollUrl}" target="_blank">${pollUrl}</a>
            <button class="copy-btn" onclick="copyPollUrl('${pollUrl}')">Copy</button>
        </p>
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
function copyPollUrl(url) {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showAlert("Poll URL copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy URL: ", err);
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

  fetch("http://localhost/redbird/pages/deleteBooking.php", {
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
  window.location.replace(
    `http://localhost/redbird/pages/edit_booking.html?bookingId=${bookingId}`
  );
}

function closePoll(pollID) {
  if (!confirm("Are you sure you want to close this poll?")) {
    return;
  }

  const closeTime = new Date().toISOString().replace("Z", ""); // Current timestamp
  // console.log("closetime"+closeTime);

  fetch("http://localhost/redbird/pages/closePoll.php", {
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

  fetch("http://localhost/redbird/pages/declineAlternateRequest.php", {
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

  fetch("http://localhost/redbird/pages/acceptAlternateRequest.php", {
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
        window.location.replace(
          `http://localhost/redbird/pages/edit_booking.html?bookingId=${bookingId}`
        );
      } else {
        alert("Failed to accept alternate request: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error accepting alternate request:", error);
      alert("An error occurred. Please try again.");
    });
}
