const express = require('express');

const userRouter=require("./routes/UserRoute")
const projectRouter=require("./routes/projectRoute")
const userStoryRouter=require("./routes/userStoryRoute")
const taskRouter=require("./routes/taskRoute")
const subTaskRouter=require("./routes/subTaskRoute")
const logsRouter=require("./routes/logsRoute")
const cookieParser=require("cookie-parser")
const cors = require("cors");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/users',userRouter)
app.use('/api/v1/projects',projectRouter)
app.use('/api/v1/stories',userStoryRouter)
app.use('/api/v1/tasks',taskRouter)
app.use('/api/v1/subTasks',subTaskRouter)
app.use('/api/v1/logs',logsRouter)


module.exports = app;