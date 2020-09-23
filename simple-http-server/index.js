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


// This matches all http-requests to /
app.all('/messages', (req, res, next) => {
    res.statusCode = 200;  //OK
    res.setHeader('Content-Type', 'text/html');
    //res.end('<html><head><title>Express Router</title></head><body><h1>My Express Router</h1></body></html>');
    next();
})


//#region messages page without ID ->
// GET request handling to /messages
app.get('/messages', (req, res, next) => {
    res.end('<html><head><title>Message Board</title></head><body><h1>List of Messages</h1><p>The list should be here...</p></body></html>')
});

// POST request handling to /messages
app.post('/messages', (req, res, next) => {
    res.end('<html><head><title>Message Board</title></head><body><h3>Adding message:</h3><p>Message content:<br/>Title:' 
    + req.body.messagetitle + '<br />Content:' + req.body.messagecontent +'</p></body></html>');

});

app.put("/messages", function(req, res){
    res.end(`
        <html>
            <head>
                <title>Message Board</title>
            </head>
            <body>
                <h2>Updating message</h2>
                <br>
                <h3>Updated Message Content:</h3>
                <b>`+req.body.messagetitle+`</b>
                <br>
                <i>`+req.body.messagecontent+`</i>
            </body>
        </html>
    `);
});

app.delete("/messages", function(req, res){
    res.end(`
        <html>
            <head>
                <title>Message Board</title>
            </head>
            <body>
                <h2>All Messages Deleted!</h2>
            </body>
        </html>
    `);
});
//#endregion


//#region messages page with ID ->
//Show message
app.get("/messages/:msgId", function(req, res){
    res.end(`
        <html>
            <head>
                <title>Message Board</title>
            </head>
            <body>
                <h2>Showing message with ID: `+req.params.msgId+`</h2>
                <br>
                <h3>Message Content:</h3>
                <b>`+req.body.messagetitle+`</b>
                <br>
                <i>`+req.body.messagecontent+`</i>
            </body>
        </html>
    `); //of course, messagetitle & messagecontent wouldn't actually be sent with the request, but rather queried from the database with the given ID
});

//Add message
app.post("/messages/:msgId", function(req, res){
    res.end(`
        <html>
            <head>
                <title>Message Board</title>
            </head>
            <body>
                <h2>Adding message with ID: `+req.params.msgId+`</h2>
                <br>
                <h3>Message Content:</h3>
                <b>`+req.body.messagetitle+`</b>
                <br>
                <i>`+req.body.messagecontent+`</i>
            </body>
        </html>
    `);
});

//Update message
app.put("/messages/:msgId", function(req, res){
    res.end(`
        <html>
            <head>
                <title>Message Board</title>
            </head>
            <body>
                <h2>Updating message with ID: `+req.params.msgId+`</h2>
                <br>
                <h3>Updated Message Content:</h3>
                <b>`+req.body.messagetitle+`</b>
                <br>
                <i>`+req.body.messagecontent+`</i>
            </body>
        </html>
    `);
});

//Delete message
app.delete("/messages/:msgId", function(req, res){
    res.end(`
        <html>
            <head>
                <title>Message Board</title>
            </head>
            <body>
                <h2>Deleting message with ID: `+req.params.msgId+`</h2>
                <br>
                <h3>Deleted Message Content:</h3>
                <b>`+req.body.messagetitle+`</b>
                <br>
                <i>`+req.body.messagecontent+`</i>
            </body>
        </html>
    `);
});

//#endregion


const server = http.createServer(app);
server.listen(port, hostname, () => {console.log(`Server started. Running at http://${hostname}:${port}`)});