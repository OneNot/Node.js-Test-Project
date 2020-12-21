// importing modules 
var mongoose = require('mongoose'); 
var Schema = mongoose.Schema; 
var passportLocalMongoose = require('passport-local-mongoose'); 
  
var UserSchema = new Schema({    
    displayName: {type: String, required: true}, // username is made lowercase, this one remains as given
    email: {type: String, required:true, unique:false}, //TODO: would probably like to set this to unique, but I would need to make a custom check for duplicates on registration. Might do that later.
}); 
  
// plugin for passport-local-mongoose 
UserSchema.plugin(passportLocalMongoose, {usernameLowerCase: true}); 
  
// export userschema 
module.exports = mongoose.model("User", UserSchema);