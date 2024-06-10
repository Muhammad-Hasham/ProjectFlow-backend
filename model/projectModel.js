const { createLog } = require('../controller/LogController');
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a project description']
    },
    start_date: {
        type: Date,
        default: Date.now,
    },
    end_date: {
        type: Date,
        required: [true, 'Project must have an end date']
    },
    project_manager: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    Members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

projectSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'project_manager',
        select: '-__v'
    });
    next();
});

projectSchema.virtual('week').get(function () {
    const timeDifference = this.endDate - this.startDate;
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - this.start_date) / (24 * 60 * 60 * 1000));
    const weeks = Math.floor(daysDifference / 7);
    return weeks;
});

projectSchema.virtual('tasks', {
    ref: "Task",
    foreignField: 'project',
    localField: '_id'
});

projectSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'Members',
        select: '-__v -passwordChangedAt'
    })
    next();
});

// Pre hook for findOneAndUpdate to store original document
projectSchema.pre('findOneAndUpdate', async function (next) {
    // Fetch and store the original document
    this._original = await this.model.findOne(this.getQuery());
    next();
});

// Post hook to create log after update or delete
projectSchema.post(['findOneAndUpdate', 'findOneAndDelete'], async function (doc) {
    if (doc) {
        await createLog({
            prevData: this._original,
            newData: doc,
            updatedBy: doc.project_manager,
            projectId: doc._id,
            typeofRequest: doc.isNew ? 'create' : 'update'
        });
    }
});

// Post hook to create log after a new document is created
projectSchema.post('save', async function (doc) {
    await createLog({
        prevData: {}, // No previous data for new document
        newData: doc,
        updatedBy: doc.project_manager,
        projectId: doc._id,
        typeofRequest: 'create'
    });
});

projectSchema.pre('deleteOne', async function (next) {
    try {
        // Store the document to be deleted
        this._docToDelete = await this.model.findOne(this.getQuery());
        next();
    } catch (error) {
        console.error("Error in findOneAndDelete hook:", error);
        next(error); // Forward the error to the next middleware
    }
});

projectSchema.post('deleteOne', async function (doc) {
    try {
        if (this._docToDelete) {
            await createLog({
                prevData: this._docToDelete,
                newData: {}, // No new data after deletion
                updatedBy: this._docToDelete.project_manager,
                projectId: this._docToDelete._id,
                typeofRequest: 'delete'
            });
        }
    } catch (error) {
        console.error("Error creating delete log:", error);
    }
});



const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
