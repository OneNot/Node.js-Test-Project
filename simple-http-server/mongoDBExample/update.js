const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = "mongodb://127.0.0.1:27017/mydb";

mongoClient.connect(mongoUrl, function(err, db){
    if(err)
        throw err;

    var dbo = db.db("mydb");
    console.log("DB: " + dbo.databaseName);

    dbo.collection("customers").updateMany({ name: "Peter" }, { $set: { address: "Fake Address 123" } }, function(err, res){
        if(err)
            throw err;

        console.log(res.result.nModified + " document(s) updated");
        db.close();
    });
});