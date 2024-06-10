const express=require('express');
const userController=require("../controller/userController");
const authController=require("../controller/authController")
const projectRouter=require("../routes/projectRoute")
const taskRouter=require("../routes/taskRoute")

const router=express.Router();


router.use('/:userId/projects',projectRouter)
router.use('/:userId/tasks',taskRouter)

// Authentication
router.post('/signup',authController.signup);
router.post('/login',authController.login); 
router.get('/logout',authController.protect,authController.logout);

// Protected Routes
router.use(authController.protect);
router.patch('/updateMyPassword',authController.updatePassword);
router.get('/me',userController.getMe,userController.getUser);
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);

// Admin control Routes
// router.use(authController.restrictTo('admin'));
router
   .route('')
   .get(userController.getAllUsers)
   .post(userController.CreateUser);
router
   .route('/:id')
   .get(userController.getUser)
   .patch(userController.updateUser)
   .delete(userController.deleteUser);

module.exports=router;