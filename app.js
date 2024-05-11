const express = require('express');
const path = require('path');
const logger = require('morgan');
const fs = require('fs');
const app = express();
const sql = require('mssql');
const PORT = 3000;

// Log requests
app.use(logger('dev'));
app.use(express.json());

/*
// Handle requests for HTML files with or without query parameters
app.get('/foodInspector.html', function(req, res) {
    const foodID = req.query.foodID;
    if (foodID) {
        // Redirect to the same route without the query parameter
        res.redirect('/static/html/foodInspector.html');
    } else {
        // Serve the HTML file without the query parameter
        const filePath = path.join(__dirname, 'static/html/foodInspector.html');
        res.sendFile(filePath);
    }
});
*/

// Bruge HTML filer fra 'static/html'
app.use(express.static(path.join(__dirname, 'static')));

//Sørger for du bliver redirected til login siden først!
app.get('/', (req, res) => {
    res.redirect('http://localhost:3000/static/html/login.html');
});

// Handle requests for files within the 'static' directory
app.get('/static/*', function(req, res) {
    res.sendFile(path.join(__dirname, req.url));
});



// Endpoint to handle login requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Received login request for username:', username);

        // Connect to the database
        await sql.connect(config);
        console.log('Connected to the database');

        // Check if the username and password are correct
        const checkUserQuery = `SELECT * FROM Brugere WHERE Brugernavn = '${username}' AND Password = '${password}'`;
        const user = await sql.query(checkUserQuery);
        console.log('Query executed:', checkUserQuery);

        if (user.recordset.length > 0) {
            console.log('Login successful');
            res.send('Login successful!');
        } else {
            console.log('Invalid username or password');
            res.status(401).send('Invalid username or password');
        }

        // Close the connection
        await sql.close();
        console.log('Database connection closed');
    } catch (err) {
        // Handle errors
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/fetch-data', async (req, res) => {
    const { username } = req.body;
    try {
        // Etabler forbindelse til databasen
        await sql.connect(config);
        // Foretag forespørgsel til databasen
        const result = await sql.query`
        SELECT * FROM Brugere WHERE Brugernavn = ${username}

        SELECT * FROM Activities WHERE Brugernavn = ${username}

        SELECT * FROM CreatedMeals WHERE Brugernavn = ${username}

        SELECT * FROM TrackedMeals WHERE Brugernavn = ${username}
        
        SELECT * FROM TrackedWater WHERE Brugernavn = ${username}
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


// Endpoint to handle user creation
app.post('/signup', async (req, res) => {
    const { username, password, name, weight, height, age, sex } = req.body;

    try {
        console.log('Received signup request for username:', username);

        // Connect to the database
        await sql.connect(config);
        console.log('Connected to the database');

        // Check if the username already exists
        const checkUserQuery = `SELECT * FROM Brugere WHERE Brugernavn = '${username}'`;
        const existingUser = await sql.query(checkUserQuery);
        console.log('Query executed:', checkUserQuery);

        if (existingUser.recordset.length > 0) {
            console.log('Username already exists');
            return res.status(400).send('Username already exists');
        }

        // Generate unique ID
        const userId = Math.floor(Math.random() * 1000000); // Example of generating a random 6-digit number
        console.log('Generated user ID:', userId);

        // Insert new user into the Brugere table with the unique ID
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
        await sql.query(insertUserQuery);
        console.log('User inserted into the Brugere table');

        // Close the connection
        await sql.close();
        console.log('Database connection closed');

        res.send('User created successfully!');
    } catch (err) {
        // Handle errors
        console.error('Error creating user:', err);
        res.status(500).send('Internal Server Error');
    }
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



// Server-side code (Node.js environment)


// Configuration for your Azure SQL Database
const config = {
    user: 'martin',
    password: 'NutriTracker!23',
    server: 'eksamenserver.database.windows.net',
    database: 'nutrieksamen',
    options: {
        encrypt: true, // Use encryption
        trustServerCertificate: false // Change to true for local development
    }
};


// Add this endpoint to your server-side JavaScript file
app.post('/save-meals', async (req, res) => {
    const { meals, brugerNavn } = req.body;
    
    try {
        // Connect to the database
        await sql.connect(config);

        // Update meals in the database
        const updateMealQuery = `
            UPDATE CreatedMeals
            SET createdMeals = '${meals}'
            WHERE Brugernavn = '${brugerNavn}';
        `;

        await sql.query(updateMealQuery, {
            meals: meals, // Convert meals array to JSON string
            brugerNavn: brugerNavn
        });

        // Close the connection
        await sql.close();

        res.json({ success: true, message: 'Meals saved to the database' });
    } catch (error) {
        console.error('Error saving meals to the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/track-meals', async (req, res) => {
    const { meals, brugerNavn } = req.body;
    
    try {
        // Connect to the database
        await sql.connect(config);

        // Update meals in the database
        const updateMealQuery = `
            UPDATE TrackedMeals
            SET trackedMeals = '${meals}'
            WHERE Brugernavn = '${brugerNavn}';
        `;

        // Convert meals array to JSON string
       // const mealsJson = JSON.stringify(meals);

        await sql.query(updateMealQuery, {
            meals: meals, // Convert meals array to JSON string
            brugerNavn: brugerNavn
        });

        // Close the connection
        await sql.close();

        res.json({ success: true, message: 'TrackedMeal saved to the database' });
    } catch (error) {
        console.error('Error saving Trackedmeal to the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

//kopi af TrackedMeals til vand
app.post('/track-water', async (req, res) => {
    const { water, brugerNavn } = req.body;
    
    try {
        // Connect to the database
        await sql.connect(config);

        // Update meals in the database
        const updateMealQuery = `
            UPDATE TrackedWater
            SET trackedWater = '${water}'
            WHERE Brugernavn = '${brugerNavn}';
        `;

        await sql.query(updateMealQuery, {
            water: water, // Convert meals array to JSON string
            brugerNavn: brugerNavn
        });

        // Close the connection
        await sql.close();

        res.json({ success: true, message: 'Trackedwater saved to the database' });
    } catch (error) {
        console.error('Error saving Trackedwater to the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/save-Data', async (req, res) => {
    const { newData, brugerNavn, datatype} = req.body;
    console.log('Received datatype:', datatype);
    
    try {
        // Connect to the database
        await sql.connect(config);
        let updateDataQuery;

       
        // Check the datatype and construct the query accordingly
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

        // Execute the constructed query
        await sql.query(updateDataQuery, {
            newData: newData,
            brugerNavn: brugerNavn,
        });

        // Close the connection
        await sql.close();

        res.json({ success: true, message: 'Data saved to the database' });
    } catch (error) {
        console.error('Error saving data to the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


app.post('/delete-profile', async (req, res) => {
    const { brugerNavn } = req.body;
    
    try {
        // Connect to the database
        await sql.connect(config);

        // Delete meals in the database
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

        // Close the connection
        await sql.close();

        res.json({ success: true, message: 'Meals deleted from the database' });
    } catch (error) {
        console.error('Error deleting meals from the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
