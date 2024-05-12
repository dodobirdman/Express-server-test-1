document.addEventListener("DOMContentLoaded", function () {

    const trackedActivity = [];
    // Funktion der beregner basalstofskifte
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
            } else { // alder > 75
                bmr = (0.0410 * weight) + 2.61;
            }
        } else { // Antager at brugeren er mand, hvis ikke kvindelig
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
            } else { // alder > 75
                bmr = (0.035 * weight) + 3.43;
            }
        }
        return bmr;
    }

    // Hent brugerens alder, vægt og køn fra localStorage
    const age = parseInt(localStorage.getItem("age"));
    const weight = parseFloat(localStorage.getItem("Weight"));
    const sex = localStorage.getItem("Sex");

    // Beregn basalstofskifte
    const baseMetabolismRate = calculateBMR(age, weight, sex);

    // Gem basalstofskifte i localStorage
    saveDataToDatabase(JSON.stringify(baseMetabolismRate.toFixed(2)), 'BMR')
    localStorage.setItem("BMR", baseMetabolismRate.toFixed(2));

    // Vise basalstofskifte på siden
    const baseMetabolismElement = document.createElement("div");
    baseMetabolismElement.textContent = `Base metabolism rate: ${baseMetabolismRate.toFixed(2)} MJ/day`;
    document.getElementById("BMR").appendChild(baseMetabolismElement);

    // Autoudfyld dato og tidspunkt
    const datetimeInput = document.getElementById("datetime");
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
    datetimeInput.value = currentDatetime;

    // Eventlistener til knappen "Add activity"
    const addActivityButton = document.getElementById("addActivity");
    addActivityButton.addEventListener("click", function () {
        // Hent data fra inputfelter
        const activitySelect = document.getElementById("activity");
        const selectedActivity = activitySelect.options[activitySelect.selectedIndex].text;
        const durationInput = document.getElementById("duration").value;
        const datetimeInput = document.getElementById("datetime").value;

        // Tjekker hvis duration er tom
        if (durationInput === "") {
            alert("Please enter a duration.");
            return;
        }

        // Beregner kalorieforbrænding
        const caloriesPerHour = parseFloat(activitySelect.value);
        const ratio = parseFloat(durationInput) / 60;
        const caloriesBurned = caloriesPerHour * ratio;

        // Opretter randomiseret id
        const id = Date.now().toString();

        // Skaber et objekt med aktivitetsdata
        const activity = {
            id: id,
            activity: selectedActivity,
            calories: caloriesBurned,
            date: datetimeInput
        };




        // Tjekker om der er data i localStorage, og lav en tom array hvis ikke
        const trackedActivity = JSON.parse(localStorage.getItem("activity")) || [];


        
        // Tilføj aktivitet til trackedActivity
        trackedActivity.push(activity);

        // Gem til database
        saveDataToDatabase(JSON.stringify(trackedActivity), 'trackedActivity')
        localStorage.setItem("activity", JSON.stringify(trackedActivity));

        // Kalder funktion til at opdater UI'en
        updateActivityList();
    });

    // Funktion til at opdatere UI'en
    function updateActivityList() {
        const activityList = document.getElementById("activityList");
        activityList.innerHTML = "";

        let trackedActivity = localStorage.getItem("activity");
        if (!trackedActivity) {
            trackedActivity = [];
        } else {
            trackedActivity = JSON.parse(trackedActivity);
        }



        if (trackedActivity) {

            trackedActivity.forEach(function (activity) {
                const li = document.createElement("li");
                li.textContent = `${activity.activity} - ${activity.calories.toFixed(2)} calories burned on ${activity.date}`;
                li.classList.add("activityLi"); // tilføjer class til li, for at style det i css

                // Laver et slet knap for hver aktivitet
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.classList.add("deleteButton");

                // Kører kode hvis slet knappen er trykket
                deleteButton.addEventListener("click", function () {
                    // Fjerner aktivitetet fra trackedActivity
                    trackedActivity = trackedActivity.filter(item => item.id !== activity.id);

                    // Opdaterer localStorage
                    saveDataToDatabase(JSON.stringify(trackedActivity), 'trackedActivity')
                    localStorage.setItem("activity", JSON.stringify(trackedActivity));

                    // Opdaterer UI
                    updateActivityList();
                });

                // Sætter slet knappen ind i li
                li.appendChild(deleteButton);

                // Sætter li ind i ul
                activityList.appendChild(li);
            });
        }
    }


    // Opretter ul'en når siden først loader
    updateActivityList();

});

const brugerNavn = localStorage.getItem('Brugernavn');
// Funktion til at gemme data i databasen
function saveDataToDatabase(Data, Newdatatype) {

    const newData = Data;
    const datatype = Newdatatype;
    // API kald til serveren
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
// Funktion til at hente data fra databasen
async function fetchUserData(username) {
    try {
        const response = await fetch('/fetch-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        // Hvis der ikke er forbindelse til serveren, kastes en fejl
        if (!response.ok) {
            throw new Error('Failed to fetch data from the server');
        }
        // Hvis der er forbindelse til serveren, gemmes data i localStorage
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