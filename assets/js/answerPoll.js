document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("answer-poll");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Extract pollID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const pollID = urlParams.get("pollID");

    if (!pollID) {
      alert("Poll ID is missing!");
      return;
    }

    // Create a FormData object to get form inputs
    const formData = new FormData(form);

    // Add pollID explicitly to FormData
    formData.append("pollID", pollID);

    // Collect selected time options
    const selectedOptions = [];
    document.querySelectorAll(".time-circle.selected").forEach((circle) => {
      selectedOptions.push({
        date: circle.dataset.date,
        startTime: circle.dataset.start,
        endTime: circle.dataset.end,
      });
    });

    // Add selected options to formData as a JSON string
    formData.append("selectedOptions", JSON.stringify(selectedOptions));

    // Debugging: Log the FormData content
    console.log("Form Data:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Send data to the server
    fetch("updateVoteCounts.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Vote counts updated successfully!");
          window.location.href = "/RedBird/pages/dashboard.html";
        } else {
          alert(data.message || "Failed to update vote counts.");
        }
      })
      .catch((error) => {
        console.error("Error updating vote counts:", error);
        alert("An error occurred. Please try again.");
      });
  });

  // Fetch poll data from the backend
  const urlParams = new URLSearchParams(window.location.search);
  const pollID = urlParams.get("pollID");

  if (!pollID) {
    alert("Poll ID is missing!");
    return;
  }

  fetch(`fetchPollData.php?pollID=${pollID}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const poll = data.poll;
        document.getElementById("pollID").value = pollID;

        // Update poll details dynamically
        document.querySelector(".poll-details h2").textContent = poll.PollName;
        document.querySelector("#poll-details").textContent = poll.Details;
        document.querySelector("#poll-close-date").textContent =
          poll.PollCloseDateTime || "No deadline";

        // Populate time options dynamically
        populateTimeOptions(poll);
      } else {
        alert(data.message || "Failed to fetch poll details.");
      }
    })
    .catch((error) => {
      console.error("Error fetching poll details:", error);
      alert(
        "An error occurred while loading the poll. Please try again later."
      );
    });
});

function populateTimeOptions(poll) {
  const timeline = document.querySelector(".timeline");
  timeline.innerHTML = ""; // Clear existing content

  const dateOptions = poll.DateOptions;
  const startTimes = poll.StartTimes;
  const endTimes = poll.EndTimes;

  dateOptions.forEach((date, index) => {
    const dateGroup = document.createElement("div");
    dateGroup.classList.add("date-group");

    const dateBubble = document.createElement("div");
    dateBubble.classList.add("date-bubble");
    dateBubble.innerHTML = `<h4>${new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })}</h4>`;
    dateGroup.appendChild(dateBubble);

    const timeOptions = document.createElement("div");
    timeOptions.classList.add("time-options");

    const timeCircle = document.createElement("div");
    timeCircle.classList.add("time-circle");
    timeCircle.dataset.date = date;
    timeCircle.dataset.start = startTimes[index];
    timeCircle.dataset.end = endTimes[index];
    timeCircle.innerHTML = `<span>${startTimes[index]}<br> - <br>${endTimes[index]}</span>`;
    timeOptions.appendChild(timeCircle);

    timeCircle.addEventListener("click", () => {
      timeCircle.classList.toggle("selected");
    });

    dateGroup.appendChild(timeOptions);
    timeline.appendChild(dateGroup);
  });
}
