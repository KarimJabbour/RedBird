// Global variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let recurringDates = []; // Stores the computed recurring dates
let manualAdjustments = new Set(); // Tracks manual additions/removals of dates
let deselectedDates = new Set(); // Manually deselected dates
let recurringDayTimes = {}; // Stores start/end times for recurring days
let highlighted = []; // To store highlighted dates
let startTimes = [];
let endTimes = [];

document.addEventListener("DOMContentLoaded", function () {
  populateCalendar(currentMonth, currentYear);

  //placeholder value
  //const bookingId = 66;
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("bookingId");
  if (bookingId) {
    console.log("Booking ID:", bookingId);

    // Fetch booking data or handle the booking ID
    fetch(
      `http://localhost/RedBird/pages/editBooking.php?bookingId=${bookingId}`
    )
      .then((response) => response.json())
      .then((bookingData) => {
        loadBookingData(bookingData);
        getDates(bookingData);
      })
      .catch((error) => console.error("Error fetching booking data:", error));
  }

  const defaultStartTimeInput = document.getElementById("start-time");
  const defaultEndTimeInput = document.getElementById("end-time");

  defaultStartTimeInput.addEventListener("input", () => {
    console.log("default start changed");
    applyDefaultTimesToTimeCards();
  });

  defaultEndTimeInput.addEventListener("input", () => {
    console.log("default end changed");
    applyDefaultTimesToTimeCards();
  });

  document
    .getElementById("recurring-timeline")
    .addEventListener("change", () => {
      console.log("Frequency changed");
      updateCalendar();
    });

  document.getElementById("start-date").addEventListener("change", () => {
    console.log("Start date changed");
    updateCalendar();
  });

  document.getElementById("end-date").addEventListener("change", () => {
    console.log("End date changed");
    updateCalendar();
  });

  const daySelector = document.querySelectorAll("input[name='days[]']");
  daySelector.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      console.log("Day selected/changed:", checkbox.value, checkbox.checked);

      if (!checkbox.checked) {
        // Clear deselected dates when a recurrence day is unchecked
        deselectedDates.clear();
        console.log(
          "Cleared deselectedDates because recurrence day was unchecked."
        );
      }

      // updateRecurringDayTimes(checkbox.value, checkbox.checked);
      updateTimeCards();
      updateCalendar();
    });
  });

  document
    .getElementById("booking-form")
    .addEventListener("submit", function (event) {
      //event.preventDefault();
      document.getElementById("booking-id").value = bookingId;

      if (!validateTimeCards()) {
        alert(
          "Please ensure all time cards have both start and end times filled."
        );
        return;
      }

      const meetingDates = [];
      const startTimes = [];
      const endTimes = [];

      const recurrenceDays = getRecurrenceDays();
      const frequency = document.getElementById("recurring-timeline").value;
      const startDate = document.getElementById("start-date").value;
      const endDate = document.getElementById("end-date").value;
      updateDayTimesFromCards();

      if (frequency === "monthly") {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Iterate through each month in the range
        for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
          const currentMonth = d.getMonth();
          const currentYear = d.getFullYear();

          // Iterate through all manually adjusted day-of-month entries
          Object.keys(recurringDayTimes).forEach((dayOfMonth) => {
            const day = parseInt(dayOfMonth, 10);
            const recurrenceDate = new Date(currentYear, currentMonth, day);

            // Ensure the calculated date is valid and within the range
            if (
              recurrenceDate.getMonth() === currentMonth &&
              recurrenceDate >= start &&
              recurrenceDate <= end
            ) {
              const formattedDate = recurrenceDate.toISOString().split("T")[0];
              recurringDayTimes[dayOfMonth].forEach((time) => {
                meetingDates.push(formattedDate);
                startTimes.push(time.start);
                endTimes.push(time.end);
              });
            }
          });
        }
      } else {
        // Process recurring dates with their times
        if (recurrenceDays.length > 0 && startDate && endDate) {
          const computedRecurringDates = calculateRecurringDates(
            startDate,
            endDate,
            document.getElementById("recurring-timeline").value,
            recurrenceDays
          );
          console.log("Updated Recurring Day Times:", recurringDayTimes);

          computedRecurringDates.forEach((date) => {
            const dayOfWeek = new Date(date).getDay();
            const dayKey = ["M", "T", "W", "Th", "F", "S", "Su"][dayOfWeek];

            console.log("Processing date:", date, "with dayKey:", dayKey);

            if (recurringDayTimes[dayKey]) {
              recurringDayTimes[dayKey].forEach((time) => {
                console.log(
                  `Adding for ${date}: Start - ${time.start}, End - ${time.end}`
                );
                meetingDates.push(date);
                startTimes.push(time.start);
                endTimes.push(time.end);
              });
            }
          });
        }

        // Process manually selected dates
        manualAdjustments.forEach((date) => {
          if (recurringDayTimes[date]) {
            recurringDayTimes[date].forEach((time) => {
              meetingDates.push(date);
              startTimes.push(time.start);
              endTimes.push(time.end);
            });
          }
        });
      }

      // // const highlightedDates = getHighlightedDates();
      document.getElementById("highlighted-dates").value =
        meetingDates.join(",");
      document.getElementById("start-times").value = startTimes.join(",");
      document.getElementById("end-times").value = endTimes.join(",");
      document.getElementById("recurring-days").value =
        recurrenceDays.join(",");

      console.log("Final Submission Data:");
      console.log("Meeting Dates:", meetingDates);
      console.log("Start Times:", startTimes);
      console.log("End Times:", endTimes);
      console.log("Recurrence Days:", recurrenceDays);
    });
});

// Function to apply default times to all time cards
function applyDefaultTimesToTimeCards() {
  const timeCards = document.querySelectorAll(".time-card");
  timeCards.forEach(applyDefaultTimesToTimeCard);
}

// Apply default times to a specific time card
function applyDefaultTimesToTimeCard(card) {
  const defaultStartTime = document.getElementById("start-time").value;
  const defaultEndTime = document.getElementById("end-time").value;

  if (!card) return;

  const startInput = card.querySelector(".start-time");
  const endInput = card.querySelector(".end-time");

  if (startInput && !startInput.value && defaultStartTime)
    startInput.value = defaultStartTime;
  if (endInput && !endInput.value && defaultEndTime)
    endInput.value = defaultEndTime;
}

function validateTimeCards() {
  const timeCards = document.querySelectorAll(".time-card");
  let allFilled = true;

  timeCards.forEach((card) => {
    const startInput = card.querySelector(".start-time");
    const endInput = card.querySelector(".end-time");

    if (!startInput.value || !endInput.value) {
      allFilled = false;
    }
  });

  return allFilled;
}

function updateDayTimesFromCards() {
  const timeCardContainer = document.querySelector(".time-cards");
  recurringDayTimes = {}; // Reset recurringDayTimes

  const timeCards = timeCardContainer.querySelectorAll(".time-card");
  timeCards.forEach((card) => {
    const day =
      card.getAttribute("data-day") ||
      card.getAttribute("data-date") ||
      card.querySelector("h3").textContent.trim();

    if (!recurringDayTimes[day]) {
      recurringDayTimes[day] = [];
    }

    const startTimeInputs = card.querySelectorAll(".start-time");
    const endTimeInputs = card.querySelectorAll(".end-time");

    startTimeInputs.forEach((startInput, index) => {
      const start = startInput.value;
      const end = endTimeInputs[index]?.value;

      if (start && end) {
        recurringDayTimes[day].push({ start, end });
      }
    });
  });

  console.log("Updated Recurring Day Times:", recurringDayTimes); // Debug log
}

function generateRecurrenceTimeCards(recurrenceDays) {
  const timeCardContainer = document.querySelector(".time-cards");
  timeCardContainer.innerHTML = ""; // Clear existing time cards

  recurrenceDays.forEach((day) => {
    const timeCard = document.createElement("div");
    timeCard.classList.add("time-card");

    // Card title
    const title = document.createElement("h3");
    title.textContent = `${day}`;
    timeCard.appendChild(title);

    const timeSlotRow = document.createElement("div");
    timeSlotRow.classList.add("time-slot-row");

    // Start Time input
    const startTimeLabel = document.createElement("label");
    startTimeLabel.classList.add("time-slot-label");
    startTimeLabel.innerHTML = `
            <b>Start Time:</b>
            <input type="time" class="time-slot start-time" data-day="${day}" required>
        `;
    timeSlotRow.appendChild(startTimeLabel);

    // End Time input
    const endTimeLabel = document.createElement("label");
    endTimeLabel.classList.add("time-slot-label");
    endTimeLabel.innerHTML = `
            <b>End Time:</b>
            <input type="time" class="time-slot end-time" data-day="${day}" required>
        `;
    timeSlotRow.appendChild(endTimeLabel);
    timeCard.appendChild(timeSlotRow);

    // Add button for additional slots (optional)
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "+ Add Time";
    addButton.classList.add("add-time-btn");
    addButton.addEventListener("click", () => {
      addTimeSlot(timeCard, day);
    });
    timeCard.appendChild(addButton);

    timeCardContainer.appendChild(timeCard);
    applyDefaultTimesToTimeCard(timeCard);
  });
}

function generateManualTimeCard(date) {
  const timeCardContainer = document.querySelector(".time-cards");

  const timeCard = document.createElement("div");
  timeCard.classList.add("time-card");
  timeCard.setAttribute("data-date", date);

  // Card title
  const title = document.createElement("h3");
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  console.log(formattedDate);

  title.textContent = formattedDate; // Display the date as the title
  timeCard.appendChild(title);

  const timeSlotRow = document.createElement("div");
  timeSlotRow.classList.add("time-slot-row");

  // Start Time input
  const startTimeLabel = document.createElement("label");
  startTimeLabel.classList.add("time-slot-label");
  startTimeLabel.innerHTML = `
        <b>Start Time:</b>
        <input type="time" class="time-slot start-time" data-date="${date}" required>
    `;
  timeSlotRow.appendChild(startTimeLabel);

  // End Time input
  const endTimeLabel = document.createElement("label");
  endTimeLabel.classList.add("time-slot-label");
  endTimeLabel.innerHTML = `
        <b>End Time:</b>
        <input type="time" class="time-slot end-time" data-date="${date}" required>
    `;
  timeSlotRow.appendChild(endTimeLabel);
  timeCard.appendChild(timeSlotRow);

  // Add button for additional slots (optional)
  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.textContent = "+ Add Time";
  addButton.classList.add("add-time-btn");
  addButton.addEventListener("click", () => {
    addTimeSlot(timeCard, date);
  });
  timeCard.appendChild(addButton);

  timeCardContainer.appendChild(timeCard);
  applyDefaultTimesToTimeCard(timeCard);
}

function generateMonthlyTimeCard(dayOfMonth) {
  const timeCardContainer = document.querySelector(".time-cards");

  const timeCard = document.createElement("div");
  timeCard.classList.add("time-card");
  timeCard.setAttribute("data-day", dayOfMonth);

  // Card title
  const title = document.createElement("h3");
  title.textContent = `Day ${dayOfMonth} (Monthly)`; // Title shows the day of the month
  timeCard.appendChild(title);

  const timeSlotRow = document.createElement("div");
  timeSlotRow.classList.add("time-slot-row");

  // Start Time input
  const startTimeLabel = document.createElement("label");
  startTimeLabel.classList.add("time-slot-label");
  startTimeLabel.innerHTML = `
        <b>Start Time:</b>
        <input type="time" class="time-slot start-time" data-day="${dayOfMonth}" required>
    `;
  timeSlotRow.appendChild(startTimeLabel);

  // End Time input
  const endTimeLabel = document.createElement("label");
  endTimeLabel.classList.add("time-slot-label");
  endTimeLabel.innerHTML = `
        <b>End Time:</b>
        <input type="time" class="time-slot end-time" data-day="${dayOfMonth}" required>
    `;
  timeSlotRow.appendChild(endTimeLabel);
  timeCard.appendChild(timeSlotRow);

  // Add button for additional slots (optional)
  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.textContent = "+ Add Time";
  addButton.classList.add("add-time-btn");
  addButton.addEventListener("click", () => {
    addTimeSlot(timeCard, dayOfMonth);
  });
  timeCard.appendChild(addButton);

  timeCardContainer.appendChild(timeCard);
  applyDefaultTimesToTimeCard(timeCard);
}

function addTimeSlot(timeCard, day) {
  // Create a new row for additional start and end time slots
  const timeSlotRow = document.createElement("div");
  timeSlotRow.classList.add("time-slot-row");

  const startTimeLabel = document.createElement("label");
  startTimeLabel.classList.add("time-slot-label");
  startTimeLabel.innerHTML = `
        <b>Start Time:</b>
        <input type="time" class="time-slot start-time" data-day="${day}" required>
    `;
  timeSlotRow.appendChild(startTimeLabel);

  const endTimeLabel = document.createElement("label");
  endTimeLabel.classList.add("time-slot-label");
  endTimeLabel.innerHTML = `
        <b>End Time:</b>
        <input type="time" class="time-slot end-time" data-day="${day}" required>
    `;
  timeSlotRow.appendChild(endTimeLabel);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "×";
  removeButton.classList.add("remove-btn");
  removeButton.addEventListener("click", () => {
    timeSlotRow.remove();
  });
  timeSlotRow.appendChild(removeButton);

  // Insert the new row before the "+ Add Time" button
  const addTimeButton = timeCard.querySelector(".add-time-btn");
  timeCard.insertBefore(timeSlotRow, addTimeButton);

  // Apply default times to the new row
  const defaultStartTime = document.getElementById("start-time").value;
  const defaultEndTime = document.getElementById("end-time").value;

  const startInput = timeSlotRow.querySelector(".start-time");
  const endInput = timeSlotRow.querySelector(".end-time");

  if (defaultStartTime) startInput.value = defaultStartTime;
  if (defaultEndTime) endInput.value = defaultEndTime;
}

function updateTimeCards() {
  const recurrenceDays = Array.from(
    document.querySelectorAll("input[name='days[]']:checked")
  ).map((cb) => cb.value);
  generateRecurrenceTimeCards(recurrenceDays);
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

  // Display current month and year on calendar
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

  const firstDay = new Date(year, month, 1).getDay(); // Day of the week (0 = Sunday)
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in the month

  // Adjust firstDay to align with Monday as the starting day
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  // Create empty slots for days before the first day of the month
  for (let i = 0; i < adjustedFirstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("day", "empty");
    calendarGrid.appendChild(emptyDiv);
  }

  // Populate days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = day;

    // Add data-date attribute for highlighting later
    const dateValue = year + month + day;
    const date = new Date(year, month, day).toISOString().split("T")[0]; // Format as YYYY-MM-DD
    dayDiv.setAttribute("data-date", date);

    // Handle manual date selection by toggling highlight
    dayDiv.addEventListener("click", function () {
      toggleDateSelection(date);
    });

    calendarGrid.appendChild(dayDiv);
  }

  updateCalendar();
}

function changeMonth(direction) {
  currentMonth += direction;

  // Adjust for year changes
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  populateCalendar(currentMonth, currentYear);
  updateCalendar();
  generateTimeCards(
    highlighted,
    startTimes,
    endTimes,
    currentMonth,
    currentYear
  );
}

function calculateRecurringDates(
  startDate,
  endDate,
  frequency,
  recurrenceDays
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const recurringDates = [];
  const dayMapping = { M: 0, T: 1, W: 2, Th: 3, F: 4, S: 5, Su: 6 };

  let currentDate = new Date(start);

  if (frequency === "daily") {
    // Add every day between the start and end dates
    while (currentDate <= end) {
      recurringDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (
    frequency === "weekly" ||
    frequency === "2weekly" ||
    frequency === "4weekly"
  ) {
    let skipWeeks =
      frequency === "2weekly" ? 1 : frequency === "4weekly" ? 3 : 0; // Number of weeks to skip
    let weekCount = 0;

    while (currentDate <= end) {
      // Skip every other week if frequency is 2weekly
      if (skipWeeks > 0 && weekCount % (skipWeeks + 1) !== 0) {
        currentDate.setDate(currentDate.getDate() + 7);
        weekCount++;
        continue;
      }

      // Iterate through selected recurrence days
      for (const day of recurrenceDays) {
        const dayOfWeek = dayMapping[day];
        const date = new Date(currentDate);

        // Align currentDate to the desired weekday within the current week
        const currentDayOfWeek = currentDate.getDay();
        let diff = dayOfWeek - currentDayOfWeek;

        if (diff < 0) {
          // If target day has already passed, adjust to the current week
          diff += 7;
        }

        date.setDate(currentDate.getDate() + diff);

        // Add the date if it falls within the range
        if (date >= start && date <= end) {
          const formattedDate = date.toISOString().split("T")[0];
          if (!recurringDates.includes(formattedDate)) {
            recurringDates.push(formattedDate);
          }
        }
      }

      // Move to the next week
      currentDate.setDate(currentDate.getDate() + 7);
      weekCount++;
    }
  } else if (frequency === "monthly") {
    while (currentDate <= end) {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Add selected days to the recurring dates
      recurrenceDays.forEach((day) => {
        const date = new Date(currentYear, currentMonth, day);

        // Add the date if it falls within start and end range
        if (date >= start && date <= end && date.getMonth() === currentMonth) {
          recurringDates.push(date.toISOString().split("T")[0]);
        }
      });

      // Move to the next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1); // Reset to first day of the new month
    }
  }

  return recurringDates;
}

function updateCalendar() {
  const frequency = document.getElementById("recurring-timeline").value;
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;
  let selectedDays = [];

  if (frequency === "monthly") {
    // For monthly, consider days of the month selected on calendar
    selectedDays = Array.from(manualAdjustments);
    if (selectedDays.length === 0) {
      console.log("Select days on the calendar");
    }
  } else {
    // Otherwise selectedDays are the checked days of the week (M,T,W,T,F,S,S)
    selectedDays = Array.from(
      document.querySelectorAll("input[name='days[]']:checked")
    ).map((cb) => cb.value);
  }

  if (!startDate || !endDate) {
    // Do nothing if inputs are incomplete
    return;
  }

  recurringDates = calculateRecurringDates(
    startDate,
    endDate,
    frequency,
    selectedDays
  );
  updateHighlightedDates();
}

function toggleDateSelection(date) {
  const frequency = document.getElementById("recurring-timeline").value;
  const dayElement = document.querySelector(`.day[data-date='${date}']`);
  const timeCardContainer = document.querySelector(".time-cards");

  if (frequency === "monthly") {
    // Deal with parsing dates
    const daySlice = date.slice(-2);
    const day = parseInt(daySlice, 10);

    if (dayElement.classList.contains("highlight")) {
      // Deselect the day
      dayElement.classList.remove("highlight");
      manualAdjustments.delete(day);
      recurringDates.pop(day);
      const timeCard = timeCardContainer.querySelector(
        `.time-card[data-day='${day}']`
      );
      if (timeCard) timeCard.remove();
      //highlighted.pop(date);
    } else {
      // Select the day
      dayElement.classList.add("highlight");
      manualAdjustments.add(day);
      recurringDates.push(day); // For monthly a day selected on the calendar is part of the recurrence
      generateMonthlyTimeCard(day);
      //highlighted.push(date);
    }
    updateCalendar();
  } else {
    if (dayElement.classList.contains("highlight")) {
      // Deselect the date
      dayElement.classList.remove("highlight");
      manualAdjustments.delete(date);
      deselectedDates.add(date); // Mark explicitly deselected
      const timeCard = timeCardContainer.querySelector(
        `.time-card[data-date='${date}']`
      );
      if (timeCard) timeCard.remove();
      console.log(`Date deselected: ${date}`);
    } else {
      // Select the date
      dayElement.classList.add("highlight");
      manualAdjustments.add(date);
      deselectedDates.delete(date); // Remove from deselections
      generateManualTimeCard(date);
      console.log(`Date selected: ${date}`);
    }
    // if (recurringDates.includes(date)) {
    //     if (deselectedDates.has(date)) {
    //         deselectedDates.delete(date); // Undo deselection
    //         //highlighted.push(date);
    //     } else {
    //         deselectedDates.add(date); // Deselect
    //         //highlighted.push(date);
    //     }
    // } else {
    //     if (manualAdjustments.has(date)) {
    //         manualAdjustments.delete(date); // Undo manual addition
    //         //highlighted.pop(date);
    //     } else {
    //         manualAdjustments.add(date); // Add manually
    //         //highlighted.push(date);
    //         //recurringDates.push(date);
    //     }
    // }
    updateHighlightedDates();
  }
}

function updateHighlightedDates() {
  const calendarDays = document.querySelectorAll(".day[data-date]");
  const frequency = document.getElementById("recurring-timeline").value;

  //let allHighlightedDates;

  // if (frequency === "monthly") {
  //     allHighlightedDates = new Set(recurringDates);
  // } else {
  //     allHighlightedDates = new Set([
  //         ...recurringDates.filter(date => !deselectedDates.has(date)), // Exclude deselected recurring dates
  //         ...manualAdjustments, // Include manually added dates
  //     ]);
  // }

  let allHighlightedDates = new Set([...recurringDates]);
  manualAdjustments.forEach((date) => allHighlightedDates.add(date));
  deselectedDates.forEach((date) => allHighlightedDates.delete(date));

  // Clear existing highlights
  calendarDays.forEach((day) => {
    day.classList.remove("highlight");
  });

  // Apply highlights
  calendarDays.forEach((day) => {
    const date = day.getAttribute("data-date");
    if (allHighlightedDates.has(date)) {
      day.classList.add("highlight");
    }
  });
  console.log("Highlighted Dates:", Array.from(allHighlightedDates));
}

function clearAllHighlights() {
  const calendarDays = document.querySelectorAll(".day[data-date]");
  calendarDays.forEach((day) => {
    day.classList.remove("highlight");
  });
  manualAdjustments.clear();
  deselectedDates.clear();
  recurringDates = [];
  const sidebar = document.getElementById("time-cards");
  sidebar.innerHTML = "";

  const dayCheckboxes = document.querySelectorAll("input[name='days[]']");
  dayCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
}

function getHighlightedDates() {
  manualAdjustments.forEach((item) => {
    if (!(item instanceof Date)) {
      manualAdjustments.delete(item);
    }
  });
  allHighlightedDates = new Set([
    ...recurringDates.filter((date) => !deselectedDates.has(date)),
    ...manualAdjustments,
  ]);
  return Array.from(allHighlightedDates);
}

function getRecurrenceDays() {
  const frequency = document.getElementById("recurring-timeline").value;

  if (frequency === "monthly") {
    return Array.from(manualAdjustments);
  } else {
    return Array.from(
      document.querySelectorAll("input[name='days[]']:checked")
    ).map((cb) => cb.value);
  }
}

function toggleRecurrenceDays() {
  const recurringTimeline = document.getElementById("recurring-timeline").value;
  const recurrenceDaysGroup = document.getElementById("week-days-form");
  const dateRange = document.getElementById("date-range");

  if (
    recurringTimeline === "weekly" ||
    recurringTimeline === "2weekly" ||
    recurringTimeline === "4weekly"
  ) {
    recurrenceDaysGroup.style.display = "block";
  } else {
    recurrenceDaysGroup.style.display = "none";
  }

  if (recurringTimeline !== "non-recurring") {
    dateRange.style.display = "block";
  } else {
    dateRange.style.display = "none";
  }
}

function loadBookingData(bookingData) {
  console.log(bookingData);

  document.getElementById("booking-name").value = bookingData.BookingName || "";
  document.getElementById("location").value =
    bookingData.Location === -1 ? "" : bookingData.Location || "";
  document.getElementById("details").value = bookingData.Details || "";
  document.getElementById("max-attendees").value =
    bookingData.MaxAttendees === -1 ? "" : bookingData.MaxAttendees || "";
  document.getElementById("time-slot").value =
    bookingData.TimeSlotLength === -1 ? "" : bookingData.TimeSlotLength || "";
  document.getElementById("attachment-link").value =
    bookingData.Attachments === "-1" ? "" : bookingData.Attachments || "";
  document.getElementById("meeting-link").value =
    bookingData.MeetingLink === "-1" ? "" : bookingData.MeetingLink || "";

  document.getElementById("start-date").value =
    bookingData.StartRecurringDate || "";
  document.getElementById("end-date").value =
    bookingData.EndRecurringDate || "";

  const recurringTimelineSelect = document.getElementById("recurring-timeline");
  const optionToSelect = recurringTimelineSelect.querySelector(
    `option[value="${bookingData.RecurrenceFrequency}"]`
  );
  if (optionToSelect) optionToSelect.selected = true;

  const recurrenceFrequency = bookingData.RecurrenceFrequency;
  const recurrenceDays = bookingData.RecurrenceDays
    ? bookingData.RecurrenceDays.split(",")
    : [];
  if (
    recurrenceFrequency === "weekly" ||
    recurrenceFrequency === "2weekly" ||
    recurrenceFrequency === "4weekly"
  ) {
    // Loop through all checkboxes with name 'days[]'
    const dayCheckboxes = document.querySelectorAll("input[name='days[]']");

    dayCheckboxes.forEach((checkbox) => {
      // Set checkbox as checked if its value is in the recurrenceDays array
      checkbox.checked = recurrenceDays.includes(checkbox.value);
    });
  }
}

function getDates(bookingData) {
  const meetingDates = bookingData.MeetingDates
    ? bookingData.MeetingDates.trim().replace(/^"|"$/g, "").split(",")
    : [];
  const startTimes = bookingData.StartTimes
    ? bookingData.StartTimes.trim().replace(/^"|"$/g, "").split(",")
    : [];
  const endTimes = bookingData.EndTimes
    ? bookingData.EndTimes.trim().replace(/^"|"$/g, "").split(",")
    : [];
  console.log("meeting dates" + meetingDates);
  // Update global highlighted array
  highlighted = meetingDates.map((date) => date.trim());
  highlightAvailableDates(highlighted);
  generateTimeCards(
    meetingDates,
    startTimes,
    endTimes,
    currentMonth,
    currentYear
  );
}

function highlightAvailableDates(availableDates) {
  const calendarDays = document.querySelectorAll(".day[data-date]");

  calendarDays.forEach((day) => {
    const date = day.getAttribute("data-date");
    if (availableDates.includes(date)) {
      day.classList.add("highlight");
    }
  });
}

function generateTimeCards(meetingDates, startTimes, endTimes, month, year) {
  const timeCardContainer = document.querySelector(".time-cards");
  timeCardContainer.innerHTML = ""; // Clear existing time cards

  // Filter dates for the current month and year
  meetingDates.forEach((date, index) => {
    // const dateObj = new Date(date);
    // const cardMonth = dateObj.getMonth();
    // const cardYear = dateObj.getFullYear();
    const utcDateString = `${date}T00:00:00Z`;
    const dateObj = new Date(utcDateString);
    const cardMonth = dateObj.getUTCMonth();
    const cardYear = dateObj.getUTCFullYear();
    console.log(dateObj + "," + cardMonth + "," + cardYear);

    if (cardMonth === month && cardYear === year) {
      const timeCard = document.createElement("div");
      timeCard.classList.add("time-card");
      timeCard.setAttribute("data-date", date);
      console.log(date);

      // Card title (formatted date)
      const title = document.createElement("h3");
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });
      title.textContent = formattedDate;
      timeCard.appendChild(title);

      const timeSlotRow = document.createElement("div");
      timeSlotRow.classList.add("time-slot-row");

      // Start Time input
      const startTimeLabel = document.createElement("label");
      startTimeLabel.classList.add("time-slot-label");
      startTimeLabel.innerHTML = `
                <b>Start Time:</b>
                <input type="time" class="time-slot start-time" data-date="${date}" value="${
        startTimes[index] || ""
      }" required>
            `;
      timeSlotRow.appendChild(startTimeLabel);

      // End Time input
      const endTimeLabel = document.createElement("label");
      endTimeLabel.classList.add("time-slot-label");
      endTimeLabel.innerHTML = `
                <b>End Time:</b>
                <input type="time" class="time-slot end-time" data-date="${date}" value="${
        endTimes[index] || ""
      }" required>
            `;
      timeSlotRow.appendChild(endTimeLabel);
      timeCard.appendChild(timeSlotRow);

      // Add button for additional slots (optional)
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.textContent = "+ Add Time";
      addButton.classList.add("add-time-btn");
      addButton.addEventListener("click", () => {
        addTimeSlot(timeCard, date);
      });
      timeCard.appendChild(addButton);

      timeCardContainer.appendChild(timeCard);
    }
  });

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
  // monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
  const note = document.createElement("p");
  note.innerHTML = `Bookings displayed for ${monthNames[month]} ${year}`;
  timeCardContainer.appendChild(note);
}
