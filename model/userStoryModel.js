const mongoose=require('mongoose');

const userStorySchema=new mongoose.Schema({

    description:{
        type:String,
        required:[true,'Please Provide User Story Description']
    },
    start_date:{
        type:Date,
    },
    end_date:{
        type:Date,
        required:[true,'User-Story Must have end Date']
    },
    createdAt:{
        type:Date,
        default:Date.now,
        select: false
    },
    status:{
        type:String,
        default:'todo',
        enum: ['todo','on-track','done']
    },
    project:{
        type: mongoose.Schema.ObjectId,
        ref:'Project',
        required:[true,'User Story must belong to a Project']
    },
},
{ 
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}); 


userStorySchema.virtual('tasks',{
    ref:"Task",
    foreignField:'story',
    localField: '_id'  
});


const UserStory= mongoose.model('UserStory',userStorySchema);
module.exports=UserStory;