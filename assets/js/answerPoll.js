
document.addEventListener('DOMContentLoaded', () => {
    const pollID = 9; // Replace with poll ID based on the URL

    fetch(`fetchPollData.php?pollID=${pollID}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populatePollPage(data.poll);
            } else {
                console.error('Failed to fetch poll data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching poll data:', error);
        });


    document.querySelector('.submit-btn').addEventListener('click', (e) => {
        e.preventDefault();
    
        const selectedOptions = Array.from(document.querySelectorAll('.time-circle.selected')).map(circle => ({
            date: circle.dataset.date,
            startTime: circle.dataset.start,
            endTime: circle.dataset.end,
            index: circle.dataset.index,
        }));

        console.log(selectedOptions);
    
        fetch('updateVoteCounts.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pollID, selectedOptions }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Vote submitted successfully!');
                    location.reload();
                } else {
                    console.error('Failed to submit vote:', data.message);
                }
            })
            .catch(error => {
                console.error('Error submitting vote:', error);
            });
    });
        
});

// function populatePollPage(poll) {
//     const timelineContainer = document.querySelector('.timeline');
//     timelineContainer.innerHTML = ''; // Clear any existing content

//     poll.DateOptions.forEach((date, index) => {
//         // Create date group
//         const dateGroup = document.createElement('div');
//         dateGroup.classList.add('date-group');

//         // Add date bubble
//         const dateBubble = document.createElement('div');
//         dateBubble.classList.add('date-bubble');
//         dateBubble.innerHTML = `<h4>${formatDate(date)}</h4>`;
//         dateGroup.appendChild(dateBubble);

//         // Add time options
//         const timeOptions = document.createElement('div');
//         timeOptions.classList.add('time-options');

//         const startTime = poll.StartTimes[index];
//         const endTime = poll.EndTimes[index];

//         const timeCircle = document.createElement('div');
//         timeCircle.classList.add('time-circle');
//         timeCircle.dataset.date = date;
//         timeCircle.dataset.start = startTime;
//         timeCircle.dataset.end = endTime;
//         timeCircle.dataset.index = index; // Use this for updating votes
//         timeCircle.innerHTML = `<span>${formatTime(startTime)}<br> - <br>${formatTime(endTime)}</span>`;

//         // Add click event to toggle selection
//         timeCircle.addEventListener('click', () => {
//             timeCircle.classList.toggle('selected');
//         });

//         timeOptions.appendChild(timeCircle);
//         dateGroup.appendChild(timeOptions);

//         timelineContainer.appendChild(dateGroup);
//     });
// }

function populatePollPage(poll) {
    const timelineContainer = document.querySelector('.timeline');
    timelineContainer.innerHTML = ''; // Clear any existing content

    // Group time options by date
    const dateGroups = {};
    poll.DateOptions.forEach((date, index) => {
        if (!dateGroups[date]) {
            dateGroups[date] = [];
        }
        dateGroups[date].push({
            startTime: poll.StartTimes[index],
            endTime: poll.EndTimes[index],
            index: index,
        });
    });

    // Populate timeline
    Object.keys(dateGroups).forEach(date => {
        // Create date group
        const dateGroup = document.createElement('div');
        dateGroup.classList.add('date-group');

        // Add date bubble
        const dateBubble = document.createElement('div');
        dateBubble.classList.add('date-bubble');
        dateBubble.innerHTML = `<h4>${formatDate(date)}</h4>`;
        dateGroup.appendChild(dateBubble);

        // Add time options
        const timeOptions = document.createElement('div');
        timeOptions.classList.add('time-options');

        dateGroups[date].forEach(option => {
            const timeCircle = document.createElement('div');
            timeCircle.classList.add('time-circle');
            timeCircle.dataset.date = date;
            timeCircle.dataset.start = option.startTime;
            timeCircle.dataset.end = option.endTime;
            timeCircle.dataset.index = option.index;
            timeCircle.innerHTML = `<span>${formatTime(option.startTime)}<br> - <br>${formatTime(option.endTime)}</span>`;

            // Add click event to toggle selection
            timeCircle.addEventListener('click', () => {
                timeCircle.classList.toggle('selected');
            });

            timeOptions.appendChild(timeCircle);
        });

        dateGroup.appendChild(timeOptions);
        timelineContainer.appendChild(dateGroup);

        // Add click event to date bubble to select all time circles
        dateBubble.addEventListener('click', () => {
            const allTimeCircles = timeOptions.querySelectorAll('.time-circle');
            const allSelected = Array.from(allTimeCircles).every(circle => circle.classList.contains('selected'));

            allTimeCircles.forEach(circle => {
                if (allSelected) {
                    circle.classList.remove('selected');
                } else {
                    circle.classList.add('selected');
                }
            });
        });
    });
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

    