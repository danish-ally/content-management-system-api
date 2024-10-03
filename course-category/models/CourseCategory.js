const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const STATUS = ['Active', 'Deleted', 'Inactive', 'Retire', 'Archive']

const courseCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
    },
    urlMask: {
        type: String,
        unique: true,
        required: true,
    },
    readingHours: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    publish: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: STATUS,
        default: 'Active'
    }
},

    {
        timestamps: true,
    }

);

const CourseCategory = mongoose.model("CourseCategory", courseCategorySchema);

module.exports = CourseCategory;
