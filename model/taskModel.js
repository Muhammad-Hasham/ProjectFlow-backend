const { createLog } = require('../controller/LogController');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Task must have a name'],  
    },
    description: {
        type: String,
        required: [true, 'Please provide task description']
    },
    start_date: {
        type: Date,
        default: Date.now,
    },
    end_date: {
        type: Date,
        default: () => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 3); // Adding 3 days
            return currentDate;
        }
    },
    last_updation_date: {
        type: Date
    },
    assignee: {
        type: mongoose.Schema.ObjectId,   
        ref: "User",
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high']
    },
    status: {
        type: String,
        default: "todo",
        enum: ['todo', 'inProgress', 'completed', 'overdue']
    },
    project_manager: {
        type: mongoose.Schema.ObjectId,   
        ref: "User",
    },
    pre_dependency: {
        type: mongoose.Schema.ObjectId,    
        ref: "Task",
        default: null
    },
    updated_By: {
        type: mongoose.Schema.ObjectId,    
        ref: "User",
        default:null,
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: [true, 'Task must belong to a Project']
    },
}, { 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}); 

taskSchema.virtual('subtasks', {
    ref: "SubTask",
    foreignField: 'task',
    localField: '_id'  
});

taskSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'assignee',
        select: '-__v -passwordChangedAt'
    })
    next();
});


// Pre hook for findOneAndUpdate to store original document
taskSchema.pre('findOneAndUpdate', async function(next) {
    this._original = await this.model.findOne(this.getQuery());
    next();
});

// Post hook to create log after update or delete
taskSchema.post('findOneAndUpdate', async function(doc) {
    if (doc) {
        await createLog({
            prevData: this._original,
            newData: doc,
            updatedBy: doc.updated_By,
            taskId: doc._id,
            typeofRequest: 'update'
        });
    }
});

// Post hook to create log after a new document is created
taskSchema.post('save', async function(doc) {
    await createLog({
        prevData: {}, // No previous data for new document
        newData: doc,
        updatedBy: doc.project_manager,
        taskId: doc._id,
        typeofRequest: 'create'
    });
});

// Pre hook to store document before deletion
taskSchema.pre('findOneAndDelete', async function(next) {
    try {
        // Store the document to be deleted
        this._docToDelete = await this.model.findOne(this.getQuery());
        next();
    } catch (error) {
        console.error("Error in deleteOne hook:", error);
        next(error); // Forward the error to the next middleware
    }
});

// Post hook to create log after a document is deleted
taskSchema.post('findOneAndDelete', async function(doc) {
    try {
        if (this._docToDelete) {
            await createLog({
                prevData: this._docToDelete,
                newData: {}, // No new data after deletion
                updatedBy: this._docToDelete.project_manager,
                taskId: this._docToDelete._id,
                typeofRequest: 'delete'
            });
        }
    } catch (error) {
        console.error("Error creating delete log:", error);
    }
});

taskSchema.pre('deleteMany', async function(next) {
    try {
        // Store the documents to be deleted
        this._docsToDelete = await this.model.find(this.getQuery());
        next();
    } catch (error) {
        console.error("Error in deleteMany hook:", error);
        next(error); // Forward the error to the next middleware
    }
});

taskSchema.post('deleteMany', async function(docs) {
    try {
        for (const doc of this._docsToDelete) {
            await createLog({
                prevData: doc,
                newData: {}, // No new data after deletion
                updatedBy: doc.project_manager,
                taskId: doc._id,
                typeofRequest: 'delete'
            });
        }
    } catch (error) {
        console.error("Error creating delete log:", error);
    }
});


const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
