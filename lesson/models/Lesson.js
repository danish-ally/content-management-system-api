const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const STATUS = ['Active', 'Deleted', 'Inactive', 'Retired', 'Archive']

const lessonSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    moduleId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    chapterId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    details: {
        type: String,
        require: true
    },

    contents: [{
        type: {
            type: String,
            enum: ['Image', 'Video', 'Text', 'Audio', 'VideoLink', 'AudioLink', 'Pdf'],
            required: true
        },
        urlOrText: {
            type: String,
            required: true
        },
        order: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            required: true
        }
    }],

    status: {
        type: String,
        enum: STATUS,
        default: 'Active'
    },
    order: {
        type: Number,
    },
    discussionId :{
        type: String,
        required: false
    }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Lesson', lessonSchema);
