// importing modules 
var mongoose = require('mongoose'); 
var Schema = mongoose.Schema; 

var VoteSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    state: {type: Number, required: true}
});

var CommentSchema = new Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: {type: String, required: true},
    points: {type: Number, default: 0},
    votes: [VoteSchema]
}, {timestamps: true});

var PostSchema = new Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true},
    content: {type: String, required: true},
    tags: [String],
    comments: [CommentSchema],
    points: {type: Number, default: 0},
    votes: [VoteSchema]
}, {timestamps: true}); 
  
// export 
module.exports = mongoose.model("Post", PostSchema);