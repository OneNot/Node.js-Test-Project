const http = require('http');
const fs = require("fs");
const path = require('path');
const { runInNewContext } = require('vm');

const port = 3000;
const hostname = "localhost";

const server = http.createServer(function(req, res) {
    console.log(req.headers);
    console.log("requested: " + req.url);

    //If request method isn't GET...
    if(req.method != "GET")
    {
        SendErrorPage(res, "405");
    }
    else
    {
        //root url redirect to /index
        if(req.url == "/")
            req.url = "/index";

        //build filepath
        let filePath = "./public" + req.url;

        //get extension
        let extension = path.extname(filePath);

        //no extension -> .html
        if(extension == "")
        {
            filePath += ".html";
            extension = ".html";
        }

        //if any other extension besides html...
        if(extension != ".html")
        {
            SendErrorPage(res, "404");
        }
        else //extension is html
        {
            //try to read file given in url
            fs.readFile(filePath, function(err, data) {
                if(err) //if reading fails
                {
                    SendErrorPage(res, "404");
                }
                else //Successfully read the requested page
                {
                    //send it
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/html");
                    res.end(data);
                }
            });
        }
    }
});

server.listen(port, hostname, () => {console.log("Server started")});

function SendErrorPage(responseObject, pageToShow)
{
    if(pageToShow == "404")
    {
        responseObject.statusCode = 404;
        fs.readFile("./public/404.html", function(err, data){
            //if 404 page not found, send it in plain text
            if(err)
            {
                responseObject.setHeader("Content-Type", "text/plain");
                responseObject.end("ERROR 404: Page Not Found");
            }
            else //send the 404 html page
            {
                responseObject.setHeader("Content-Type", "text/html");
                responseObject.end(data);
            }
        });
    }
    else if(pageToShow == "405")
    {
        responseObject.statusCode = 405;
        responseObject.setHeader("Content-Type", "text/plain");
        responseObject.end("ERROR 405: Method Not Allowed");
    }
    else
    {
        responseObject.statusCode = 418;
        responseObject.setHeader("Content-Type", "text/plain");
        responseObject.end("ERROR 418: I'm a Teapot"); //that's a real http response :D
    }
}