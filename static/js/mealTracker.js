document.addEventListener('DOMContentLoaded', async function () {
    try {

        // Henter måldtider fra localStorage
        const createdMeals = JSON.parse(localStorage.getItem('createdMeals')) || [];

        // Sætter måltiderne ind i dropdown-menuen
        const mealDropdown = document.getElementById('mealDropdown');
        createdMeals.forEach(meal => {
            const option = document.createElement('option');
            option.value = meal.name;
            option.text = meal.name;
            mealDropdown.appendChild(option);
        });

        // Autoudfylder datofeltet med nuværende dato og tid
        const dateInput = document.getElementById('dateInput');
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const currentDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
        dateInput.value = currentDatetime;

        // Henter de tidligere tracked meals fra localStorage når siden loader
        const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
        const trackedMealsList = document.getElementById('trackedMealsList');

        // Funktion til at vise tracked måltider
        function renderTrackedMeal(trackedMeal) {
            const tableRow = document.createElement('li');
            tableRow.classList.add('tracked-meal-row');

            // Laver en fast bredde til navnet på måltidet
            const nameColumnWidth = '80px';

            // Laver en array med de egenskaber der skal vises
            const properties = ['name', 'gramsEaten', 'totalNutrition.calories', 'totalNutrition.protein', 'totalNutrition.fat', 'totalNutrition.fiber', 'dateEaten'];

            // Laver en div for hver egenskab og sætter den til den rigtige bredde
            properties.forEach((property, index) => {
                const cell = document.createElement('div');
                const value = property.split('.').reduce((obj, key) => obj[key], trackedMeal);

                // Sætter en fast decimalplads på talværdierne
                if (typeof value === 'number') {
                    cell.textContent = value.toFixed(2);
                } else {
                    cell.textContent = value;

                    // Sætter en fast bredde på cellen
                    if (index === 0) {
                        cell.style.width = nameColumnWidth;
                    }
                }
                // Sætter cellen ind i tabelrækken
                tableRow.appendChild(cell);
            });

            // Laver en knap til at redigere måltidet
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'editButton';
            editButton.onclick = function () {
                editMeal(trackedMeal.id);
            };
            // Laver en knap til at slette måltidet
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'deleteButton';
            deleteButton.onclick = function () {
                deleteMeal(trackedMeal.id);
            };

            // Sætter knapperne ind i tabelrækken
            tableRow.appendChild(editButton);
            tableRow.appendChild(deleteButton);

            // Sætter rækken ind i tabellen
            trackedMealsList.appendChild(tableRow);
        }

        // Viser de tracked meals der er gemt i localStorage
        trackedMeals.forEach(renderTrackedMeal);

        // Funktion til at beregne næringsindholdet i portionen
        function calculateNutrition(ingredients, gramsEaten) {
            // Sætter totalNutrition og grams til 0
            const totalNutrition = { calories: 0, protein: 0, fat: 0, fiber: 0 };
            let totalGrams = 0;
            // Løber igennem alle ingredienser og lægger deres næringsindhold sammen
            ingredients.forEach(ingredient => {
                totalGrams += parseFloat(ingredient.quantity); // Sørger for at quantity er et tal
            });
            // Tager næringsindholdet for hver ingrediens og ganger det med hvor mange gram der er spist af måltidet
            ingredients.forEach(ingredient => {
                const factor = gramsEaten / totalGrams;
                totalNutrition.calories += ingredient.nutrition.calories * factor;
                totalNutrition.protein += ingredient.nutrition.protein * factor;
                totalNutrition.fat += ingredient.nutrition.fat * factor;
                totalNutrition.fiber += ingredient.nutrition.fiber * factor;
            });

            return totalNutrition;
        }


        //Funktion der gemmer trackedMeals i databasen med brugernavn
        const brugerNavn = localStorage.getItem('Brugernavn');
        function saveTrackedMealsToDatabase(trackedMeals) {

            const meals = trackedMeals;
            // Bruger /track-meals endpointet til at POST til serveren
            fetch('/track-meals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ brugerNavn, meals }), 
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to save Trackedmeals to the database');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('TrackedMeals saved to the database:', data);
                })
                .catch(error => {
                    console.error('Error saving Trackedmeals to the database:', error);
                });
        }


        // Funktion til at logge et måltid med dato og tidspunkt
        window.logMeal = function () {
            const selectedMealName = mealDropdown.value;
            const gramsEaten = parseFloat(document.getElementById('gramsInput').value) || 0; // Sørger for at gramsEaten er et tal
            if (gramsEaten === 0) {
                alert('Please enter the grams eaten for the meal.');
                return; 
            }
            const dateEaten = document.getElementById('dateInput').value; // Tager dato og tidspunkt fra input-feltet
            const selectedMeal = createdMeals.find(meal => meal.name === selectedMealName); // Finder det valgte måltid

            // Gemmer måltidet i localStorage
            if (selectedMeal) {
                const totalNutrition = calculateNutrition(selectedMeal.ingredients, gramsEaten);

                // Anmoder om brugerens placering
                navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

                function successCallback(position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    // Bruger tidspunkt som ID i localStorage 
                    const trackedMeal = {
                        id: new Date().getTime(),
                        name: selectedMeal.name,
                        gramsEaten: gramsEaten,
                        totalNutrition: totalNutrition,
                        dateEaten: dateEaten,
                        latitude: latitude,
                        longitude: longitude
                    };

                    // Opdaterer eller laver trackedMeals i localStorage
                    const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
                    trackedMeals.push(trackedMeal);

                    // Gemmer trackedMeals i databasen
                    saveTrackedMealsToDatabase(JSON.stringify(trackedMeals));
                    localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));

                    // Kalder renderTrackedMeal for at vise det nye måltid
                    renderTrackedMeal(trackedMeal);
                }

                function errorCallback(error) {
                    console.log("Fejl ved at få position: " + error.message);
                    // Håndter fejl, hvis placering ikke kan findes
                }
            }
        };


        // Funktion til at redigere et tracked måltid
        window.editMeal = function (mealId) {
            const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
        
            const editedMealIndex = trackedMeals.findIndex(meal => meal.id === mealId);
            
            // If-statement der tjekker hvis måltidet er fundet i trackedMeals
            if (editedMealIndex !== -1) {
                const editedMeal = trackedMeals[editedMealIndex];
                const currentGramsEaten = editedMeal.gramsEaten;
        
                // Prompt til at få den nye mængde
                const newGramsEaten = parseFloat(prompt(`Edit grams eaten for ${editedMeal.name}:`, currentGramsEaten)) || 0;
                if (newGramsEaten === 0) {
                    alert('Invalid input. Grams eaten must be greater than 0.');
                    return;
                }
        
                // Laver en ratio for at opdatere næringsværdierne
                const weightRatio = newGramsEaten / currentGramsEaten;
        
                // Opdater næringsværdierne baseret på den nye mængde
                const updatedTotalNutrition = {
                    calories: editedMeal.totalNutrition.calories * weightRatio,
                    protein: editedMeal.totalNutrition.protein * weightRatio,
                    fat: editedMeal.totalNutrition.fat * weightRatio,
                    fiber: editedMeal.totalNutrition.fiber * weightRatio,
                };
        
                // Prompt til at ændre dato og tid
                const newDateEaten = prompt(`Edit date & time for ${editedMeal.name}:`, editedMeal.dateEaten);
        
                // Opdaterer måltidet med de nye værdier
                editedMeal.gramsEaten = newGramsEaten;
                editedMeal.dateEaten = newDateEaten || editedMeal.dateEaten;
                editedMeal.totalNutrition = updatedTotalNutrition;
        
                // Opdaterer trackedMeals med det redigerede måltid
                trackedMeals[editedMealIndex] = editedMeal;
        
                // Opdaterer den lokal kopi af trackedMeals for at vise det på siden
                localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));
        
                // Kalder function til at gemme måltidet i databasen
                saveTrackedMealsToDatabase(JSON.stringify(trackedMeals));
        
                // Reloader trackedMeals listen med den redigerede måltid
                trackedMealsList.innerHTML = '';
                trackedMeals.forEach(renderTrackedMeal);
            } else {
                console.error('Error: Meal not found in trackedMeals.');
            }
        };
        

        // Funktion til at slette et tracked måltid
        window.deleteMeal = function (mealId) {
            // Henter trackedMeals fra localStorage
            const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
            // Filtrerer ud den måltid der skal slettes
            const updatedTrackedMeals = trackedMeals.filter(meal => meal.id !== mealId);

            // Opdaterer databasen med den nye liste af tracked meals
            saveTrackedMealsToDatabase(JSON.stringify(updatedTrackedMeals));
            // Opdaterer den lokal kopi af trackedMeals
            localStorage.setItem('trackedMeals', JSON.stringify(updatedTrackedMeals));

            // Reloader trackedMeals listen efter måltidet er slettet
            trackedMealsList.innerHTML = '';
            updatedTrackedMeals.forEach(renderTrackedMeal);
        };
    } catch (error) {
        console.error('Error:', error);
    }

    // Funktion til at opdater den lokale kopi af brugerdata
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
            // Looper igennem dataen og gemmer den i localStorage
            Object.entries(responseData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
    
            console.log('Data fetched and saved to localStorage successfully.');
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    // Tager brugernavn fra localStorage og henter brugerdata
    const brugerNavn = localStorage.getItem('Brugernavn');
    fetchUserData(brugerNavn);

});

