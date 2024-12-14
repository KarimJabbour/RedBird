let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let highlighted = [];
let startTimes = [];
let endTimes = [];
let availability = {};

document.addEventListener("DOMContentLoaded", function () {
  populateCalendar(currentMonth, currentYear);
  getDates();
});

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

    timeOptionsContainer.appendChild(timeSlotCard);
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
