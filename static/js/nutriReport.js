document.addEventListener("DOMContentLoaded", function() {
    // Function to calculate calorie deficit/surplus
    function calculateDeficitSurplus(caloriesConsumed, caloriesBurned) {
        return caloriesConsumed - caloriesBurned;
    }

    // Function to create a table row
    function createRow(hour, caloriesConsumed, waterConsumed, caloriesBurned, deficitSurplus) {
        var row = "<tr>";
        row += "<td>" + hour + "</td>";
        row += "<td>" + caloriesConsumed + "</td>";
        row += "<td>" + waterConsumed + "</td>";
        row += "<td>" + caloriesBurned + "</td>";
        row += "<td>" + deficitSurplus + "</td>";
        row += "</tr>";
        return row;
    }

    // Function to render 24-hour view
    function render24HourView() {
        var table = "<table>";
        table += "<tr><th>Hour</th><th>Calories Consumed</th><th>Water Consumed (mL)</th><th>Calories Burned</th><th>Deficit/Surplus</th></tr>";

        // Fetch data from localStorage
        var trackedMeals = JSON.parse(localStorage.getItem("trackedMeals")) || [];
        var trackedActivity = JSON.parse(localStorage.getItem("trackedActivity")) || [];
        var trackedWater = JSON.parse(localStorage.getItem("trackedWater")) || [];

        // Create a date object for 24 hours ago
        var twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        for (var i = 0; i < 24; i++) {
            var hour = twentyFourHoursAgo.getHours() + i;
            var caloriesConsumed = 0;
            var waterConsumed = 0;
            var caloriesBurned = 0;

            // Calculate calories consumed and water consumed for each hour
            trackedMeals.forEach(function(meal) {
                var mealTime = new Date(meal.dateEaten);
                if (mealTime.getHours() === hour) {
                    caloriesConsumed += meal.totalNutrition.calories;
                }
            });

            trackedActivity.forEach(function(activity) {
                var activityTime = new Date(activity.date);
                if (activityTime.getHours() === hour) {
                    caloriesBurned += activity.calories;
                }
            });

            trackedWater.forEach(function(water) {
                var waterTime = new Date(water.dateAndTime);
                if (waterTime.getHours() === hour) {
                    waterConsumed += water.amount;
                }
            });

            // Calculate deficit/surplus
            var deficitSurplus = calculateDeficitSurplus(caloriesConsumed, caloriesBurned);

            // Add row to table
            table += createRow(hour, caloriesConsumed, waterConsumed, caloriesBurned, deficitSurplus);
        }

        table += "</table>";

        // Display table
        document.getElementById("box1-3").innerHTML = table;
    }

 // Function to render 30-day view
function render30DayView() {
    var table = "<table>";
    table += "<tr><th>Date</th><th>Calories Consumed</th><th>Water Consumed (mL)</th><th>Calories Burned</th><th>Deficit/Surplus</th></tr>";

    // Fetch data from localStorage
    var trackedMeals = JSON.parse(localStorage.getItem("trackedMeals")) || [];
    var trackedActivity = JSON.parse(localStorage.getItem("trackedActivity")) || [];
    var trackedWater = JSON.parse(localStorage.getItem("trackedWater")) || [];

    // Create a date object for 30 days ago
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (var i = 0; i < 30; i++) {
        var currentDate = new Date(thirtyDaysAgo);
        currentDate.setDate(thirtyDaysAgo.getDate() + i);
        
        var caloriesConsumed = 0;
        var waterConsumed = 0;
        var caloriesBurned = 0;

        // Calculate calories consumed, water consumed, and calories burned for each day
        trackedMeals.forEach(function(meal) {
            var mealDate = new Date(meal.dateEaten);
            if (mealDate.toDateString() === currentDate.toDateString()) {
                caloriesConsumed += meal.totalNutrition.calories;
            }
        });

        trackedActivity.forEach(function(activity) {
            var activityDate = new Date(activity.date);
            if (activityDate.toDateString() === currentDate.toDateString()) {
                caloriesBurned += activity.calories;
            }
        });

        trackedWater.forEach(function(water) {
            var waterDate = new Date(water.dateAndTime);
            if (waterDate.toDateString() === currentDate.toDateString()) {
                waterConsumed += water.amount;
            }
        });

        // Calculate deficit/surplus
        var deficitSurplus = calculateDeficitSurplus(caloriesConsumed, caloriesBurned);

        // Add row to table
        table += createRow(currentDate.toDateString(), caloriesConsumed, waterConsumed, caloriesBurned, deficitSurplus);
    }

    table += "</table>";

    // Display table
    document.getElementById("box1-3").innerHTML = table;
}


    // Event listeners for buttons
    document.getElementById("view24HourBtn").addEventListener("click", function() {
        render24HourView();
    });

    document.getElementById("view30DayBtn").addEventListener("click", function() {
        render30DayView();
    });
});
