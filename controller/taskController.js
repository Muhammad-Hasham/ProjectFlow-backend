const Task= require("../model/taskModel");
const AppError=require("../utils/appError");
const catchAsync=require("../utils/catchAsync");

exports.CreateTask = catchAsync(async (req, res, next) => {
    const tasksData = req.body.tasks;

    if (!Array.isArray(tasksData)) {
        return next(new AppError('tasksData must be an array', 400));
    }

    const createdTasks = [];

    for (const taskData of tasksData) {
        const task = await Task.create({
            ...taskData,
            project_manager: req.user.id
        });
        createdTasks.push(task);
    }

    res.status(201).json({
        status: 'success',
        data: {
            tasks: createdTasks
        }
    });
});


exports.getAllTasks=async(req,res,next)=>{

    let filter={};
    if(req.params.userId) filter= { project_manager:req.params.userId}
    else  filter= { assignee:req.user.id}
    
    try{
    const tasks = await Task.find(filter);
    res.status(200).json({
        status:"success",
        results: tasks.length, 
        data:{
            tasks
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

exports.getTask=catchAsync(async(req,res,next)=>{

    const task = await Task.findById(req.params.id).populate({path:'subtasks', select:'description'});

    if(!task){
        return next(new AppError('No task Found with that ID',404))
    }

    res.status(200).json({
        status:'success',
        data:{
            task
        }
    });
})

exports.UpdateTask=catchAsync(async (req,res,next)=>{

    const task=await Task.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators: true,
    }) 
    if(!task){
        return next(new AppError('No task Found with that ID',404))
    }

    res.status(200).json({
        status:'success',
        data:{
          data:task
        }
    })
})


exports.DeleteTask=catchAsync(async (req,res,next)=>{
    const task=await Task.findByIdAndDelete(req.params.id);
        if(!task){
            return next(new AppError('No task Found with that ID',404))
        }
        res.status(204).json({  
            status:'success',
            data:null
        })
})
