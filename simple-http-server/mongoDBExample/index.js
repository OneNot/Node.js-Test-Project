const mongodb = require('mongodb');
const assert = require('assert');
const mongo_client = mongodb.MongoClient;
const db_operations = require("./operations");

const url = "mongodb://127.0.0.1:27017";
const db_name = "mydb";
const coll_str = "customers";

mongo_client.connect(url, function(err, client_obj){
    assert.strictEqual(err, null);
    console.log("Connected to mongoDB");

    const db_obj = client_obj.db(db_name);

    db_operations.insertDocument(db_obj, coll_str, {firstname: "John", lastname: "Doe"}, function(returned_res){
        console.log("Inserted document:\n", returned_res.ops);

        db_operations.findDocuments(db_obj, coll_str, function(returned_res){
            console.log("Found documents:\n", returned_res);

            db_operations.updateDocument(db_obj, coll_str, {lastname: "Doe"}, {firstname: "Jack"}, function(returned_res){
                console.log("Updated document:\n", returned_res.result);

                client_obj.close();
            });
        });
    });
});