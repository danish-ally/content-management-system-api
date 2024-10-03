const Log = require("../models/Log")

async function createLog({ title, changeTime, changeBy, beforeChanges, afterChanges }) {
    try {
        // Create a new log entry
        const log = new Log({
            title,
            changeTime,
            changeBy,
            beforeChanges,
            afterChanges
        });

        // Save the log entry to the database
        const savedLog = await log.save();

        console.log("Log entry created:", savedLog);
        return savedLog;
    } catch (error) {
        console.error("Error creating log:", error);
        throw error;
    }
}

module.exports = createLog;
