// logController.js
const Log = require('../model/LogModel');
const User = require('../model/userModel');

exports.createLog=async(logData)=>{
    try {
        await Log.create(logData);
    } catch (error) {
        console.error("Error creating log:", error);
    }
}

exports.getAllLogs = async (req, res, next) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const skip = (page - 1) * limit;

        const query = {};

        // Filtering logic based on query parameters
        if (req.query.userId) {
            query.updatedBy = req.query.userId;
        }
        if (req.query.typeofRequest) {
            query.typeofRequest = req.query.typeofRequest;
        }
        // Add more filtering criteria as needed...

        const logs = await Log.find(query).skip(skip).limit(limit);
        const totalLogs = await Log.countDocuments(query);

        res.status(200).json({
            status: "success",
            results: logs.length,
            totalPages: Math.ceil(totalLogs / limit),
            currentPage: page,
            data: {
                logs
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
}

// Controller function to get all user names from logs
exports.getUserNamesFromLogs = async (req, res) => {
    try {
        // Find all logs with populated updatedBy field
        const logs = await Log.find({}).populate('updatedBy');
    
        // Use a Set to store unique user IDs
        const uniqueUserIds = new Set();
    
        // Extract unique user IDs from logs
        logs.forEach(log => {
            if (log.updatedBy && log.updatedBy.name) {
                // Add user ID to the set
                uniqueUserIds.add(log.updatedBy._id.toString());
            }
        });

        // Construct unique user objects using the IDs
        const uniqueUsers = Array.from(uniqueUserIds).map(userId => {
            const log = logs.find(log => log.updatedBy && log.updatedBy._id.toString() === userId);
            return {
                name: log.updatedBy.name,
                id: userId
            };
        });

        // Send the unique user objects as response
        res.json({ users: uniqueUsers });
    } catch (error) {
        console.error('Error fetching user names and IDs from logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteAllLogs= async(req, res) => {
    try {
        await Log.deleteMany();
        res.status(200).json({ message: 'All logs have been deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting logs.' });
    }
}
