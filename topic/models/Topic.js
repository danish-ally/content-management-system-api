const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const STATUS = ['Active', 'Deleted', 'Inactive', 'Retired', 'Archive']

const topicSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        require: true
    },
    content: [{
        type: {
            type: String,
            enum: ['Image', 'Video', 'Text', 'Audio', 'VideoLink', 'AudioLink'],
            required: true
        },
        urlOrText: {
            type: String,
            required: true
        }
    }],
    order: {
        type: Number,
        unique: true,
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
    lessonId: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    status: {
        type: String,
        enum: STATUS,
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Topic', topicSchema);
