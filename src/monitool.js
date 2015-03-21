

/**
 * @author Adrian Kaluzinski
 * @date 2015-03-21
 * How to run monitool-backend:
 * 
 * 1. Install Node.js
 * 2. Install mongoDB
 * 3. Download necessary packages:
   npm install mongodb
   npm install express 
   4. Run application: 
     node monitool.js

 */

var express = require('express'); //Express framework
var mongodb = require('mongodb'); // mongoDB
var app = express();

var MONGODB_URI = 'mongodb://localhost';
var applicationPort = 3000;
var db;
var coll;
var dbUtil;

mongodb.MongoClient.connect(MONGODB_URI, {}, function (err, database) {
    if (err) {
        throw err;
    }

    db = database;
    coll = db.collection('logs');  //set collection from database
    dbUtil = require('./mongoutils'); //include package with database utils
    app.listen(applicationPort); //start listening on given port
    console.log('Listening on port ' + applicationPort);
});

//simple example of using

app.get('/randoms', function (req, res) {
    dbUtil.showAllDataFromCollection(coll, req, res);
});

//app.put('/random', function (req, res) {
//  dbUtil.insertRandom(coll, req, res);
//});

//app.delete('/random', function (req, res) {
//
//});

app.get('/random', function (req, res) {
    dbUtil.insertRandom(coll, req, res);
});

app.get('/cleaner', function (req, res) {
    dbUtil.cleanDatabase(coll, req, res);
});

