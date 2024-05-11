document.addEventListener("DOMContentLoaded", async function() {
    var profileLink = document.getElementById("profileLink");
    var loginLink = document.getElementById("loginLink");
    var signupLink = document.getElementById("signupLink");
    var signoutLink = document.getElementById("signoutLink");
    var userDataDiv = document.getElementById("userData");
    var userName = document.getElementById("userName");
    var userHeight = document.getElementById("userHeight");
    var userWeight = document.getElementById("userWeight");
    var userAge = document.getElementById("userAge");
    var userSex = document.getElementById("userSex");
    const deleteProfileButton = document.getElementById('deleteProfile');

    if (localStorage.getItem("Brugernavn") !== null) {
        profileLink.style.display = "block";
        loginLink.style.display = "none";
        signupLink.style.display = "none";
        signoutLink.style.display = "block";

        // Fetch and display user data
        var name = localStorage.getItem("name");
        var height = localStorage.getItem("Height");
        var weight = localStorage.getItem("Weight");
        var age = localStorage.getItem("age");
        var sex = localStorage.getItem("Sex");

        if (name && height && weight && age && sex) {
            userDataDiv.style.display = "block";
            userName.textContent = name;
            userHeight.textContent = "Height: " + height + " cm";
            userWeight.textContent = "Weight: " + weight + " kg";
            userAge.textContent = "Age: " + age + " years";
            userSex.textContent = "Sex: " + sex;

            // Edit buttons functionality
            var editHeightBtn = document.getElementById("editHeight");
            var editWeightBtn = document.getElementById("editWeight");
            var editAgeBtn = document.getElementById("editAge");
            var editSexBtn = document.getElementById("editSex");

            editHeightBtn.addEventListener("click", function() {
                var newHeight = prompt("Enter new height (in cm):");
                if (newHeight !== null && !isNaN(newHeight)) {
                    saveDataToDatabase(newHeight, 'Height');
                    localStorage.setItem("Height", newHeight);
                    userHeight.textContent = "Height: " + newHeight + " cm";
                }
            });

            editWeightBtn.addEventListener("click", function() {
                var newWeight = prompt("Enter new weight (in kg):");
                if (newWeight !== null && !isNaN(newWeight)) {
                    saveDataToDatabase(newWeight, 'Weight');
                    localStorage.setItem("Weight", newWeight);
                    userWeight.textContent = "Weight: " + newWeight + " kg";
                }
            });

            editAgeBtn.addEventListener("click", function() {
                var newAge = prompt("Enter new age:");
                if (newAge !== null && !isNaN(newAge)) {
                    saveDataToDatabase(newAge, 'age');
                    localStorage.setItem("age", newAge);
                    userAge.textContent = "Age: " + newAge + " years";
                }
            });

            editSexBtn.addEventListener("click", function() {
                var newSex = prompt("Enter new sex:");
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

   




    const brugerNavn = localStorage.getItem('Brugernavn');
    // Add this function to your client-side JavaScript file
    function saveDataToDatabase(Data, Newdatatype) {
        
        

        const newData = Data;
        const datatype = Newdatatype;

        fetch('/save-Data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ brugerNavn, newData, datatype }), // Stringify the entire object containing mealsData and id
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
    deleteProfileButton.addEventListener('click', deleteProfileToDatabase(brugerNavn));
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
    
            Object.entries(responseData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
    
            console.log('Data fetched and saved to localStorage successfully.');
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    fetchUserData(brugerNavn);

    // Add this function to your client-side JavaScript file
    function deleteProfileToDatabase(brugerNavn) {
        
        fetch('/delete-meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({brugerNavn}), // Stringify the entire object containing mealsData and id
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save to the database');
            }
            return response.json();
        })
        .then(data => {
            console.log('saved to the database:', data);
        })
        .catch(error => {
            console.error('Error saving to the database:', error);
        });
        
    }

});


