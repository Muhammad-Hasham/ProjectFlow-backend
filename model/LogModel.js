const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    prevData: Object,
    newData: Object,
    updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    taskId: {
        type: mongoose.Schema.ObjectId,
        ref: "Task",
    },
    projectId: {
        type: mongoose.Schema.ObjectId,
        ref: "Project",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    typeofRequest: String, // update, create, delete
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
