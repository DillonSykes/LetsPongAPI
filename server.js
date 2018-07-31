const serverless = require('serverless-http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const config = require('./config');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// connection configurations
const mc = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});

// //port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});
// Retrieve all users
app.get('/user/all', function (req, res) {
    mc.query('SELECT * FROM `Users`', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'User list.' });
    });
});
// Retrieve all users
app.get('/matches/all', function (req, res) {
    mc.query('SELECT * FROM `Matches`', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Match list.' });
    });
});
// Retrieve matches with id
app.get('/matches/:id', function (req, res) {

    let match_id = req.params.id;

    if (!match_id) {
        return res.status(400).send({ error: true, message: 'Please provide match_id' });
    }

    mc.query('SELECT * FROM `Match` where MatchID=?', match_id, function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results[0], message: 'Match Results.' });
    });

});
//get results for a specific user
app.get('/results/:id',function (req, res) {
    let UID= req.params.id;

    if (!UID) {
        return res.status(400).send({ error: true, message: 'Please provide UID' });
    }
   mc.query('SELECT * FROM `Results` where UID=?', UID , function (error, results, fields) {
       if(error) throw error;
       return res.send({error: false, data: results, message: 'List of users match results.'})
   } )
});
// Search for users
app.get('/user/search/:keyword', function (req, res) {
    let keyword = req.params.keyword;
    mc.query("SELECT * FROM `Users` WHERE `Username` LIKE ? ", ['%' + keyword + '%'], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Username search list.' });
    });
});
// Add a new user
app.post('/user/add', function (req, res) {

    let Username = req.body.Username;
    let UID = req.body.UID;

    if (!Username) {
        return res.status(400).send({ error:true, message: 'Username is null' });
    }
    if (!UID) {
        return res.status(400).send({ error:true, message: 'UID is null' });
    }

    mc.query("INSERT INTO `Users` SET ? ", {Username: Username, UID: UID }, function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'New user has been added successfully.' });
    });
});

module.exports.handler = serverless(app);

