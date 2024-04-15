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
function foodLookup() {
    // Viser loading GIF'en
    showLoadingOverlay();

    // Prøver at finde en foodName fra linket
    const foodNameParam = getParameterByName('foodName');
    // Hvis der er en foodName i linket, så sætter den automatisk foodName ind i søgefeltet
    if (foodNameParam) {
        document.getElementById('foodLookup').value = foodNameParam;
    }

    // Tager fødevaren fra søgefeltet
    const foodItem = document.getElementById('foodLookup').value;

    // Funktion til at finde foodID'en fra API'en med BySearch 
    fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${foodItem}`, {
        method: 'GET',
        headers: {
            'X-API-Key': apiKey,
        },
    })
        .then(response => response.json())
        .then(data => {
            // Hvis en fødevare er fundet, tage .foodID og lave det til en const
            if (data && data.length > 0) {
                const foodItemId = data[0].foodID;

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
            } else {
                // Funktion til at fortælle brugeren at der var ingen fødevarer, og også lave en error meddelelse så jeg kunne troubleshoot
                alert(`No matching food items found`);
                throw new Error('No matching food items found.');
            }
        })
        // Tager alle API svarer og laver en JSON med dem allesammen
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

            // Gemmer loading GIFen efter alt andet er færdig
            hideLoadingOverlay();
        })
        // Catch til at vise en fejl i konsollen hvis det går galt
        .catch(error => {
            hideLoadingOverlay();
            window.location.href = "foodInspector.html"
            console.error('Error fetching data:', error);
        });
    
}
// Tjekker hvis der er en foodName i URL'en, og kører automatisk foodLookup hvis det er sandt
if (getParameterByName('foodName')) {
    window.onload = foodLookup;
}
// Kører foodLookup når brugeren trykker på search-knappen
document.getElementById('search').addEventListener('click', foodLookup);

