const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password: { 
        type: String, 
        required: true },
    name:{
        type:String,
        required:true,
    },
    mobile:{
        type:String,
        required:true,
    }
})
//  middleware for hashing pass before saving it
//only works if pass  is changed or modified
UserSchema.pre('save', async function(next){
    const person = this;

    // Hash the password only if it has been modified (or is new)
    if(!person.isModified('password')) return next();
    try{
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedPassword = await bcrypt.hash(person.password, salt);
        
        // Override the plain password with the hashed one
        person.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})

UserSchema.methods.comparePassword = async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

const User = mongoose.model('User',UserSchema);
module.exports=User;