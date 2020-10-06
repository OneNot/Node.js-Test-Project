//mongodb helper-operations
const assert = require('assert').strict;

exports.insertDocument = (db_obj, coll_str, document, callback) => {

    //get the collection object from the db
    const coll = db_obj.collection(coll_str);

    coll.insertOne(document, function(err, res){
        assert.strictEqual(err, null);
        console.log("Inserted " + res.result.n + " documents into collection: " + coll_str);
        callback(res);
    });
};

exports.findDocuments = function(db_obj, coll_str, callback){
    const coll = db_obj.collection(coll_str);
    coll.find({}).toArray(function(err, res){
        assert.strictEqual(err, null);
        callback(res);
    });
};

exports.removeDocument = function(db_obj, coll_str, document, callback){
    const coll = db_obj.collection(coll_str);
    coll.deleteOne(document, function(err, res){
        assert.strictEqual(err, null);
        console.log("Removed the document: " + document);
        callback(res);
    });
};

exports.updateDocument = function(db_obj, coll_str, document, update, callback){
    const coll = db_obj.collection(coll_str);
    coll.updateOne(document, {$set: update}, null, function(err, res){
        assert.strictEqual(err, null);
        console.log("Updated the document: " + document);
        callback(res);
    });
};