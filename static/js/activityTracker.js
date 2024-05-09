document.addEventListener("DOMContentLoaded", function() {
    // Autofill date and time input fields
    const datetimeInput = document.getElementById("datetime");
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
    datetimeInput.value = currentDatetime;

    // Event listener for addActivity button
    const addActivityButton = document.getElementById("addActivity");
    addActivityButton.addEventListener("click", function() {
        // Get user inputs
        const activitySelect = document.getElementById("activity");
        const selectedActivity = activitySelect.options[activitySelect.selectedIndex].text;
        const durationInput = document.getElementById("duration").value;
        const datetimeInput = document.getElementById("datetime").value;

        // Calculate calories burned
        const caloriesPerHour = parseFloat(activitySelect.value);
        const ratio = parseFloat(durationInput) / 60;
        const caloriesBurned = caloriesPerHour * ratio;

        // Generate random ID
        const id = Date.now().toString();

        // Create activity object
        const activity = {
            id: id,
            activity: selectedActivity,
            calories: caloriesBurned,
            date: datetimeInput
        };

        // Check if localStorage item exists, if not, create it
        let trackedActivity = localStorage.getItem("trackedActivity");
        if (!trackedActivity) {
            trackedActivity = [];
        } else {
            trackedActivity = JSON.parse(trackedActivity);
        }

        // Add new activity to trackedActivity
        trackedActivity.push(activity);

        // Save to localStorage
        localStorage.setItem("trackedActivity", JSON.stringify(trackedActivity));

        // Update UI
        updateActivityList();
    });

    // Function to update activity list in UI
    function updateActivityList() {
        const activityList = document.getElementById("activityList");
        activityList.innerHTML = "";
        
        let trackedActivity = localStorage.getItem("trackedActivity");
        if (trackedActivity) {
            trackedActivity = JSON.parse(trackedActivity);
            trackedActivity.forEach(function(activity) {
                const li = document.createElement("li");
                li.textContent = `${activity.activity} - ${activity.calories.toFixed(2)} calories burned on ${activity.date}`;
                li.classList.add("activityLi"); // Add class "activityLi"
                activityList.appendChild(li);
            });
        }
    }

    // Initial update of activity list when page loads
    updateActivityList();
});
