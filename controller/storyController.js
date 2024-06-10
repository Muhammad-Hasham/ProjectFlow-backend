const UserStory = require("../model/userStoryModel");
const Story= require("../model/userStoryModel");
const AppError=require("../utils/appError");
const catchAsync=require("../utils/catchAsync");


exports.createStory=catchAsync(async(req,res,next)=>{

    if(!req.body.project) {
        req.body.project=req.params.projectId
    }
    
    const newUserStory=await Story.create(req.body);
            res.status(201).json({
                status:'success',
                data:{
                    story:newUserStory
                }
            })
})


exports.getAllStories=catchAsync(async(req,res,next)=>{

        let filter={};
        if(req.params.projectId){
            filter={project:req.params.projectId};
        }

    const stories=await Story.find(filter);
    res.status(200).json({
        status:'success',
        results:stories.length,
        data:{
            stories:stories
        }
    })
})


exports.getStory=catchAsync(async(req,res,next)=>{

    const story = await Story.findById(req.params.id).populate({path:'tasks', select:'name description'});

    if(!story){
        return next(new AppError('No User-story Found with that ID',404))
    }

    res.status(200).json({
        status:'success',
        data:{
            story
        }
    });
})

exports.updateStory=catchAsync(async(req,res,next)=>{
    const story=await Story.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators: true 
    });

    if(!story){
        return next(new AppError('No story Found with that ID',404))
    }
    res.status(200).json({
        status:'success',
        data:{
          data:story
        }
    })
})

exports.deleteStory=catchAsync(async(req,res,next)=>{
    const story=await Story.findByIdAndDelete(req.params.id);
        if(!story){
            return next(new AppError('No story Found with that ID',404))
        }
        res.status(204).json({  
            status:'success',
            data:null
        })
})