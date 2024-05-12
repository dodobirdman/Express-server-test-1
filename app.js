const express = require('express');
const path = require('path');
const logger = require('morgan');
const fs = require('fs');
const app = express();
const sql = require('mssql');
const PORT = 3000;

module.exports = app;

// Log requests
app.use(logger('dev'));
app.use(express.json());

// Bruge HTML filer fra 'static/html'
app.use(express.static(path.join(__dirname, 'static')));

// Sørger for du bliver redirected til login siden først
app.get('/', (req, res) => {
    res.redirect('http://localhost:3000/static/html/login.html');
});

// Håndterer requests for filer (websiderne) der ligger i /static/ folderen
app.get('/static/*', function (req, res) {
    res.sendFile(path.join(__dirname, req.url));
});



// Endpoint der håndterer login-requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Received login request for username:', username);

        // Bruger sql.connect til at forbinde til databasen
        await sql.connect(config);
        console.log('Connected to the database');

        // Tjekker i databasen om brugeren eksisterer og hvis koden er korrekt
        const checkUserQuery = `SELECT * FROM Brugere WHERE Brugernavn = '${username}' AND Password = '${password}'`;
        const user = await sql.query(checkUserQuery);
        console.log('Query executed:', checkUserQuery);
        // Svarer klienten om hvis login er succesfuldt eller ej
        if (user.recordset.length > 0) {
            console.log('Login successful');
            res.send('Login successful!');
        } else {
            console.log('Invalid username or password');
            res.status(401).send('Invalid username or password');
        }

        // Lukker forbindelsen
        await sql.close();
        console.log('Database connection closed');
    } catch (err) {
        // Fejlhåndtering
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/fetch-data', async (req, res) => {
    const { username } = req.body;
    try {
        // Etabler forbindelse til databasen
        await sql.connect(config);
        // Bruger await til at vente på svar fra databasen

        const result = await sql.query`

    SELECT 
    Brugere.*,
    Activities.activity,
    Activities.BMR,
    CreatedMeals.createdMeals,
    TrackedMeals.trackedMeals,
    TrackedWater.trackedWater
    FROM Brugere
    LEFT JOIN Activities ON Brugere.Brugernavn = Activities.Brugernavn
    LEFT JOIN CreatedMeals ON Brugere.Brugernavn = CreatedMeals.Brugernavn
    LEFT JOIN TrackedMeals ON Brugere.Brugernavn = TrackedMeals.Brugernavn
    LEFT JOIN TrackedWater ON Brugere.Brugernavn = TrackedWater.Brugernavn
    WHERE Brugere.Brugernavn = ${username};

        `;



        // Tjek hvis brugeren ikke findes
        if (result.recordset.length === 0) {
            return res.status(404).send('User not found');
        }

        // Send data til klienten
        res.json(result.recordset[0]);

        // Luk forbindelsen til databasen
        await sql.close();
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint der håndterer signup-requests
app.post('/signup', async (req, res) => {
    // laver variabel til at gemme data fra request body
    const { username, password, name, weight, height, age, sex } = req.body;
    // try catch block til at håndtere fejl
    try {
        // console log til bug fixing samt tracking af brugere
        console.log('Received signup request for username:', username);

        // Etabler forbindelse
        await sql.connect(config);
        console.log('Connected to the database');

        // Tjekker hvis brugeren allerede eksisterer
        const checkUserQuery = `SELECT * FROM Brugere WHERE Brugernavn = '${username}'`;
        const existingUser = await sql.query(checkUserQuery);
        console.log('Query executed:', checkUserQuery);

        // Svarer med fejlbesked til klienten hvis brugeren findes allerede i databasen
        if (existingUser.recordset.length > 0) {
            console.log('Username already exists');
            return res.status(400).send('Username already exists');
        }

        // Laver et unik id til hver bruger
        const userId = Math.floor(Math.random() * 1000000);


        // Sætter brugeredataen ind i databasen
        const insertUserQuery = `
            INSERT INTO Brugere (id, Brugernavn, Password, name, Weight, Height, age, Sex)
            VALUES ('${userId}', '${username}', '${password}', '${name}', '${weight}', '${height}', '${age}', '${sex}')

            INSERT INTO CreatedMeals (Brugernavn)
            VALUES ('${username}')

            INSERT INTO TrackedMeals (Brugernavn)
            VALUES ('${username}')

            INSERT INTO TrackedWater (Brugernavn)
            VALUES ('${username}')

            INSERT INTO Activities (Brugernavn)
            VALUES ('${username}')

        `;
        // await venter på svar fra databasen
        await sql.query(insertUserQuery);

        // Lukker forbindelsen
        await sql.close();

        // Sender HTTP success response til klienten
        res.send('User created successfully!');
    } catch (err) {
        // Fejlhåndtering
        console.error('Error creating user:', err);
        res.status(500).send('Internal Server Error');
    }
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});





// Authentification-info til serverens SQL database ind i Azure
const config = {
    user: 'martin',
    password: 'NutriTracker!23',
    server: 'eksamenserver.database.windows.net',
    database: 'nutrieksamen',
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};


// API til at gemme måltider i databasen
app.post('/save-meals', async (req, res) => {
    const { meals, brugerNavn } = req.body;

    try {
        // Forbinder til databasen
        await sql.connect(config);

        // Laver variabel til at bruge som SQL query til databasen, med brugerens info
        const updateMealQuery = `
            UPDATE CreatedMeals
            SET createdMeals = '${meals}'
            WHERE Brugernavn = '${brugerNavn}';
        `;

        await sql.query(updateMealQuery, {
            meals: meals, // Konverterer måltiderne til JSON string
            brugerNavn: brugerNavn
        });

        // Lukker forbindelse
        await sql.close();
        // Success response til klienten samt fejlhåndtering
        res.json({ success: true, message: 'Meals saved to the database' });
    } catch (error) {
        console.error('Error saving meals to the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// API til at gemme trackedMeals i databasen
app.post('/track-meals', async (req, res) => {
    const { meals, brugerNavn } = req.body;

    try {
        // Forbinder til databasen
        await sql.connect(config);

        // Opdaterer måltiderne i databasen med brugerens info
        const updateMealQuery = `
            UPDATE TrackedMeals
            SET trackedMeals = '${meals}'
            WHERE Brugernavn = '${brugerNavn}';
        `;

        await sql.query(updateMealQuery, {
            meals: meals, 
            brugerNavn: brugerNavn
        });

        // Lukker forbindelsen
        await sql.close();
        // Success response til klienten samt fejlhåndtering
        res.json({ success: true, message: 'TrackedMeal saved to the database' });
    } catch (error) {
        console.error('Error saving Trackedmeal to the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Gemmer vand info til databasen, med den samme metode some /track-meals
app.post('/track-water', async (req, res) => {
    const { water, brugerNavn } = req.body;

    try {
        // Etabler forbindelse til databasen
        await sql.connect(config);

        // Opdaterer vandmængden i databasen med brugerens info
        const updateMealQuery = `
            UPDATE TrackedWater
            SET trackedWater = '${water}'
            WHERE Brugernavn = '${brugerNavn}';
        `;

        await sql.query(updateMealQuery, {
            water: water, 
            brugerNavn: brugerNavn
        });

        // Lukker forbindelsen
        await sql.close();
        // success response til klienten samt fejlhåndtering
        res.json({ success: true, message: 'Trackedwater saved to the database' });
    } catch (error) {
        console.error('Error saving Trackedwater to the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// API til at gemme brugerens profildata i databasen
app.post('/save-Data', async (req, res) => {
    // Serveren modtager data med dataen, den gældende bruger, og datatypen
    const { newData, brugerNavn, datatype } = req.body;

    try {
        // Etabælerer forbindelse
        await sql.connect(config);
        // Laver en variabel til at bruge som SQL query til databasen, med brugerens info
        let updateDataQuery;

        // Koden if og else-if til at tjekke hvilken type data er blevet sendt af klienten, og opdaterer databasen med den givne data
        if (datatype === 'Sex') {
            updateDataQuery = `
                UPDATE Brugere
                SET Sex = '${newData}'
                WHERE Brugernavn = '${brugerNavn}';
            `;
        } else if (datatype === 'age') {
            updateDataQuery = `
                UPDATE Brugere
                SET age = '${newData}'
                WHERE Brugernavn = '${brugerNavn}';
            `;
        } else if (datatype === 'BMR') {
            updateDataQuery = `
                UPDATE Activities
                SET BMR = '${newData}'
                WHERE Brugernavn = '${brugerNavn}';
            `;
        } else if (datatype === 'trackedActivity') {
            updateDataQuery = `
                UPDATE Activities
                SET activity = '${newData}'
                WHERE Brugernavn = '${brugerNavn}';
            `;
        } else if (datatype === 'Weight') {
            updateDataQuery = `
                UPDATE Brugere
                SET Weight = '${newData}'
                WHERE Brugernavn = '${brugerNavn}';
            `;
        } else if (datatype === 'Height') {
            updateDataQuery = `
                UPDATE Brugere
                SET Height = '${newData}'
                WHERE Brugernavn = '${brugerNavn}';
            `;
        } else {
            throw new Error('Invalid datatype');
        }

        // Bruger den givne query til at opdatere databasen
        await sql.query(updateDataQuery, {
            newData: newData,
            brugerNavn: brugerNavn,
        });

        // Lukker forbindelsen
        await sql.close();

        // success response til klienten samt fejlhåndtering
        res.json({ success: true, message: 'Data saved to the database' });
    } catch (error) {
        console.error('Error saving data to the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Api til at slette en brugerprofil, der tager brugernavn som parameter
app.post('/delete-profile', async (req, res) => {
    const { brugerNavn } = req.body;
    // Tager brugernavn som parameter
    try {
        // Etablerer forbindelse til databasen
        await sql.connect(config);

        // Laver en variabel til at bruge som SQL query til databasen, med brugernavnet og alle tabeller med data der skal slettes
        const deleteMealQuery = `
        DELETE FROM Brugere
        WHERE Brugernavn = '${brugerNavn}';
        
        DELETE FROM Activities
        WHERE Brugernavn = '${brugerNavn}';

        DELETE FROM CreatedMeals
        WHERE Brugernavn = '${brugerNavn}';

        DELETE FROM TrackedMeals
        WHERE Brugernavn = '${brugerNavn}';

        DELETE FROM TrackedWater
        WHERE Brugernavn = '${brugerNavn}';
        `;

        await sql.query(deleteMealQuery, {
            brugerNavn: brugerNavn
        });

        // Lukker forbindelsen
        await sql.close();

        // success response til klienten samt fejlhåndtering
        res.json({ success: true, message: 'Meals deleted from the database' });
    } catch (error) {
        console.error('Error deleting meals from the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
