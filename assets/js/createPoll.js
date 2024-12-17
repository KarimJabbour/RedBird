// Global variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDates = new Set(); // Store selected dates
let sidebarData = {};

document.addEventListener("DOMContentLoaded", function () {
    populateCalendar(currentMonth, currentYear);

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

    document.getElementById("poll-form").addEventListener("submit", function (event) {
        //event.preventDefault();

        const timeCardData = Object.keys(sidebarData).map(date => ({
            date: date,
            startTime: sidebarData[date]?.startTime || "",
            endTime: sidebarData[date]?.endTime || ""
        }));

        // Populate the hidden inputs
        const datesInput = document.getElementById("dates-hidden");
        const startTimesInput = document.getElementById("start-times-hidden");
        const endTimesInput = document.getElementById("end-times-hidden");

        datesInput.value = timeCardData.map(entry => entry.date).join(",");
        startTimesInput.value = timeCardData.map(entry => entry.startTime).join(",");
        endTimesInput.value = timeCardData.map(entry => entry.endTime).join(",");


        // Log for debugging
        // console.log("Populated Hidden Inputs:");
        // console.log("Dates:", datesInput.value);
        // console.log("Start Times:", startTimesInput.value);
        // console.log("End Times:", endTimesInput.value);
    });
});


function populateCalendar(month, year) {
    const calendarGrid = document.getElementById("calendar-grid");
    const monthYearDisplay = document.getElementById("month-year");

    calendarGrid.innerHTML = "";

    const dayNames = [
        "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
    ];

    for (let i = 0; i < 7; i++) {
        const div = document.createElement("div");
        div.classList.add("day-header");
        div.innerText = dayNames[i];
        calendarGrid.appendChild(div);
    }

    // Display current month and year on calendar
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
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
        const date = new Date(year, month, day).toISOString().split("T")[0]; // Format as YYYY-MM-DD
        dayDiv.setAttribute("data-date", date);

        if (selectedDates.has(date)) {
            dayDiv.classList.add("highlight");
        }

        // Handle manual date selection by toggling highlight
        dayDiv.addEventListener("click", function () {
            toggleDateSelection(date);
        });

        calendarGrid.appendChild(dayDiv);
    }

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
    updateSidebar();
}

function toggleDateSelection(date) {
    const dayElement = document.querySelector(`.day[data-date='${date}']`);

    if (selectedDates.has(date)) {
        selectedDates.delete(date);
        dayElement.classList.remove("highlight");
        delete sidebarData[date];
    } else {
        selectedDates.add(date);
        dayElement.classList.add("highlight");
        if (!sidebarData[date]) {
            sidebarData[date] = { startTime: "", endTime: "" }; // Initialize with empty times
        }
    }
    updateSidebar();
}

function updateSidebar() {
    const sidebarContainer = document.querySelector(".time-cards");
    sidebarContainer.innerHTML = ""; // Clear existing entries

    Object.keys(sidebarData)
    .sort((a, b) => new Date(a) - new Date(b)) // Sort in ascending order
    .forEach(date => {
        const sidebarEntry = document.createElement("div");
        sidebarEntry.classList.add("time-card");

        sidebarEntry.innerHTML = `
            <h3>${formatDate(date)}</h3>
            <label for="start-time-${date}" class="time-slot-label">
                <b>Start Time:</b>
                <input
                    type="time"
                    class="time-slot"
                    id="start-time-${date}"
                    value="${sidebarData[date].startTime}"
                    data-date="${date}"
                >
            </label>
            <label for="end-time-${date}" class="time-slot-label">
                <b>End Time:</b>
                <input
                    type="time"
                    class="time-slot"
                    id="end-time-${date}"
                    value="${sidebarData[date].endTime}"
                    data-date="${date}"
                >
            </label>
        `;

        // Update sidebarData when time changes
        const startTimeInput = sidebarEntry.querySelector(`#start-time-${date}`);
        const endTimeInput = sidebarEntry.querySelector(`#end-time-${date}`);

        startTimeInput.addEventListener("change", function () {
            updateSidebarData(date, "startTime", this.value);
        });

        endTimeInput.addEventListener("change", function () {
            updateSidebarData(date, "endTime", this.value);
        });

        sidebarContainer.appendChild(sidebarEntry);
    });
}


function updateSidebarData(date, field, value) {
    if (sidebarData[date]) {
        sidebarData[date][field] = value;
    }
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function clearAllHighlights() {
    const calendarDays = document.querySelectorAll(".day[data-date]");
    calendarDays.forEach(day => {
        day.classList.remove("highlight");
    });

    selectedDates.clear();
    sidebarData = {};
    updateSidebar();
}

function clearForm() {
    const form = document.querySelector(".poll-form");
    form.reset();

    console.log(sidebarData);

    const timeCardData = Object.keys(sidebarData).map(date => ({
        date: date,
        startTime: sidebarData[date]["startTime"],
        endTime: sidebarData[date]["endTime"]
    }));

    const timeCardsInput = document.getElementById("time-cards-hidden");
    timeCardsInput.value = timeCardData.join(";");
    console.log("Time Card Data Submitted:", timeCardData.join(';'));
}
