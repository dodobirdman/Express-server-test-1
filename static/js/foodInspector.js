// gem studienummer / apiKey så det er nemmere at kalde det i funktionerne
const apiKey = '168902';
measureRTT();
// Funktioner til at vise/fjerne en loading GIF imens JS venter på svar fra API'en
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

    // Bruger den givne foodID fra dropdown listen
    // Bruger promises til at lave alle API kaldene samtidig, og venter på at de alle er færdige
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

// Funktion til at fylde dropdown med fødevarer baseret på søgefeltet
async function fillDropdown() {
    // Viser loading-ikon for at stoppe interaktion med siden imens koden kører
    showLoadingOverlay();
    // formatterer søgefeltet for at fjerne whitespace
    const foodItem = document.getElementById('foodLookup').value.trim(); 

    // Tjekker om der er skrevet noget i søgefeltet
    if (!foodItem) {
        alert("Please enter a food item.");
        return;
    }
    // Bruger SearchString API'et til at finde fødevarer der matcher søgefeltet
    try {
        const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${encodeURIComponent(foodItem)}`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        });
        const data = await response.json();

        // Sletter tidligere indhold i dropdown
        const dropdown = document.getElementById('foodDropdown');
        dropdown.innerHTML = '';

        // Tager array'et fra API'et og laver en option for hver fødevare
        // Gemmer foodID som .value, så det kan bruges til at finde næringsværdierne
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
    // Fjerner loading-ikon
    hideLoadingOverlay();
}

// Event listener til at søge efter den valgte fødevare i dropdown-listen
document.getElementById('searchSelected').addEventListener('click', function() {
    // Tager .value fra den valgte tekst i dropdown-listen
    let selectedFoodId = document.getElementById('foodDropdown').value;

    if (selectedFoodId) {
        // Kalder foodLookup funktionen med den valgte foodID
        foodLookup(selectedFoodId)
            // Bruger Promise til at vente på at alle API kaldene er færdige
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

// Kører koden hvis brugeren trykker på "Enter"-knappen i søgefeltet
document.getElementById('foodLookup').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('search').click();
    }
});

// Kører koden hvis brugeren trykker på "Enter"-knappen i dropdown-listen
document.getElementById('foodDropdown').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('searchSelected').click();
    }
});


async function measureRTT() {
    const startTime = Date.now(); // Starttidsstempel
  
    const response = await fetch('/api/ping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startTime }),
    });
  
    const data = await response.json();
    const serverTime = data.serverTime;
    const endTime = Date.now(); // Sluttidsstempel
  
    const RTT = endTime - startTime; // RTT inkl. serverbehandling
    console.log(`RTT: ${RTT} ms`);
    console.log(`Server Processing Time: ${data.processingTime} ms`);
}

  

  
 