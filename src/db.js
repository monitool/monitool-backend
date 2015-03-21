var MongoClient = require('mongodb').MongoClient;

var mongoIPAddress;
var mongoDBPort;
var mongoDBName;
module.exports =
        {
            /**
             * Simple test of server
             * @author Adrian Ka³uziñski
             * @date 2015-03-20
             * @param {text} mongoIPAddress - IP address of mongoDB
             * @param {number} mongoDBPort - port of mongoDB
             * @param {text} mongoDBName - name od mongoDB 
             * @returns {undefined}
             */
            startTestServer: function (mongoIPAddress, mongoDBPort, mongoDBName) {//
                if (typeof mongoIPAddress === undefined)
                    mongoIPAddress = "localhost";
                if (typeof mongoDBPort === undefined || mongoDBPort < 0 || mongoDBPort > 65536)
                    mongoDBPort = 27017;
                if (typeof mongoDBName === undefined)
                    mongoDBName = "monitooldb";

                console.log("START TEST SERVER");
                var dbLoc = "mongodb://" + mongoIPAddress + ":" + mongoDBPort + "/" + mongoDBName;
                client = MongoClient.connect(dbLoc, function (err, db) {
                    if (!err) {
                        console.log("Connected to " + dbLoc);

                        var collection = db.collection('test_collection');
                        var doc1 = {'test_key': 'test_val'};
                        collection.insert(doc1, function (insertError, result) {
                            if (insertError) {
                                return console.log("DATA INSERTION ERROR " + insertError);
                            }
                            console.log(result);
                            if( typeof result._id !== undefined)
                                console.log("INSERT TEST OK");
                            console.log("END TEST SERVER");
                             db.close();
                        });
                    } else {
                        return new Error("Cannot connect to database " + dbLoc);
                    }
                });
            },
            startServer: function (mongoIPAddress, mongoDBPort, mongoDBName) {
                if (typeof mongoIPAddress === undefined)
                    mongoIPAddress = "localhost";
                if (typeof mongoDBPort === undefined || mongoDBPort < 0 || mongoDBPort > 65536)
                    mongoDBPort = 27017;
                if (typeof mongoDBName === undefined)
                    mongoDBName = "monitooldb";
                
                
//                var db = require('mongodb').Db;    
//                db = new Db(mongoDBName, new Server(mongoIPAddress, mongoDBPort));
                   // console.log(client);

            }
        };
