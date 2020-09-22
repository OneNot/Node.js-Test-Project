//requires
const http = require('http');
const express = require('express');
const morgan = require('morgan'); //logger module
const bodyParser = require('body-parser');

const port = 3000;
const hostname = 'localhost';

const app = express(); // Creates an express app

app.use(morgan("dev"));
app.use(bodyParser.json());




// app.all("/", function(req, res){
//     res.statusCode = 200;
//     res.setHeader("Content-Type", "text/html");
//     res.end("<html><head><title>Express Router</title></head><body><h1>My Express Router</h1></body></html>");
// });

// app.use(express.static(__dirname+'/public'));

// app.use((req, res, next) => {
//     res.statusCode = 404;
//     res.setHeader( 'Content-type', 'text/html');
//     res.end('<html><head><title>Express Server</title></head><body><p>Error jotain</p></body></html>');
// })

// app.get('/', function(req, res){
//     res.send('Hello world!');
// })

const server = http.createServer(app);
server.listen(port, hostname, () => {console.log(`Server started. Running at http://${hostname}:${port}`)});