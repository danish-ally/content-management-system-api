const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logSchema = new mongoose.Schema({
    title: { type: String, required: true },
    changeTime: { type: Date, required: true },
    changeBy: {
        refId: { type: String, default: null },
        name: { type: String, default: '', required: true },
        email: { type: String, default: '', required: true },
        phoneNo: { type: Number, default: null },
        otherInfo: { type: Object, default: {} }
    },
    beforeChanges: { type: Object },
    afterChanges: { type: Object }
});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
