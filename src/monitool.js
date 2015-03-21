/* START************** Includes Block *******************************/
var http = require('http');
/* END ************** Includes Block *******************************/

/* START************** Config Block *******************************/

var httpServerPort = 1337;
var httpServerIPAddress = '127.0.0.1';


var mongoIPAddress = "localhost";
var mongoDBPort = "27017";
var mongoDBName = "monitooldb";

/* END ************** Config Block *******************************/


/**
 * Creation of http server 
 */
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Default http response\n');
}).listen(httpServerPort, httpServerIPAddress);
console.log('HTTP Server running at http://'+httpServerIPAddress+':'+httpServerPort+'/');


var dbClient = require('./db.js');
//dbClient.startTestServer(mongoIPAddress, mongoDBPort, mongoDBName);
//dbClient.startServer(mongoIPAddress, mongoDBPort, mongoDBName);