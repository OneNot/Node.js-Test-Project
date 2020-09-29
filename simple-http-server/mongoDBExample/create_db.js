const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = "mongodb://127.0.0.1:27017/mydb";

mongoClient.connect(mongoUrl, function(err, db){
    if(err)
        throw err;

    console.log("Database created!");
    db.close();
});