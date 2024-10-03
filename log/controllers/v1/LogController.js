const Log = require('../../models/Log')
const mongoose = require('mongoose');

const get_all_log_by_courseId = async (req, res) => {
    const courseId = req.params.courseId;

    try {
        // Convert courseId string to MongoDB ObjectId
        const objectId = new mongoose.Types.ObjectId(courseId);

        // Fetch logs from the database where afterChanges._id matches the given courseId
        const logs = await Log.find({
            $or: [
                { 'afterChanges._id': objectId },
                { 'afterChanges.courseId': objectId },
                { 'afterChanges.course': courseId }
            ]
        });

        return res.status(200).json({
            total: logs.length,
            logs: logs,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};






module.exports = {
    get_all_log_by_courseId
};



