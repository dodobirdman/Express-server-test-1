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
app.use('/static/html', express.static(path.join(__dirname, 'static/html')));

// Handle requests for files within the 'static' directory
app.get('/static/*', function(req, res) {
    res.sendFile(path.join(__dirname, req.url));
});

// Endpoint to handle login requests
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        const users = JSON.parse(data);
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            res.send('Login successful!');
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});

// Endpoint to handle user creation
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        const users = JSON.parse(data);
        const existingUser = users.find(user => user.username === username);

        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        users.push({ username, password });
        fs.writeFile('users.json', JSON.stringify(users), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            res.send('User created successfully!');
        });
    });
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

async function fetchData() {
    try {
        // Connect to the database
        await sql.connect(config);

        // Fetch data from the table
        const result = await sql.query`SELECT Meals FROM Test3`;

        // Close the connection
        await sql.close();

        return result.recordset; // Return the fetched data

    } catch (err) {
        // Handle errors
        console.error('Error:', err);
        throw err; // Re-throw the error to be caught where fetchData is called
    }
}

app.get('/meals', async (req, res) => {
    try {
        const createdMeals = await fetchData(); // Fetch meals data
        res.json(createdMeals); // Send the fetched data as JSON response
    } catch (err) {
        // Handle errors
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = { fetchData };
