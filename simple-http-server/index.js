const http = require('http');
const port = 3000;
const hostname = "localhost";

const server = http.createServer((req, res) =>{
    console.log(req.headers);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(`
        <html>
            <head>
                <title>Hello World!</title>
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>
    `);
    //res.end("<html><head><title>Test</title></head><body>Test</body></html>");
});

server.listen(port, hostname, () => {console.log("Server started")});