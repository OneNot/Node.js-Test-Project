const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = "mongodb://127.0.0.1:27017/mydb";

mongoClient.connect(mongoUrl, function(err, db){
    if(err)
        throw err;

    var dbo = db.db("mydb");
    console.log("DB: " + dbo.databaseName);
    dbo.collection("products").drop(function(err, delOK){
        if(err)
            throw err;

        if(delOK)
            console.log("Collection dropped");

        db.close();
    });
});