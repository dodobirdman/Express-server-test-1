document.addEventListener("DOMContentLoaded", async function() {
    // Henter elementer fra DOM
    let profileLink = document.getElementById("profileLink");
    let loginLink = document.getElementById("loginLink");
    let signupLink = document.getElementById("signupLink");
    let signoutLink = document.getElementById("signoutLink");
    let userDataDiv = document.getElementById("userData");
    let userName = document.getElementById("userName");
    let userHeight = document.getElementById("userHeight");
    let userWeight = document.getElementById("userWeight");
    let userAge = document.getElementById("userAge");
    let userSex = document.getElementById("userSex");
    const deleteProfileButton = document.getElementById('deleteProfile');

    // Tjekker hvis brugernavn findes i localstorage, hvilket betyder at brugeren er logget ind
    if (localStorage.getItem("Brugernavn") !== null) {
        profileLink.style.display = "block";
        loginLink.style.display = "none";
        signupLink.style.display = "none";
        signoutLink.style.display = "block";

        // Henter brugerens data fra localstorage
        let name = localStorage.getItem("name");
        let height = localStorage.getItem("Height");
        let weight = localStorage.getItem("Weight");
        let age = localStorage.getItem("age");
        let sex = localStorage.getItem("Sex");

        // Tjekker hvis alle data er tilgængelige
        if (name && height && weight && age && sex) {
            userDataDiv.style.display = "block";
            userName.textContent = name;
            userHeight.textContent = "Height: " + height + " cm";
            userWeight.textContent = "Weight: " + weight + " kg";
            userAge.textContent = "Age: " + age + " years";
            userSex.textContent = "Sex: " + sex;

            // Etablerer variabler til at redigere brugerens data
            let editHeightBtn = document.getElementById("editHeight");
            let editWeightBtn = document.getElementById("editWeight");
            let editAgeBtn = document.getElementById("editAge");
            let editSexBtn = document.getElementById("editSex");

            // Funktioner der bruger prompt til at få opdaterede data og saveDataToDatabase til at gemme data
            // Knapperne kalder funktionen både med data og datatypen
            editHeightBtn.addEventListener("click", function() {
                let newHeight = prompt("Enter new height (in cm):");
                if (newHeight !== null && !isNaN(newHeight)) {
                    saveDataToDatabase(newHeight, 'Height');
                    localStorage.setItem("Height", newHeight);
                    userHeight.textContent = "Height: " + newHeight + " cm";
                }
            });

            editWeightBtn.addEventListener("click", function() {
                let newWeight = prompt("Enter new weight (in kg):");
                if (newWeight !== null && !isNaN(newWeight)) {
                    saveDataToDatabase(newWeight, 'Weight');
                    localStorage.setItem("Weight", newWeight);
                    userWeight.textContent = "Weight: " + newWeight + " kg";
                }
            });

            editAgeBtn.addEventListener("click", function() {
                let newAge = prompt("Enter new age:");
                if (newAge !== null && !isNaN(newAge)) {
                    saveDataToDatabase(newAge, 'age');
                    localStorage.setItem("age", newAge);
                    userAge.textContent = "Age: " + newAge + " years";
                }
            });

            editSexBtn.addEventListener("click", function() {
                let newSex = prompt("Enter new sex:");
                const SEX = 'Sex';
                if (newSex !== null) {
                    saveDataToDatabase(newSex, 'Sex');
                    localStorage.setItem("Sex", newSex);
                    userSex.textContent = "Sex: " + newSex;
                }
                
            });
        }
    } else {
        profileLink.style.display = "none";
        loginLink.style.display = "block";
        signupLink.style.display = "block";
        signoutLink.style.display = "none";
    }

// Funktion til at gemme data til databasen
// Brugernavn er hentet fra localstorage
    const brugerNavn = localStorage.getItem('Brugernavn');
    // Data og datatype er parametre til funktionen, og sendes til serveren der håndterer dataen baseret på datatypen
    function saveDataToDatabase(Data, Newdatatype) {
        const newData = Data;
        const datatype = Newdatatype;
        // kalder/save-data API endpointet
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
    // fetchUserData opdaterer localstorage med data fra serveren
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
            // Looper igennem alle keys og objekter, og gemmer dem i localstorage
            Object.entries(responseData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
    
            console.log('Data fetched and saved to localStorage successfully.');
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    fetchUserData(brugerNavn);
    // Event listener der kalder deleteProfile funktionen
    deleteProfileButton.addEventListener('click', function() {
        let confirmation = confirm("Are you sure you want to delete your profile?");
        if (confirmation) {
            deleteProfileToDatabase(brugerNavn);
        }
    });

    // Funktion til slette brugerens profil via /delete-profile endpointet
    function deleteProfileToDatabase(brugerNavn) {
        fetch('/delete-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({brugerNavn}), 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save to the database');
            }
            return response.json();
        })
        // Brugeren bliver viderestillet til signout, hvis serveren svarer med success
        // Dette sørger for at den lokal gemte data også bliver slettet
        .then(data => {
            console.log('saved to the database:', data);
            window.location.href = '/static/html/signout.html';
        })
        .catch(error => {
            console.error('Error saving to the database:', error);
        });
        
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
  
    const serverTime = (await response.json()).serverTime;
    const endTime = Date.now(); // Sluttidsstempel
  
    const RTT = endTime - startTime;
    console.log(`RTT: ${RTT} ms`);
    console.log(`Server Processing Time: ${serverTime - startTime} ms`);
  }
  
  measureRTT();
