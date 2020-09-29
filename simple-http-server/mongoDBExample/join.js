const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = "mongodb://127.0.0.1:27017/mydb";

mongoClient.connect(mongoUrl, function(err, db){
    if(err)
        throw err;

    var dbo = db.db("mydb");
    console.log("DB: " + dbo.databaseName);

    dbo.collection("orders").aggregate([
        {
            $lookup:
            {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "orderedProduct"
            }
        }
    ]).toArray(function(err, res){
        if(err)
            throw err;

        console.log(JSON.stringify(res, null, 4));
        db.close();
    });
});