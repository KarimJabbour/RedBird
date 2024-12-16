document.addEventListener("DOMContentLoaded", () => {
  preloadUserDetails();
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

    // Collect selected time options
    const selectedOptions = [];
    document.querySelectorAll(".time-circle.selected").forEach((circle) => {
      selectedOptions.push({
        date: circle.dataset.date,
        startTime: circle.dataset.start,
        endTime: circle.dataset.end,
      });
    });

    if (selectedOptions.length === 0) {
      alert("Please select at least one time slot.");
      return;
    }

    // Prepare JSON data for submission
    const requestData = {
      pollID: pollID,
      fullname: formData.get("fullname"),
      email: formData.get("mcgillemail"),
      mcgillid: formData.get("mcgillid"),
      selectedOptions: selectedOptions,
    };

    // Validate email format
    const validEmail = /@(mail\.mcgill\.ca|mcgill\.ca)$/;
    if (!validEmail.test(requestData.email)) {
      alert(
        "Please enter a valid McGill email address ending with @mail.mcgill.ca or @mcgill.ca."
      );
      return;
    }

    // Submit data to the backend
    fetch("updateVoteCounts.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Vote submitted successfully!");

          // Send confirmation email
          return sendConfirmationEmail(requestData.email, pollID);
        } else if (data.duplicate) {
          alert("You can only vote once.");
        } else {
          alert(data.message || "Failed to submit your vote.");
        }
      })
      .then(() => {
        // Redirect to dashboard after successful submission
        window.location.href = "/RedBird/pages/dashboard.html";
      })
      .catch((error) => {
        console.error("Error submitting vote:", error);
        alert("An error occurred. Please try again.");
      });
  });

  // Fetch poll details and populate UI
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

// Preload user details if logged in
function preloadUserDetails() {
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

// Send confirmation email
function sendConfirmationEmail(email, pollID) {
  const emailData = {
    email: email,
    pollID: pollID,
  };

  return fetch("../mail/sendPollReservation.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send confirmation email.");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        alert("Confirmation email sent successfully!");
      } else {
        alert("Failed to send confirmation email.");
      }
    })
    .catch((error) => {
      console.error("Error sending confirmation email:", error);
    });
}

// Populate time options dynamically
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

// function populateTimeOptions(poll) {
//   const timeline = document.querySelector(".timeline");
//   timeline.innerHTML = ""; // Clear existing content

//   const dateOptions = poll.DateOptions;
//   const startTimes = poll.StartTimes;
//   const endTimes = poll.EndTimes;

//   dateOptions.forEach((date, index) => {
//     const dateGroup = document.createElement("div");
//     dateGroup.classList.add("date-group");

//     const dateBubble = document.createElement("div");
//     dateBubble.classList.add("date-bubble");
//     dateBubble.innerHTML = `<h4>${new Date(date).toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//     })}</h4>`;
//     dateGroup.appendChild(dateBubble);

//     const timeOptions = document.createElement("div");
//     timeOptions.classList.add("time-options");

//     const timeCircle = document.createElement("div");
//     timeCircle.classList.add("time-circle");
//     timeCircle.dataset.date = date;
//     timeCircle.dataset.start = startTimes[index];
//     timeCircle.dataset.end = endTimes[index];
//     timeCircle.innerHTML = `<span>${startTimes[index]}<br> - <br>${endTimes[index]}</span>`;
//     timeOptions.appendChild(timeCircle);

//     timeCircle.addEventListener("click", () => {
//       timeCircle.classList.toggle("selected");
//     });

//     dateGroup.appendChild(timeOptions);
//     timeline.appendChild(dateGroup);
//   });
// }
