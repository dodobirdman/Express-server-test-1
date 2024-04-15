var express = require('express');
var path = require('path');
var logger = require('morgan');
var app = express();

// Log requests
app.use(logger('dev'));

// Serve HTML files from the 'static/html' directory
app.use('/static/html', express.static(path.join(__dirname, 'static/html')));

// Handle requests for files within the 'static' directory
app.get('/static/*', function(req, res) {
    res.sendFile(path.join(__dirname, req.url));
});

app.listen(3000);
console.log('Listening on port 3000');