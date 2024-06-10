const express = require("express");
const projectController = require("../controller/projectController");
const authController = require("../controller/authController");

const router = express.Router({ mergeParams: true });

const storyRouter = require("../routes/userStoryRoute");

router.use("/:projectId/stories", storyRouter);

router
  .route("/")
  .get(authController.protect, projectController.getAllProjects)
  .post(
    authController.protect,
    authController.restrictTo("Project Manager"),
    projectController.CreateProject
  );

router
  .route("/sendinvite")
  .post(authController.protect, projectController.sendInviteEmail);
router
  .route("/:id/pieStats")
  .get(authController.protect, projectController.pieStats);

router
  .route("/:id/lineStats")
  .get(authController.protect, projectController.lineStats);

router
  .route("/:id")
  .get(authController.protect, projectController.getParticularProject)
  .patch(
    authController.protect,
    authController.restrictTo("Project Manager"),
    projectController.UpdateProject
  )
  .delete(
    authController.protect,
    authController.restrictTo("Project Manager"),
    projectController.DeleteProject
  );

module.exports = router;
