// Global variables 
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let recurringDates = []; // Stores the computed recurring dates
let manualAdjustments = new Set(); // Tracks manual additions/removals of dates
let deselectedDates = new Set(); // Manually deselected dates
let highlighted = [];

document.addEventListener("DOMContentLoaded", function () {
    populateCalendar(currentMonth, currentYear);

    document.getElementById("recurring-timeline").addEventListener("change", () => {
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
    daySelector.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            console.log("Day selected/changed:", checkbox.value, checkbox.checked);
            updateCalendar();
        });
    });

    document.getElementById("booking-form").addEventListener("submit", function (event) {
        const highlightedDates = getHighlightedDates();
        const recurrenceDays = getRecurrenceDays();
        document.getElementById("highlighted-dates").value = highlightedDates.join(",");
        document.getElementById("recurring-days").value = recurrenceDays.join(",");
        // document.getElementById("highlighted-dates").value = highlighted.join(",");
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
}


function calculateRecurringDates(startDate, endDate, frequency, recurrenceDays) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const recurringDates = [];
    const dayMapping = { "M": 0, "T": 1, "W": 2, "Th": 3, "F": 4, "S": 5, "Su": 6 };

    let currentDate = new Date(start);

    if (frequency === "daily") {
        // Add every day between the start and end dates
        while (currentDate <= end) {
            recurringDates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    } else if (frequency === "weekly" || frequency === "2weekly" || frequency === "4weekly") {
        let skipWeeks = frequency === "2weekly" ? 1 : frequency === "4weekly" ? 3 : 0; // Number of weeks to skip
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
            recurrenceDays.forEach(day => {
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
            console.log('Select days on the calendar');
        }
    } else {
        // Otherwise selectedDays are the checked days of the week (M,T,W,T,F,S,S)
        selectedDays = Array.from(document.querySelectorAll("input[name='days[]']:checked")).map(cb => cb.value);
    }


    if (!startDate || !endDate) {
        // Do nothing if inputs are incomplete
        return;
    }

    recurringDates = calculateRecurringDates(startDate, endDate, frequency, selectedDays);
    updateHighlightedDates();
}

function toggleDateSelection(date) {
    const frequency = document.getElementById("recurring-timeline").value;
    const dayElement = document.querySelector(`.day[data-date='${date}']`);

    if (frequency === "monthly") {
        // Deal with parsing dates
        const daySlice = date.slice(-2);
        const day = parseInt(daySlice, 10);

        if (dayElement.classList.contains("highlight")) {
            // Deselect the day
            dayElement.classList.remove("highlight");
            manualAdjustments.delete(day);
            recurringDates.pop(day); 
            //highlighted.pop(date);
        } else {
            // Select the day
            dayElement.classList.add("highlight");
            manualAdjustments.add(day);
            recurringDates.push(day); // For monthly a day selected on the calendar is part of the recurrence
            //highlighted.push(date);
        }
        updateCalendar();

    } else {
        if (recurringDates.includes(date)) {
            if (deselectedDates.has(date)) {
                deselectedDates.delete(date); // Undo deselection
                //highlighted.push(date);
            } else {
                deselectedDates.add(date); // Deselect
                //highlighted.push(date);
            }
        } else {
            if (manualAdjustments.has(date)) {
                manualAdjustments.delete(date); // Undo manual addition
                //highlighted.pop(date);
            } else {
                manualAdjustments.add(date); // Add manually
                //highlighted.push(date);
                //recurringDates.push(date);
            }
        }
        updateHighlightedDates();
    }
}

function updateHighlightedDates() {
    const calendarDays = document.querySelectorAll(".day[data-date]");
    const frequency = document.getElementById("recurring-timeline").value;

    let allHighlightedDates;

    if (frequency === "monthly") {
        allHighlightedDates = new Set(recurringDates);
    } else {
        allHighlightedDates = new Set([
            ...recurringDates.filter(date => !deselectedDates.has(date)), // Exclude deselected recurring dates
            ...manualAdjustments, // Include manually added dates
        ]);
    }

    // Clear existing highlights
    calendarDays.forEach(day => {
        day.classList.remove("highlight");
    });

    // Apply highlights
    calendarDays.forEach(day => {
        const date = day.getAttribute("data-date");
        if (allHighlightedDates.has(date)) {
            day.classList.add("highlight");
        }
    });
}

function clearAllHighlights() {
    const calendarDays = document.querySelectorAll(".day[data-date]");
    calendarDays.forEach(day => {
        day.classList.remove("highlight");
    });
    manualAdjustments.clear();
    deselectedDates.clear();
    recurringDates = [];

    const dayCheckboxes = document.querySelectorAll("input[name='days[]']");
    dayCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function getHighlightedDates() {
    allHighlightedDates = new Set([
        ...recurringDates.filter(date => !deselectedDates.has(date)),
        ...manualAdjustments,
    ]);
    return Array.from(allHighlightedDates);
}

function getRecurrenceDays() {
    const frequency = document.getElementById("recurring-timeline").value;

    if (frequency === "monthly") {
        return Array.from(manualAdjustments);
    } else {
        return Array.from(document.querySelectorAll("input[name='days[]']:checked")).map(cb => cb.value);
    }
}

function toggleRecurrenceDays() {
    const recurringTimeline = document.getElementById("recurring-timeline").value;
    const recurrenceDaysGroup = document.getElementById("week-days-form");
    const dateRange = document.getElementById("date-range");

    if (recurringTimeline === "weekly" || recurringTimeline === "2weekly" || recurringTimeline === "4weekly") {
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




