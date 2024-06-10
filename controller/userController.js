const User= require("../model/userModel");
const multer=require('multer');
const sharp=require('sharp');
const AppError=require("../utils/appError");
const catchAsync=require("../utils/catchAsync");


const multerStorage= multer.memoryStorage();
const multerFilter=(req,file,callback)=>{
    if(file.mimetype.startsWith('image')){
        callback(null,true);
    }
    else{
        callback(new AppError('Not an image! Please upload only images.',404),false)
    }
}
const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});
exports.uploadUserPhoto=upload.single('photo');

exports.resizeUserPhoto= catchAsync(async(req,res,next)=>{
    if(!req.file) return next();
   
    
    req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/users/${req.file.filename}`)

        next();
})

exports.getMe = (req,res,next)=>{
    req.params.id=req.user.id;
    next();
}

exports.getUser=catchAsync(async (req,res,next)=>{ 

    let user = await User.findById(req.params.id);

    if(!user){
        return next(new AppError('No user Found with that ID',404))
    }

    res.status(200).json({
        status:'success',
        data:{
            user
        }
    });
})

const filterObj =(obj, ...allowedFields)=>{
    const newObject={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el))
        {
            newObject[el] = obj[el]; // So we added values of selected fields in selected fields.
        }
    })

    return newObject;
}

exports.updateMe = catchAsync(async(req,res,next) =>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword',400))
    } 
    const filteredBody= filterObj(req.body,'name','email');

    if(req.file) filteredBody.photo=req.file.filename;
    

    const updatedUser= await User.findByIdAndUpdate
    (
      req.user.id,
      filteredBody, 
      {new:true,runValidators:true}
    )
    // Send back response
    res.status(200).json({
        status: 'success',
        data:{
            user:updatedUser
        }
    })
})



exports.getAllUsers=async(req,res,next)=>{
        
    try{
    const users = await User.find();
    res.status(200).json({
        status:"success",
        results: users.length, 
        data:{
            users:users
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

exports.CreateUser=(req,res)=>{
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined. Please use Signup instead'
    })
}

exports.getUser=async(req,res)=>{
    try{
    const user=await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({
            status:"fail",
            message:"No User Found with that ID"
        })
    }

    res.status(200).json({
        status:'success',
        data:{
            user
        }
    });
    }
    catch(err){
        return res.status(500).json({
            status:"error",
            message:err
        })
    }
}

exports.updateUser=async(req,res)=>{
    try{
    const user=await User.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators: true 
    });
    
    if(!user){
        return res.status(404).json({
            status:"fail",
            message:"No User Found with that ID"
        })
    }

    res.status(200).json({
        status:'success',
        data:{
            user
        }
    });
    }
    catch(err){
        return res.status(500).json({
            status:"error",
            message:err
        })
    }
}


exports.deleteUser=async(req,res)=>{
    try{
    const user=await User.findByIdAndDelete(req.params.id);
    if(!user){
        return res.status(404).json({
            status:"fail",
            message:"No User Found with that ID"
        })
    }

    res.status(204).json({
        status:'success',
        data:null
    });
    }
    catch(err){
        return res.status(500).json({
            status:"error",
            message:err
        })
    }
}