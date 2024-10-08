// Kører koden når DOM er loadet
// Koden er baseret på koden i mealTracker.js
document.addEventListener('DOMContentLoaded', function () {
    // Henter trackedWater fra localStorage, eller laver et tomt array hvis det ikke findes
    const trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];
    // Finder div'en hvor data skal sættes ind
    const trackedWaterList = document.getElementById('trackedWaterList');

    // Autofill dato og tid
    const datetimeInput = document.getElementById("waterDateInput");
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
    datetimeInput.value = currentDatetime;

    // Funktion til at sætte trackedWater ind i HTML
    function renderTrackedWater(waterLog) {
        // Laver en række til hver vand-log
        const tableRow = document.createElement('li');
        // Tilføjer en CSS klasse til rækken
        tableRow.classList.add('tracked-water-row');

        // Laver en array med de egenskaber der skal vises
        const properties = ['amount', 'dateAndTime'];

        // Laver en div for hver egenskab
        properties.forEach((property, index) => {
            const cell = document.createElement('div');
            const value = waterLog[property];

            cell.textContent = value;

            tableRow.appendChild(cell);
        });

        // Laver en knap til at redigere vand-loggen
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'editButton';
        editButton.onclick = function () {
            editWaterLog(waterLog.id);
        };

        // Laver en knap til at slette vand-loggen
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'deleteButton';
        deleteButton.onclick = function () {
            deleteWaterLog(waterLog.id);
        };
        // Sætter knapperne ind i rækken
        tableRow.appendChild(editButton);
        tableRow.appendChild(deleteButton);

        // Sætter rækken ind i listen
        trackedWaterList.appendChild(tableRow);
    }

    // Kører renderTrackedWater for hver vand-log i trackedWater, for at vise de eksisterende logs
    trackedWater.forEach(renderTrackedWater);

    // Funktion der gemmer trackedMeals i databasen ud fra den bruger som er logget ind.
    // Henter brugernavn fra localStorage
    const brugerNavn = localStorage.getItem('Brugernavn');
    function saveTrackedWaterToDatabase(trackedWater) {

        const water = trackedWater;

        fetch('/track-water', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ brugerNavn, water }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save Trackedwater to the database');
                }
                return response.json();
            })
            .then(data => {
                console.log('TrackedWater saved to the database:', data);
            })
            .catch(error => {
                console.error('Error saving TrackedWater to the database:', error);
            });
    }

    // Funktion til at logge vandindtag
    window.logWater = function () {
        // Henter værdierne fra inputfelterne
        const amount = parseFloat(document.getElementById('waterAmountInput').value) || 0;
        const dateAndTime = document.getElementById('waterDateInput').value;

        // Opretter en ny vand-log med dato/tid som id HII
        const waterLog = {
            id: new Date().getTime(),
            amount: amount,
            dateAndTime: dateAndTime
        };
        // Henter trackedWater fra localStorage, eller laver et tomt array hvis det ikke findes
        const trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];
        // Tilføjer den nye vand-log til trackedWater
        trackedWater.push(waterLog);
        // Gemmer trackedWater i databasen
        saveTrackedWaterToDatabase(JSON.stringify(trackedWater));
        // Opdaterer den lokale kopi af trackedWater i localStorage
        localStorage.setItem('trackedWater', JSON.stringify(trackedWater));
        // Opdaterer siden med den nye vand-log
        renderTrackedWater(waterLog);
    };

    // Funktion til at redigere en vand-log
    window.editWaterLog = function (logId) {
        // Henter eksisterende vand-log fra localStorage
        const trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];
        // Finder den log der skal redigeres
        const editedWaterLog = trackedWater.find(log => log.id === logId);

        // Hvis vand-loggen findes, bedes brugeren om at indtaste nye værdier
        if (editedWaterLog) {
            const newAmount = parseFloat(prompt(`Edit water amount for ${editedWaterLog.dateAndTime}:`, editedWaterLog.amount)) || 0;
            const newDateAndTime = prompt(`Edit date & time for ${editedWaterLog.dateAndTime}:`, editedWaterLog.dateAndTime);

            editedWaterLog.amount = newAmount;
            editedWaterLog.dateAndTime = newDateAndTime;

            // Uploader den opdaterede vand-log til databasen
            saveTrackedWaterToDatabase(JSON.stringify(trackedWater));
            // Opdaterer den lokale kopi af trackedWater i localStorage
            localStorage.setItem('trackedWater', JSON.stringify(trackedWater));

            // Opdaterer siden ved at tømme og gendindlæse vandloggene
            trackedWaterList.innerHTML = '';
            trackedWater.forEach(renderTrackedWater);
        }
    };

    // Funktion til at slette en vand-log
    window.deleteWaterLog = function (logId) {
        // Henter eksisterende vand-logs fra localStorage
        const trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];
        // Filtrer ud den log der skal slettes
        const updatedTrackedWater = trackedWater.filter(log => log.id !== logId);

        // Uploader den opdaterede vand-log til databasen
        saveTrackedWaterToDatabase(JSON.stringify(updatedTrackedWater));
        // Opdaterer den lokale kopi af trackedWater i localStorage
        localStorage.setItem('trackedWater', JSON.stringify(updatedTrackedWater));

        // Opdaterer siden ved at tømme og gendindlæse vandloggene
        trackedWaterList.innerHTML = '';
        updatedTrackedWater.forEach(renderTrackedWater);
    };
});



