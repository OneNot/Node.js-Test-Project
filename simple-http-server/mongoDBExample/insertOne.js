const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = "mongodb://127.0.0.1:27017/mydb";

mongoClient.connect(mongoUrl, function(err, db){
    if(err)
        throw err;

    var dbo = db.db("mydb");
    console.log("DB: " + dbo.databaseName);

    dbo.collection("customers").insertOne({ name: "Charizard", address: "Fake Street 124" }, function(err, res){
        if(err)
            throw err;

        console.log("1 document inserted");
        db.close();
    });
});