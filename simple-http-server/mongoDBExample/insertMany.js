const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = "mongodb://127.0.0.1:27017/mydb";

mongoClient.connect(mongoUrl, function(err, db){
    if(err)
        throw err;

    var dbo = db.db("mydb");
    console.log("DB: " + dbo.databaseName);

    var myobj = [
        { _id: 1, name: 'cookies' },
        { _id: 2, name: 'carrots' },
        { _id: 3, name: 'fish' },
        { _id: 4, name: 'candy' }
    ];

    dbo.collection("products").insertMany(myobj, function(err, res){
        if(err)
            throw err;

        console.log("inserted " + res.insertedCount + " documents");
        db.close();
    });
});