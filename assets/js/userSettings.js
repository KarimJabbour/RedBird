function resetPassword() {
  alert("Password reset functionality to be implemented!");
}

function addUnavailability() {
  const date = document.getElementById("unavailability-date").value;
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;

  if (date && startTime && endTime) {
    const list = document.getElementById("unavailability-list");
    const item = document.createElement("div");
    item.textContent = `Unavailable on ${date}, from ${startTime} to ${endTime}`;
    list.appendChild(item);
  } else {
    alert("Please fill in all fields before adding unavailability.");
  }
}
