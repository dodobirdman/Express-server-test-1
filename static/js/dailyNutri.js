document.addEventListener("DOMContentLoaded", () => {
    // Funktion der beregner kalorie overskud/underskud
    const calculateDeficitSurplus = (caloriesConsumed, caloriesBurned) => {
        return caloriesConsumed - caloriesBurned;
    }

// Funktion til at lave et række i tabellen
const createRow = (hour, caloriesConsumed, waterConsumed, caloriesBurned, deficitSurplus, is24HourView = false) => {
    // Formatter timevisning
    const formattedHour = is24HourView ? hour.toString().padStart(2, '0') + ":00" : hour;

    let row = "<tr>";
    row += `<td>${formattedHour}</td>`;
    row += `<td>${caloriesConsumed.toFixed(1)}</td>`;
    row += `<td>${waterConsumed.toFixed(1)}</td>`;
    row += `<td>${caloriesBurned.toFixed(1)}</td>`;
    row += `<td>${deficitSurplus.toFixed(1)}</td>`;
    row += "</tr>";
    return row;
}


    // Funktion der beregner daglig kalorieforbrænding med basalstofskifte
    const getBMRInCalories = () => {
        const BMRInMJ = parseFloat(localStorage.getItem("BMR").slice(1, -1)); 
        const BMRInCalories = BMRInMJ * 239.006; 
        return BMRInCalories;
    }

    // Funktion der viser de sidste 24 timer
const render24HourView = () => {
    let table = "<table>";
    table += "<tr><th>Hour</th><th>Calories Consumed</th><th>Water Consumed (mL)</th><th>Calories Burned</th><th>Deficit/Surplus</th></tr>";

    // Henter dataen fra localStorage
    const trackedMeals = JSON.parse(localStorage.getItem("trackedMeals")) || [];
    const trackedActivity = JSON.parse(localStorage.getItem("trackedActivity")) || [];
    const trackedWater = JSON.parse(localStorage.getItem("trackedWater")) || [];
    const BMRInCalories = getBMRInCalories();
    const caloriesFromBMRPerHour = BMRInCalories / 24;

    // Laver et time objekt
    const currentHour = new Date().getHours();

    // Beregner kalorier og vand for hver time
    for (let i = currentHour; i > currentHour - 24; i--) {
        const hour = (i + 24) % 24; 
        let caloriesConsumed = 0;
        let waterConsumed = 0;
        let caloriesBurned = 0;

        // Finder dataen der matcher timen i hver loop-instans
        trackedMeals.forEach((meal) => {
            const mealTime = new Date(meal.dateEaten);
            if (mealTime.getHours() === hour) {
                caloriesConsumed += meal.totalNutrition.calories;
            }
        });
        trackedActivity.forEach((activity) => {
            const activityTime = new Date(activity.date);
            if (activityTime.getHours() === hour) {
                caloriesBurned += activity.calories;
            }
        });

        trackedWater.forEach((water) => {
            const waterTime = new Date(water.dateAndTime);
            if (waterTime.getHours() === hour) {
                waterConsumed += water.amount;
            }
        });

        // Tilføjer basalstofskifte til kalorier forbrændt
        caloriesBurned += caloriesFromBMRPerHour;

        // Beregner overskud/underskud for hver time
        const deficitSurplus = calculateDeficitSurplus(caloriesConsumed, caloriesBurned);

        // Sætter rækken ind i tabellen
        table += createRow(hour, caloriesConsumed, waterConsumed, caloriesBurned, deficitSurplus, true);

    }

    table += "</table>";

    // Sætter tabellen ind i HTML
    document.getElementById("box1-3").innerHTML = table;
}

    // Funktion der viser de sidste 30 dage
    const render30DayView = () => {
        let table = "<table>";
        table += "<tr><th>Date</th><th>Calories Consumed</th><th>Water Consumed (mL)</th><th>Calories Burned</th><th>Deficit/Surplus</th></tr>";
    
        // Henter dataen fra localStorage
        const trackedMeals = JSON.parse(localStorage.getItem("trackedMeals")) || [];
        const trackedActivity = JSON.parse(localStorage.getItem("trackedActivity")) || [];
        const trackedWater = JSON.parse(localStorage.getItem("trackedWater")) || [];
        const BMRInCalories = getBMRInCalories();
    
        // loop der kører for de sidste 30 dage
        for (let i = 0; i < 30; i++) {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - i);
            let caloriesConsumed = 0;
            let waterConsumed = 0;
            let caloriesBurned = 0;
    
            // Tage dataen der matcher datoen i hver loop-instans
            trackedMeals.forEach((meal) => {
                const mealDate = new Date(meal.dateEaten);
                if (mealDate.toDateString() === currentDate.toDateString()) {
                    caloriesConsumed += meal.totalNutrition.calories;
                }
            });
    
            trackedActivity.forEach((activity) => {
                const activityDate = new Date(activity.date);
                if (activityDate.toDateString() === currentDate.toDateString()) {
                    caloriesBurned += activity.calories;
                }
            });
    
            trackedWater.forEach((water) => {
                const waterDate = new Date(water.dateAndTime);
                if (waterDate.toDateString() === currentDate.toDateString()) {
                    waterConsumed += water.amount;
                }
            });
    
            // Tilføjer basalstofskifte til kalorier forbrændt
            caloriesBurned += BMRInCalories;
    
            // Beregner daglig overskud/underskud
            const deficitSurplus = calculateDeficitSurplus(caloriesConsumed, caloriesBurned);
    
            // tilføjer rækken til tabellen i hver loop
            table += createRow(currentDate.toDateString(), caloriesConsumed, waterConsumed, caloriesBurned, deficitSurplus);
        }
    
        table += "</table>";
    
        // Sætter tabellen ind i HTML
        document.getElementById("box1-3").innerHTML = table;
    }
    

    // Kører kode hvis knapperne er trykket
    document.getElementById("view24HourBtn").addEventListener("click", () => {
        render24HourView();
    });

    document.getElementById("view30DayBtn").addEventListener("click", () => {
        render30DayView();
    });
});
