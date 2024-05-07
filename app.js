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

// Serve HTML files from the 'static/html' directory
app.use(express.static(path.join(__dirname, 'static')));

//app.use('/static/html', express.static(path.join(__dirname, 'static/html')));

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
        console.log('Received request to fetch data for username:', username);

        // Connect to the database
        await sql.connect(config);

        // Query to select data for the specific user
        const result = await sql.query`SELECT * FROM Brugere WHERE Brugernavn = ${username}`;

        // Check if the user exists
        if (result.recordset.length === 0) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        // Send the fetched data to the client
        res.json(result.recordset[0]);

        console.log('Data sent to the client successfully.');

        // Close the connection
        await sql.close();
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to handle user creation
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

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
            INSERT INTO Brugere (id, Brugernavn, Password)
            VALUES ('${userId}', '${username}', '${password}')
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
            UPDATE Brugere
            SET createdMeals = '${meals}'
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

        res.json({ success: true, message: 'Meals saved to the database' });
    } catch (error) {
        console.error('Error saving meals to the database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// Function to fetch data from SQL Server and save in localStorage
async function fetchDataAndSaveToLocalStorage(brugernavn) {
    try {
      // Connect to the database
      await sql.connect(config);
  
      // Query to select all values from the Brugere table based on the primary key Brugernavn
      const result = await sql.query`SELECT * FROM Brugere`;
      const primaryKey = brugernavn;
      // Loop through the result and save values in localStorage
      result.recordset.forEach(row => {
        // Assuming Brugernavn is the primary key
       
        // Save other values in localStorage with unique keys
        localStorage.setItem(`${primaryKey}_id`, row.id);
        localStorage.setItem(`${primaryKey}_Brugernavn`, row.Brugernavn);
        localStorage.setItem(`${primaryKey}_Password`, row.Password);
        localStorage.setItem(`${primaryKey}_name`, row.name);
        localStorage.setItem(`${primaryKey}_Weight`, row.Weight);
        localStorage.setItem(`${primaryKey}_Height`, row.Height);
        localStorage.setItem(`${primaryKey}_createdMeals`, row.createdMeals);
        localStorage.setItem(`${primaryKey}_trackedMeals`, row.trackedMeals);
        // Add more columns as needed
      });
  
      console.log('Data saved to localStorage successfully.');
  
      // Close the connection
      await sql.close();
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
