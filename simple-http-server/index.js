const http = require('http');
const port = 3000;
const hostname = 'localhost';

const express = require('express');

// Creates an express app
const app = express();

// Remember to create public-directory and put eg. index.html & about.html there
app.use(express.static(__dirname+'/public'));

app.use((req, res, next) => {
    res.statusCode = 200;
    res.setHeader( 'Content-type', 'text/html');
    res.end('<html><head><title>Express Server</title></head><body><p>Error jotain</p></body></html>');
})

// app.get('/', function(req, res){
//     res.send('Hello world!');
// })

const server = http.createServer(app);
server.listen(port, hostname, () => {console.log(`Server started. Running at http://${hostname}:${port}`)});