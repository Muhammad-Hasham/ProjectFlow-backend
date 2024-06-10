const mongoose=require('mongoose');
const { createLog } = require('../controller/LogController');
const validator=require('validator');
const bcrypt= require('bcryptjs');

const userSchema=new mongoose.Schema({

    name:{
        type:String,
        required:[true,'A user must have name'],  
    },
    email:{
        type:String,
        required:[true,'A user must have email'],
        unique:[true,'Email must be unique'],
        lowercase:true, 
        validate: [validator.isEmail,'Please provide valid email']
    },
    role: {
        type: String,
        enum: ['admin', 'Project Manager', 'Team Member','Client'],
        default: 'Member'
    },
    photo:{
        type:String,  
        default: 'default.jpg'
    }, 
    password:{
        type: String,
        required: [true,'Please provide a password'],
        minlength: 8,
        select:false 
    },
    passwordConfirm:{
        type: String,
        required: [true,'Please provide a password'],
        validate:{
            validator: function(el){
                return el === this.password; 
            },
            message:'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetExpires:Date,

    active:{
        type: Boolean,
        default: true,
        select: false 
    }
},
{ 
    // Schema options
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) {
        return next();
       }
    this.password=await bcrypt.hash(this.password,12)
    this.passwordConfirm=undefined;
    next();
})


userSchema.virtual('projects',{
    ref:"Project",
    foreignField:'project_manager', 
    localField: '_id'
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword)
{
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp= parseInt(this.passwordChangedAt.getTime() / 1000, 10) 
        return JWTTimestamp < changedTimeStamp;
    }
    return false;
 }


userSchema.methods.createPasswordResetToken = function(){
    const resetToken= crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires=Date.now()+10*60*1000;
    return resetToken;
}

// Inside User Schema

// Pre hook for findOneAndUpdate to store original document
userSchema.pre('findOneAndUpdate', async function (next) {
    // Fetch and store the original document
    this._original = await this.model.findOne(this.getQuery());
    next();
});

// Post hook to create log after update or delete
userSchema.post('findOneAndUpdate', async function (doc) {
    if (doc) {
        await createLog({
            prevData: this._original,
            newData: doc,
            updatedBy: doc.id,
            userId: doc._id,
            typeofRequest: doc.isNew ? 'create' : 'update'
        });
    }
});


// Post hook to create log after a new document is created
userSchema.post('save', async function(doc) {
    console.log(doc);
    await createLog({
        prevData: {}, // No previous data for new document
        newData: doc,
        updatedBy: doc.id,
        typeofRequest: 'create'
    });
});


// Pre hook to store document before deletion
userSchema.pre('findOneAndDelete', async function(next) {
    try {
        // Store the document to be deleted
        this._docToDelete = await this.model.findOne(this.getQuery());
        next();
    } catch (error) {
        console.error("Error in deleteOne hook:", error);
        next(error); // Forward the error to the next middleware
    }
});

// Post hook to create log after a document is deleted
userSchema.post('findOneAndDelete', async function(doc) {
    try {
        if (this._docToDelete) {
            await createLog({
                prevData: this._docToDelete,
                newData: {}, // No new data after deletion
                updatedBy: this._docToDelete.id,
                userId: this._docToDelete._id,
                typeofRequest: 'delete'
            });
        }
    } catch (error) {
        console.error("Error creating delete log:", error);
    }
});


const User = mongoose.model('User',userSchema);

module.exports=User;
