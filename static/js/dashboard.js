// Kører koden når DOM er loadet
document.addEventListener("DOMContentLoaded", function () {
    // Tager idags dato i formatet: "YYYY-MM-DD"
    const today = new Date().toISOString().split("T")[0];

    // Henter trackedMeals og trackedWater fra localStorage
    const trackedMeals = JSON.parse(localStorage.getItem("trackedMeals")) || [];
    const trackedWater = JSON.parse(localStorage.getItem("trackedWater")) || [];

    // Bruger .filter til at få kun måltiderne spist i dag
    const mealsToday = trackedMeals.filter(
        (meal) => meal.dateEaten.split("T")[0] === today
    );

    // Bruger .filter igen til at finde vand drukket i dag
    const waterToday = trackedWater.filter(
        (water) => water.dateAndTime.split("T")[0] === today    


    );


    //awidjawiuueiahawojdoawdawoiupawieawepiao
    // Finder længden af mealsToday og opdaterer div'en mealsTodayNum med hvor mange måltider blev spist i dag
    const mealsTodayNum = mealsToday.length;
    document.getElementById("mealsTodayNum").innerText = mealsTodayNum;

    // Tæller sammen kalorierne fra alle måltider spist i dag og opdaterer "Energy Today" på Dashboard
const totalCaloriesToday = mealsToday.reduce(
(total, meal) => total + meal.totalNutrition.calories,
0
);
    document.getElementById("energyTodayNum").innerText = totalCaloriesToday.toFixed(2) + " kcal";

    // Tæller sammen alle vand-logs for i dag og opdaterer "Water Today" på Dashboard
    const totalWaterToday = waterToday.reduce((total, water) => total + water.amount, 0);
    document.getElementById("waterTodayNum").innerText = totalWaterToday + " mL";

    // Tæller sammen protein fra måltiderne i dag og opdaterer "Protein Today" på Dashboard
    const totalProteinToday = mealsToday.reduce(
        (total, meal) => total + meal.totalNutrition.protein,
        0
    );
    document.getElementById("proteinTodayNum").innerText = totalProteinToday.toFixed(2) + " g";
});
