const mongoose=require('mongoose');

const subTaskSchema=new mongoose.Schema({

    description:{
        type:String,
        required:[true,'Please Provide User Story Description']
    },
    status:{
        type:String,
        default:'todo',
        enum: ['todo','on-track','done']
    },
    task:{
        type: mongoose.Schema.ObjectId,
        ref:'Task',
        required:[true,'sub-Task must belong to a Task']
    },
})

const subTask= mongoose.model('subTask',subTaskSchema);
module.exports=subTask;