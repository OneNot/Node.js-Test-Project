// this is my simple http express-server

const http = require('http');
const port = 3000;
const hostname = 'localhost';


const express = require('express');


// Creates an express app
const app = express();


app.get('/', function(req, res){
    res.send('Hello World!');
});


const server = http.createServer(app);
server.listen(port, hostname, () => { console.log(`Server started! Running at http://${hostname}:${port}`)});