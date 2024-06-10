const User=require("../model/userModel");
const crypto=require('crypto');
const jwt=require('jsonwebtoken');
const AppError=require("../utils/appError");
const catchAsync=require("../utils/catchAsync");
const {promisify}=require('util');


// Token generation function
const signToken=id=>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
     expiresIn:process.env.JWT_EXPIRES_IN
 })
 }
 

 const createSendToken = (user,statusCode, res)=>{


    const token =signToken(user.id);
   
    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 *1000)),
        httpOnly: true  
    }
    res.cookie('jwt',token,cookieOptions); 

    user.password=undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
}

exports.signup= catchAsync(async (req,res,next)=>{

    const newUser=await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role:req.body.role
    })

    createSendToken(newUser,201,res);
});

exports.login=catchAsync(async(req,res,next)=>{
    
    const {email,password}=req.body;

    if(!email || !password){
        return next(new AppError("Please provide Email & pasword",400))
    }

    // lets check if there actually is a user for email that was posted.
    const user= await User.findOne({email}).select('+password')

    if(!user || !await (user.correctPassword(password,user.password))){
        return next(new AppError('Invalid Email or Password',401))
    }

    createSendToken(user,200,res);
});


exports.protect=catchAsync(async(req,res,next)=>{

    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1]; 
    }

    
    if(!token){
        return next(new AppError('You are not logged in! Please login to get access.',401));
    }

   const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET)

   

    const currentUser=await User.findById(decoded.id); 

    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exists',401))
    }

    if(currentUser.changedPasswordAfter(decoded.iat)){
        
        return next( new AppError('User recently changed password! Please log in again',401))
    }

    req.user= currentUser;
    
    next();

})

    
exports.restrictTo = (...roles) =>{

    return (req,res,next) =>{ 
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action',403))
        }
        next()
    }
}

exports.updatePassword= catchAsync(async (req,res,next)=>{

            const user=await User.findById(req.user.id).select('+password') 
          
            if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
                return next(new AppError('Your current Password is wrong', 401));
            }

            user.password=req.body.password;
            user.passwordConfirm=req.body.passwordConfirm;
            await user.save();
     createSendToken(user,200,res);
})

exports.logout=(req,res)=>{
    res.cookie('jwt','loggedout',{
        expires: new Date(Date.now()+10*1000),
        httpOnly:true
    });
    res.status(200).json({ status:'sucess'})
}
