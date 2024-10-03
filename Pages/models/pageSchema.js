const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MlappPageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Deleted", "Active"],
        default: "Active",
        required: true,
    },
    urlMask: {
        type: String,
        required: true
    }
},
    {
        timestamps: true,
    }

);



const Mlapppage = mongoose.model("MlappPage", MlappPageSchema);

module.exports = Mlapppage;
