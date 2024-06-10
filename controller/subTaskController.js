const SubTask= require("../model/subTaskModel");
const AppError=require("../utils/appError");
const catchAsync=require("../utils/catchAsync");

exports.CreateSubTask=catchAsync(async (req,res,next)=>{
   
    if(!req.body.task) {
        req.body.task=req.params.taskId
    }
    
    const subTask=await SubTask.create(req.body);
        res.status(201).json({
            status:'success',
            data:{
                data:subTask
            }
        });
})

exports.getAllSubTasks=async(req,res,next)=>{

    let filter={};
        if(req.params.taskId){
            filter={task:req.params.taskId};
        }
    
    try{
    const subTasks = await SubTask.find(filter);
    res.status(200).json({
        status:"success",
        results: subTasks.length, 
        data:{
            subTasks
        } 
    })
    }
    catch(err)
    {
        res.status(404).json({
            status:"fail",
            message:err
        })
    }
}

exports.UpdateSubTask=catchAsync(async (req,res,next)=>{
    const subTask=await SubTask.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators: true 
    });

    if(!subTask){
        return next(new AppError('No subTask Found with that ID',404))
    }
    res.status(200).json({
        status:'success',
        data:{
          data:subTask
        }
    })
})


exports.DeleteSubTask=catchAsync(async (req,res,next)=>{
    const subTask=await SubTask.findByIdAndDelete(req.params.id);
        if(!subTask){
            return next(new AppError('No subTask Found with that ID',404))
        }
        res.status(204).json({  
            status:'success',
            data:null
        })
})