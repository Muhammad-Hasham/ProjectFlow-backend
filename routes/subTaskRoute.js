const express=require('express');
const subTaskController=require("../controller/subTaskController");
const authController=require("../controller/authController")

const router=express.Router({mergeParams:true})

router
   .route('/')
   .get(authController.protect,authController.restrictTo('Project Manager'),subTaskController.getAllSubTasks)
   .post(authController.protect,authController.restrictTo('Project Manager'),subTaskController.CreateSubTask);

router
   .route('/:id')
   .patch(
      authController.protect,
      authController.restrictTo('Project Manager'),
      subTaskController.UpdateSubTask
      )
   .delete(
      authController.protect,
      authController.restrictTo('Project Manager'),
      subTaskController.DeleteSubTask
      );

module.exports=router;