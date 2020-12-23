// importing modules 
var mongoose = require('mongoose'); 
var Schema = mongoose.Schema; 

var CommentSchema = new Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: {type: String, required: true},
    points: {type: Number, default: 0}
}, {timestamps: true});

var PostSchema = new Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true},
    content: {type: String, required: true},
    tags: [String],
    comments: [CommentSchema],
    points: {type: Number, default: 0}
}, {timestamps: true}); 
  
// export 
module.exports = mongoose.model("Post", PostSchema);