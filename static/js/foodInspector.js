// gem studienummer / apiKey så det er nemmere at kalde det i funktionerne
const apiKey = '168902';

// Hvis websiden er åbnet med en fødevarenavn i URL-linket, køre automatisk en søgning for den fødevare, 
// Er lavet til at fungere med Meal Creator, hvis brugeren trykker på en fødevare, og det her tager linket og decoder den

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Kode til at vise/fjerne en loading GIF imens JS venter på svar fra API'en
function showLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'flex';
}
function hideLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'none';
}

// Den primær funktion for at søge efter en fødevare
function foodLookup(foodItemId) {
    // Viser loading GIF'en
    showLoadingOverlay();

    // Bruger foodID'en fra den første API til at kalde API'ens BySortKey endpoint med Promise
    return Promise.all([
        fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodItemId}/BySortKey/1030`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        }),
        fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodItemId}/BySortKey/1310`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        }),
        fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodItemId}/BySortKey/1240`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        }),
        fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodItemId}/BySortKey/1110`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        }),
        fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodItemId}/BySortKey/1010`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        }),
        fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodItemId}/BySortKey/1230`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        }),
        fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodItemId}/BySortKey/1620`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        }),
        fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodItemId}/BySortKey/1610`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        }),
        // Kalder FoodItems til at finde taxonomi, navn, osv
        fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/${foodItemId}`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        }),
    ]);
}

// Kører fillDropdown når brugeren trykker på search-knappen
document.getElementById('search').addEventListener('click', fillDropdown);

// Funktion til at fylde dropdown med fødevareemner baseret på søgeterm
async function fillDropdown() {
    showLoadingOverlay();
    const foodItem = document.getElementById('foodLookup').value.trim(); // Get the food item from the input field

    if (!foodItem) {
        alert("Please enter a food item.");
        return;
    }

    try {
        const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${encodeURIComponent(foodItem)}`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        });
        const data = await response.json();

        // Clear previous dropdown options
        const dropdown = document.getElementById('foodDropdown');
        dropdown.innerHTML = '';

        // Populate dropdown with food items
        data.forEach(item => {
            const option = document.createElement('option');
            option.text = item.foodName;
            option.value = item.foodID;
            dropdown.add(option);
        });
    } catch (error) {
        console.error("Error fetching food items:", error);
        alert("Error fetching food items. Please try again later.");
    }
    hideLoadingOverlay();
}

// Add event listener to the secondary button to trigger search for selected food item
document.getElementById('searchSelected').addEventListener('click', function() {
    let selectedFoodId = document.getElementById('foodDropdown').value;

    // Check if foodID is present in the URL
    const foodIDFromURL = getParameterByName('foodID');
    if (foodIDFromURL) {
        selectedFoodId = foodIDFromURL; // If foodID is present in URL, use that instead
    }

    if (selectedFoodId) {
        foodLookup(selectedFoodId)
            .then(responses => Promise.all(responses.map(response => response.json())))
            .then(data => {
                // Laver consts med objekterne fra hver API svar baseret på rækkefølgen de var kaldt i
                const [
                    caloriesEntry,
                    fatEntry,
                    fiberEntry,
                    proteinEntry,
                    kJEntry,
                    carbsEntry,
                    waterEntry,
                    dryMatterEntry,
                    foodInfo,
                ] = data;

                // Funktion til at få resVal ud fra hver objekt, der også tjekker at objektet er struktureret korrekt
                const extractValue = (entry) =>
                    entry && Array.isArray(entry) && entry.length > 0 && entry[0].resVal !== undefined
                        ? entry[0].resVal
                        : 'N/A';

                // Laver consts med næringsinfoen ved at kalde extractValue med de tidligere consts 
                const calories = extractValue(caloriesEntry);
                const fat = extractValue(fatEntry);
                const fiber = extractValue(fiberEntry);
                const protein = extractValue(proteinEntry);
                const kJ = extractValue(kJEntry);
                const carbs = extractValue(carbsEntry);
                const water = extractValue(waterEntry);
                const dryMatter = extractValue(dryMatterEntry);

                // Får informationer som navn, taxonomi osv for fødevaren, fra API-kaldet til FoodItems/(foodItemID)

                const foodInfoData = foodInfo || {}; // Tjekker at foodInfo er et objekt
                const foodName = foodInfoData.foodName || 'N/A';
                const foodID = foodInfoData.foodID || 'N/A';
                const taxonomicName = foodInfoData.taxonomicName || 'N/A';
                const foodGroup = foodInfoData.foodGroup || 'N/A';

                // Sætter alle nærings-værdier ind i HTML
                const nutritionList = document.getElementById('nutritionList');
                nutritionList.innerHTML = `<li>All values shown are per 100g</li>` +
                    `<li>kCal: ${calories}</li>` +
                    `<li>Fat: ${fat}</li>` +
                    `<li>Fiber: ${fiber}</li>` +
                    `<li>Protein: ${protein}</li>` +
                    `<li>kJ: ${kJ}</li>` +
                    `<li>Carbohydrates: ${carbs}</li>` +
                    `<li>Water: ${water}</li>` +
                    `<li>Dry Matter: ${dryMatter}</li>`;

                const foodNameDiv = document.getElementById('foodName');
                const foodIDDiv = document.getElementById('foodID');
                const taxonomyDiv = document.getElementById('taxonomy');
                const foodGroupDiv = document.getElementById('foodGroup');

                // Sætter informationen om fødevaren ind i HTML
                foodNameDiv.textContent = `Food Name: ${foodName}`;
                foodIDDiv.textContent = `Food ID: ${foodID}`;
                taxonomyDiv.textContent = `Taxonomy: ${taxonomicName}`;
                foodGroupDiv.textContent = `Food Group: ${foodGroup}`;
                hideLoadingOverlay();
            })
            .catch(error => {
                hideLoadingOverlay();
                window.location.href = "foodInspector.html"
                console.error('Error fetching data:', error);
            });
    } else {
        alert("Please select a food item from the dropdown or provide a foodID in the URL.");
    }
});

// Tjekker hvis der er en foodName i URL'en, og kører automatisk foodLookup hvis det er sandt
if (getParameterByName('foodName')) {
    const foodIDFromURL = getParameterByName('foodID');
    if (foodIDFromURL) {
        foodLookup(foodIDFromURL);
    }
}

// Add event listener to the input field to detect Enter key press
document.getElementById('foodLookup').addEventListener('keyup', function(event) {
    // Check if the key pressed is Enter
    if (event.key === 'Enter') {
        // Trigger click event on the search button
        document.getElementById('search').click();
    }
});

// Add event listener to the dropdown to detect Enter key press
document.getElementById('foodDropdown').addEventListener('keyup', function(event) {
    // Check if the key pressed is Enter
    if (event.key === 'Enter') {
        // Trigger click event on the searchSelected button
        document.getElementById('searchSelected').click();
    }
});
