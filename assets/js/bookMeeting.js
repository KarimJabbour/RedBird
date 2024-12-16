let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let highlighted = [];
let startTimes = [];
let endTimes = [];
let availability = {};
let global_bookingID = "";
document.addEventListener("DOMContentLoaded", function () {
  populateCalendar(currentMonth, currentYear);
  getDates();
  loadUserDetails();
});

function loadUserDetails() {
  fetch("../includes/user_data.php", {
    method: "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      return response.json();
    })
    .then((userDetails) => {
      if (userDetails.error) {
        console.error("Error fetching user details:", userDetails.error);
        return;
      }

      // Populate the HTML elements with user details
      document.getElementById("fullname").value = userDetails.full_name || "";
      document.getElementById("mcgillemail").value = userDetails.email || "";
      document.getElementById("mcgillid").value = userDetails.mcgillID || "";
    })
    .catch((error) => {
      console.error("Error loading user details:", error);
    });
}

function getDates() {
  fetchAvailableDates()
    .then((availableDates) => {
      highlighted = availableDates;
      highlightAvailableDates(availableDates);
    })
    .catch((error) => {
      console.error("Error fetching available dates:", error);
    });
}

async function fetchAvailableDates() {
  try {
    // Retrieve the bookingId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get("id"); // Extracts the 'id' from the URL
    global_bookingID = urlParams.get("id");
    if (!bookingId) {
      throw new Error("Booking ID is missing in the URL.");
    }

    // Fetch data using the dynamic bookingId
    const response = await fetch(`bookMeeting.php?id=${bookingId}`);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    console.log("Fetched available dates:", data);

    highlighted = data.MeetingDates.map((date) => date.trim());
    startTimes = data.StartTimes.map((time) => time.trim());
    endTimes = data.EndTimes.map((time) => time.trim());

    populateBookingDetails(data);

    return highlighted;
  } catch (error) {
    console.error("Failed to fetch available dates:", error);
    return [];
  }
}

function populateCalendar(month, year) {
  const calendarGrid = document.getElementById("calendar-grid");
  const monthYearDisplay = document.getElementById("month-year");

  calendarGrid.innerHTML = "";

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 0; i < 7; i++) {
    const div = document.createElement("div");
    div.classList.add("day-header");
    div.innerText = dayNames[i];
    calendarGrid.appendChild(div);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < adjustedFirstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("day", "empty");
    calendarGrid.appendChild(emptyDiv);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = day;

    const date = new Date(year, month, day).toISOString().split("T")[0];
    dayDiv.setAttribute("data-date", date);

    dayDiv.addEventListener("click", function () {
      if (highlighted.includes(date)) {
        displayTimeForDate(date);
      }
    });

    calendarGrid.appendChild(dayDiv);
  }
}

function highlightAvailableDates(availableDates) {
  const calendarDays = document.querySelectorAll(".day[data-date]");

  calendarDays.forEach((day) => {
    const date = day.getAttribute("data-date");
    if (availableDates.includes(date)) {
      day.classList.add("highlight");
    } else {
      day.classList.add("disabled");
      day.style.pointerEvents = "none"; // Prevent interaction with disabled dates
    }
  });
}

let selectedSlot = null;

function displayTimeForDate(selectedDate) {
  const timeOptionsContainer = document.getElementById("time-slots-list");
  timeOptionsContainer.innerHTML = "";

  const calendarDays = document.querySelectorAll(".day[data-date]");
  calendarDays.forEach((day) => {
    day.classList.remove("selected-date");
  });
  const selectedDayElement = document.querySelector(
    `.day[data-date='${selectedDate}']`
  );
  if (selectedDayElement) {
    selectedDayElement.classList.add("selected-date");
  }

  const indices = highlighted.reduce((acc, date, index) => {
    if (date === selectedDate) acc.push(index);
    return acc;
  }, []);

  indices.forEach((index) => {
    const timeSlotCard = document.createElement("div");
    timeSlotCard.classList.add("time-slot-card", "available");

    const timeHeading = document.createElement("h3");
    timeHeading.textContent = `${startTimes[index]} - ${endTimes[index]}`;
    timeSlotCard.appendChild(timeHeading);

    const statusParagraph = document.createElement("p");
    statusParagraph.innerHTML = `Status: <span>Available</span>`;
    timeSlotCard.appendChild(statusParagraph);

    timeSlotCard.addEventListener("click", function () {
      selectTimeSlot(selectedDate, startTimes[index], endTimes[index]);
    });

    timeOptionsContainer.appendChild(timeSlotCard);
  });
}

function selectTimeSlot(date, startTime, endTime) {
  const timeSlotCards = document.querySelectorAll(".time-slot-card");
  timeSlotCards.forEach((card) => card.classList.remove("selected"));

  const selectedSlotCard = [...timeSlotCards].find((card) => {
    return card.querySelector("h3").textContent === `${startTime} - ${endTime}`;
  });

  if (selectedSlotCard) {
    selectedSlotCard.classList.add("selected");
  }

  selectedSlot = { date, startTime, endTime };

  const detailsElement = document.getElementById("booking-details");
  const selectedDetails = `
        <strong>Selected Date:</strong> ${date} <br>
        <strong>Selected Time:</strong> ${startTime} - ${endTime}
    `;
  detailsElement.querySelector("p").innerHTML = selectedDetails;

  console.log(`Selected time slot:`, selectedSlot);
}

function bookMeeting() {
  if (!selectedSlot) {
    alert("Please select a time slot before booking.");
    return;
  }

  const fullname = document.getElementById("fullname").value;
  const email = document.getElementById("mcgillemail").value;
  const mcgillid = document.getElementById("mcgillid").value;
  if (!email || !mcgillid || !fullname) {
    alert("Please fill out your personal details before booking.");
    return;
  }
  const validEmail = /@(mail\.mcgill\.ca|mcgill\.ca)$/;
  if (!validEmail.test(email)) {
    alert(
      "Please enter a valid McGill email address ending with @mail.mcgill.ca or @mcgill.ca."
    );
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("id");

  if (!bookingId) {
    alert("Booking ID is missing in the URL.");
    return;
  }

  const requestData = {
    booking_id: bookingId,
    MeetingDates: JSON.stringify([selectedSlot.date]),
    StartTimes: JSON.stringify([selectedSlot.startTime]),
    EndTimes: JSON.stringify([selectedSlot.endTime]),
    full_name: fullname,
    email: email,
    mcgill_id: mcgillid,
  };

  console.log("Booking meeting with data:", requestData);

  fetch("updateBookingParticipant.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to book meeting.");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        console.log("Booking response:", data);
        // alert("Meeting successfully booked!");

        // Call the email script to send a confirmation email
        return sendEmailConfirmation(email, bookingId);
      } else {
        alert("Error booking meeting: " + (data.error || "Unknown error"));
        console.error("Server error:", data);
      }
    })
    .then(() => {
      // Redirect to the dashboard after successful booking and email
      window.location.href = "/RedBird/pages/dashboard.html";
    })
    .catch((error) => {
      alert("Error booking meeting.");
      console.error("Booking error:", error);
    });
}

function sendEmailConfirmation(email, bookingId) {
  const emailData = {
    email: email,
    bookingID: bookingId,
  };

  return fetch("../mail/sendBookingReservation.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send email confirmation.");
      }
      return response.text();
    })
    .then((result) => {
      console.log("Email confirmation result:", result);
      alert("Meeting successfully booked! Email confirmation sent!");
    })
    .catch((error) => {
      console.error("Error sending email confirmation:", error);
      alert("Failed to send email confirmation.");
    });
}

function changeMonth(direction) {
  currentMonth += direction;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  populateCalendar(currentMonth, currentYear);
  highlightAvailableDates(highlighted);
}

function populateBookingDetails(data) {
  const titleElement = document.getElementById("booking-title");
  titleElement.querySelector("h2").textContent =
    data.BookingName || "Untitled Booking";

  const detailsElement = document.getElementById("booking-details");
  detailsElement.querySelector("p").textContent =
    data.Details || "No additional details provided.";

  const locationElement = document.getElementById("booking-location");
  locationElement.querySelector("p").textContent =
    data.Location || "No location specified.";
}
