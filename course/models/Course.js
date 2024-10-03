const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LEVELS = ["Beginner", "Intermediate", "Expert"];
const STATUS = ['Active', 'Deleted', 'Inactive', 'Retire', 'Archive']

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        unique: true,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    refCode: {
        type: String,
    },
    appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'App',
    },
    courseCategoryIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseCategory',
        required: true
    }],
    isPaid: {
        type: Boolean,
        default: false
    },
    level: {
        type: String,
        enum: LEVELS,
    },
    plans: {
        type: Object,
        required: true,
        default: {}
    },
    description: {
        intro: {
            type: String,
            required: true
        },
        details: {
            type: String,
            required: true
        }
    },

    readingHours: {
        type: String,
        required: true
    },

    banners: [
        {
            imageName: {
                type: String
            },
            heading: {
                type: String
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    profile: {
        imageName: {
            type: String
        },
        url: {
            type: String
        }
    },
    modules: [
        {
            _id: {
                type: Schema.ObjectId,
                auto: true,
            },
            name: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
            details: {
                type: String,
                required: true
            },
            logo: {
                type: String,
            },
            readingHours: {
                type: String,
                required: true
            },
            activeChapterCount: {
                type: Number,
            },
            chapters: [
                {
                    _id: {
                        type: Schema.ObjectId,
                        auto: true,
                    },
                    name: {
                        type: String,
                        required: true
                    },
                    url: {
                        type: String,
                        required: true
                    },
                    status: {
                        type: String,
                        enum: STATUS,
                        default: 'Active',
                    },
                    order: {
                        type: Number,
                        default: 1
                    },
                }
            ],
            status: {
                type: String,
                enum: STATUS,
                default: 'Active',
            },
            order: {
                type: Number,
                default: 1
            },
        }
    ],
    status: {
        type: String,
        enum: STATUS,
        default: 'Active',
    },
    publish: {
        type: Boolean,
        default: true
    },
    activeModuleCount: {
        type: Number,
        default: 0,
    },
},
    {
        timestamps: true,
    }

);



const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
