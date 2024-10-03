const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const STATUS = ["Active", "Deleted", "Inactive", "Retired", "Archive"];

const questionOptionSchema = new Schema({
  type: {
    type: String,
    enum: ["Image", "Video", "Text", "Audio"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const questionSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    type: {
      type: String,
      enum: ["Image", "Video", "Text", "Audio"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    instruction: {
      type: String,
      required: true,
    },
    options: {
      type: [questionOptionSchema],
      // required: true,
    },
    answerType: {
      type: String,
      enum: ["SingleSelect", "MultiSelect", "Text"],
      required: true,
    },
    status: {
      type: String,
      enum: STATUS,
      default: "Active",
    },
    discussionId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
