document.addEventListener("DOMContentLoaded", function () {

    const trackedActivity = [];
    // Function to calculate base metabolism rate based on age and weight
    function calculateBMR(age, weight, sex) {
        let bmr;
        if (sex === "female" || sex === "Female") {
            if (age <= 3) {
                bmr = (0.244 * weight) - 0.13;
            } else if (age >= 4 && age <= 10) {
                bmr = (0.085 * weight) + 2.03;
            } else if (age >= 11 && age <= 18) {
                bmr = (0.056 * weight) + 2.90;
            } else if (age >= 19 && age <= 30) {
                bmr = (0.0615 * weight) + 2.08;
            } else if (age >= 31 && age <= 60) {
                bmr = (0.0364 * weight) + 3.47;
            } else if (age >= 61 && age <= 75) {
                bmr = (0.0386 * weight) + 2.88;
            } else { // age > 75
                bmr = (0.0410 * weight) + 2.61;
            }
        } else { // Assuming male by default
            if (age <= 3) {
                bmr = (0.249 * weight) - 0.13;
            } else if (age >= 4 && age <= 10) {
                bmr = (0.095 * weight) + 2.11;
            } else if (age >= 11 && age <= 18) {
                bmr = (0.074 * weight) + 2.75;
            } else if (age >= 19 && age <= 30) {
                bmr = (0.064 * weight) + 2.84;
            } else if (age >= 31 && age <= 60) {
                bmr = (0.0485 * weight) + 3.67;
            } else if (age >= 61 && age <= 75) {
                bmr = (0.0499 * weight) + 2.93;
            } else { // age > 75
                bmr = (0.035 * weight) + 3.43;
            }
        }
        return bmr;
    }

    // Get user's age, weight, and sex from localStorage
    const age = parseInt(localStorage.getItem("age"));
    const weight = parseFloat(localStorage.getItem("Weight"));
    const sex = localStorage.getItem("Sex");

    // Calculate base metabolism rate
    const baseMetabolismRate = calculateBMR(age, weight, sex);

    // Save BMR to localStorage
    saveDataToDatabase(JSON.stringify(baseMetabolismRate.toFixed(2)), 'BMR')
    localStorage.setItem("BMR", baseMetabolismRate.toFixed(2));

    // Display base metabolism rate on the webpage
    const baseMetabolismElement = document.createElement("div");
    baseMetabolismElement.textContent = `Base metabolism rate: ${baseMetabolismRate.toFixed(2)} MJ/day`;
    document.getElementById("BMR").appendChild(baseMetabolismElement);

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
    addActivityButton.addEventListener("click", function () {
        // Get user inputs
        const activitySelect = document.getElementById("activity");
        const selectedActivity = activitySelect.options[activitySelect.selectedIndex].text;
        const durationInput = document.getElementById("duration").value;
        const datetimeInput = document.getElementById("datetime").value;

        // Check if duration is empty
        if (durationInput === "") {
            alert("Please enter a duration.");
            return; // Exit function if duration is empty
        }

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
const trackedActivity = JSON.parse(localStorage.getItem("trackedActivity"))|| [];

/*
if (!trackedActivity) {
    trackedActivity = [];
} else {
    trackedActivity = JSON.parse(trackedActivity);
}
*/
console.log(trackedActivity);

        console.log(trackedActivity);
        // Add new activity to trackedActivity
        trackedActivity.push(activity);

        // Save to localStorage
        saveDataToDatabase(JSON.stringify(trackedActivity), 'trackedActivity')
        localStorage.setItem("trackedActivity", JSON.stringify(trackedActivity));

        // Update UI
        updateActivityList();
    });

    // Function to update activity list in UI
    function updateActivityList() {
        const activityList = document.getElementById("activityList");
        activityList.innerHTML = "";

        let trackedActivity = localStorage.getItem("trackedActivity");
        if (!trackedActivity) {
            trackedActivity = [];
        } else {
            trackedActivity = JSON.parse(trackedActivity);
        }



        if (trackedActivity) {

            trackedActivity.forEach(function (activity) {
                const li = document.createElement("li");
                li.textContent = `${activity.activity} - ${activity.calories.toFixed(2)} calories burned on ${activity.date}`;
                li.classList.add("activityLi"); // Add class "activityLi"

                // Create delete button
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.classList.add("deleteButton");

                // Add event listener to delete button
                deleteButton.addEventListener("click", function () {
                    // Remove the corresponding activity from trackedActivity
                    trackedActivity = trackedActivity.filter(item => item.id !== activity.id);

                    // Update localStorage
                    saveDataToDatabase(JSON.stringify(trackedActivity), 'trackedActivity')
                    localStorage.setItem("trackedActivity", JSON.stringify(trackedActivity));

                    // Update UI
                    updateActivityList();
                });

                // Append delete button to list item
                li.appendChild(deleteButton);

                // Append list item to activityList
                activityList.appendChild(li);
            });
        }
    }

    
    // Initial update of activity list when page loads
    updateActivityList();

    




});

const brugerNavn = localStorage.getItem('Brugernavn');
    // Add this function to your client-side JavaScript file
    function saveDataToDatabase(Data, Newdatatype) {

        const newData = Data;
        const datatype = Newdatatype;

        fetch('/save-Data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ brugerNavn, newData, datatype }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save data to the database');
            }
            return response.json();
        })
        .then(data => {
            console.log('data saved to the database:', data);
        })
        .catch(error => {
            console.error('Error saving data to the database:', error);
        });
    }
    async function fetchUserData(username) {
        try {
            const response = await fetch('/fetch-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch data from the server');
            }
    
            const responseData = await response.json();
    
            Object.entries(responseData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
    
            console.log('Data fetched and saved to localStorage successfully.');
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    fetchUserData(brugerNavn);