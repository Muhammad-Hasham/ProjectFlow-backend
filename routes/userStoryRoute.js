const express=require('express');
const storyController=require("../controller/storyController");
const authController=require("../controller/authController")

const router=express.Router({mergeParams:true}) 

const taskRouter=require("../routes/taskRoute");

router.use('/:storyId/tasks',taskRouter)

router.use(authController.protect); 

router
    .route('/')
    .get(storyController.getAllStories)
    .post(
        authController.restrictTo('Project Manager'),
        storyController.createStory
        )
router
    .route('/:id')
    .get(storyController.getStory)
    .patch(
        authController.restrictTo('Project Manager'),storyController.
        updateStory
        )
    .delete(
        authController.restrictTo('Project Manager'),
        storyController.deleteStory
        );

module.exports= router;