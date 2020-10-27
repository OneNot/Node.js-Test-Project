const mongoose = require('mongoose');
const Messages = require("./models/messages");

const url = "mongodb://127.0.0.1:27017/messagedb";

const options = {
    useNewUrlparser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false,
    poolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

var connect = mongoose.connect(url, options);
connect.then(function(db){
    console.log("Connected to server!");

    // var newMessage = Messages({
    //     title: "I cannot code!",
    //     content: "Please help!",
    //     author: "N00B"
    // });

    // var newMessage2 = Messages({
    //     title: "My code is broken - please help!",
    //     content: "Please help!!!!!!",
    //     author: "N00B2"
    // });

    // var newMessage3 = Messages({
    //     title: "I quit!",
    //     content: "This coding stuff is too much for me. I quit!",
    //     author: "Student1337"
    // });

    Messages.insertMany([{
        title: "I cannot code!",
        content: "Please help!",
        author: "N00B"
    },
    {
        title: "My code is broken - please help!",
        content: "Please help!!!!!!",
        author: "N00B2"
    },
    {
        title: "I quit!",
        content: "This coding stuff is too much for me. I quit!",
        author: "Student1337"
    }])
    .then(function(message){
        console.log("Added:\n", message);
        return Messages.updateOne({title: "I quit!"},
        {
            $push: {
                comments: Comment({ content: "Good riddance dude", author: "ProgrammerElitist1337", rating: 0 })
            }
        }).exec();
    })
    .then(function(messages){
        console.log("Inserted?:\n", messages);
        return Messages.find({}).exec();
    })
    .then(function(messages){
        console.log("All:\n", messages);
        return mongoose.connection.close();
    })
    .catch(function(err){
        console.log(err);
    });
});