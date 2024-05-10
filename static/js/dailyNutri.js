document.addEventListener("DOMContentLoaded", () => {
    // Function to calculate calorie deficit/surplus
    const calculateDeficitSurplus = (caloriesConsumed, caloriesBurned) => {
        return caloriesConsumed - caloriesBurned;
    }

// Function to create a table row
const createRow = (hour, caloriesConsumed, waterConsumed, caloriesBurned, deficitSurplus, is24HourView = false) => {
    // Format the hour with :00 at the end if it's a 24-hour view
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


    // Function to get BMR in calories per day
    const getBMRInCalories = () => {
        const BMRInMJ = parseFloat(localStorage.getItem("BMR").slice(1, -1)); // Remove brackets and parse
        const BMRInCalories = BMRInMJ * 239.006; // Convert BMR from MJ to calories per day
        return BMRInCalories;
    }

    // Function to render 24-hour view
const render24HourView = () => {
    let table = "<table>";
    table += "<tr><th>Hour</th><th>Calories Consumed</th><th>Water Consumed (mL)</th><th>Calories Burned</th><th>Deficit/Surplus</th></tr>";

    // Fetch data from localStorage
    const trackedMeals = JSON.parse(localStorage.getItem("trackedMeals")) || [];
    const trackedActivity = JSON.parse(localStorage.getItem("trackedActivity")) || [];
    const trackedWater = JSON.parse(localStorage.getItem("trackedWater")) || [];
    const BMRInCalories = getBMRInCalories();
    const caloriesFromBMRPerHour = BMRInCalories / 24;

    // Create a date object for the current hour
    const currentHour = new Date().getHours();

    for (let i = currentHour; i > currentHour - 24; i--) {
        const hour = (i + 24) % 24; // Ensure hour is within 0-23 range
        let caloriesConsumed = 0;
        let waterConsumed = 0;
        let caloriesBurned = 0;

        // Calculate calories consumed and water consumed for each hour
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

        // Add calories from BMR to calories burned
        caloriesBurned += caloriesFromBMRPerHour;

        // Calculate deficit/surplus
        const deficitSurplus = calculateDeficitSurplus(caloriesConsumed, caloriesBurned);

        // Add row to table
        table += createRow(hour, caloriesConsumed, waterConsumed, caloriesBurned, deficitSurplus, true);

    }

    table += "</table>";

    // Display table
    document.getElementById("box1-3").innerHTML = table;
}

    // Function to render 30-day view
    const render30DayView = () => {
        let table = "<table>";
        table += "<tr><th>Date</th><th>Calories Consumed</th><th>Water Consumed (mL)</th><th>Calories Burned</th><th>Deficit/Surplus</th></tr>";
    
        // Fetch data from localStorage
        const trackedMeals = JSON.parse(localStorage.getItem("trackedMeals")) || [];
        const trackedActivity = JSON.parse(localStorage.getItem("trackedActivity")) || [];
        const trackedWater = JSON.parse(localStorage.getItem("trackedWater")) || [];
        const BMRInCalories = getBMRInCalories();
    
        for (let i = 0; i < 30; i++) {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - i);
            let caloriesConsumed = 0;
            let waterConsumed = 0;
            let caloriesBurned = 0;
    
            // Calculate calories consumed, water consumed, and calories burned for each day
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
    
            // Add calories from BMR to calories burned
            caloriesBurned += BMRInCalories;
    
            // Calculate deficit/surplus
            const deficitSurplus = calculateDeficitSurplus(caloriesConsumed, caloriesBurned);
    
            // Add row to table
            table += createRow(currentDate.toDateString(), caloriesConsumed, waterConsumed, caloriesBurned, deficitSurplus);
        }
    
        table += "</table>";
    
        // Display table
        document.getElementById("box1-3").innerHTML = table;
    }
    

    // Event listeners for buttons
    document.getElementById("view24HourBtn").addEventListener("click", () => {
        render24HourView();
    });

    document.getElementById("view30DayBtn").addEventListener("click", () => {
        render30DayView();
    });
});
