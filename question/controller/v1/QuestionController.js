const Question = require('../../model/Question');
const Lesson = require('../../../lesson/models/Lesson');
const Course = require('../../../course/models/Course');
const axios = require('axios');
const createLog = require('../../../log/helpers/createLog');
const { stringify } = require('flatted');
const redis = require('../../../common/config/redisConfig');
const deleteCourseCache = require('../../../common/utils/deleteRedisKey')

// Add  new lesson to a course
const add_question = async (req, res) => {

    const user = req.user;
    console.log("user", user)


    const { courseId, moduleId, chapterId, lessonId } = req.params;
    const { type, instruction, options, answerType, status } = req.body;

    try {

        // Check if lesson exists or not
        const course = await Course.findOne({ _id: courseId });
        if (!course) {
            return res.status(400).json({ error: 'Course does not exists' });
        }
        // Check if lesson exists or not
        const lesson = await Lesson.findOne({ _id: lessonId });
        if (!lesson) {
            return res.status(400).json({ error: 'Lesson does not exists' });
        }

        if (type === 'Image' || type === 'Video' || type === 'Audio') {
            if (
                req.files.questionFiles === undefined ||
                req.files.questionFiles === null
            ) {
                return res.status(400).json({
                    message: `Please select any one file of ${type} for question content`
                })
            }
        }

        //------Field Validation Codes Start---------//
        const requiredFields = ["type", "instruction", "answerType"];
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }
        //------Field Validation Codes End---------/




        if (type === 'Image' || type === 'Video' || type === 'Audio') {
            const questionFiles = req.files.questionFiles || [];
            const file = questionFiles[0];
            const url = file.location;
            req.body.content = url;
        }


        // Saving all files into folder and generating url and set into content attribute

        const files = (req.files && req.files.optionsFiles) || [];

        let countFilesIndex = 0;
        const optionsWithUrls = options?.map((option, index) => {
            if (option.type === "Text") {
                return option;
            } else if (option.type === "Image") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing image file for option ${countFilesIndex}`);
                }
                const imageUrl = file.location;;
                countFilesIndex += 1;
                return { ...option, content: imageUrl };
            } else if (option.type === "Video") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing video file for option ${countFilesIndex}`);
                }
                const videoUrl = file.location;
                countFilesIndex += 1;
                return { ...option, content: videoUrl };
            } else if (option.type === "Audio") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing audio file for option ${countFilesIndex}`);
                }
                const videoUrl = file.location;
                countFilesIndex += 1;
                return { ...option, content: videoUrl };
            } else {
                throw new Error(`Invalid content type for question ${countFilesIndex}`);
            }
        });
        let newQuestion = new Question({
            courseId,
            moduleId,
            chapterId,
            lessonId,
            type,
            content: req.body.content,
            instruction,
            options: optionsWithUrls,
            answerType: answerType,
            status: status
        });

        const logPayload = {
            title: "add question",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: {},
            afterChanges: newQuestion
        }
        await createLog(logPayload)
        newQuestion = await newQuestion.save();

        let obj = {
            "title": req.body.content,
            "description": req.body.content,
            "course": courseId,
            "modules": moduleId,
            "chapter": chapterId,
            "lesson": lessonId,
            "question": newQuestion._id,
            "is_public": '0',
            "createdBy": req.body.createdBy ?? 1
        }

        let discussion = await axios.post(process.env.FORUM_URL + 'api/v1/discussion/adddiscussion', obj);

        console.log(discussion?.data?.discussion?.id)

        const logPayloadForDiscussion = {
            title: "add discussion",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: {},
            afterChanges: obj
        }

        await createLog(logPayloadForDiscussion);

        let updatedQuestion = await Question.findByIdAndUpdate(newQuestion._id, { discussionId: discussion?.data?.discussion?.id });

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules`)
        deleteCourseCache(`courses`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(201).json({
            message: "Question added successfully",
            savedQuestion: updatedQuestion,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Edit question
const edit_question = async (req, res) => {
    const user = req.user;
    console.log("user", user)
    try {
        const questionId = req.params.questionId;
        const { type, instruction, options, answerType, status } = req.body;

        // Check if the question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const beforeChangesofQuestion = JSON.parse(JSON.stringify(question.toObject()));


        if (question.type !== type) {
            if (type === 'Image' || type === 'Video' || type === 'Audio') {
                if (
                    req.files === undefined ||
                    req.files === null ||
                    req.files.questionFiles === undefined ||
                    req.files.questionFiles === null
                ) {
                    return res.status(400).json({
                        message: `Please select any one file of ${type} for question content`
                    })
                }
            }
        }



        if (type === 'Image' || type === 'Video' || type === 'Audio') {
            const questionFiles = req.files.questionFiles || [];
            if (questionFiles.length === 0) {
                question.content = question.content;

            } else {
                const file = questionFiles[0];
                const url = file.location;
                question.content = url;
            }
        }


        if (options) {

            // Saving all files into folder and generating url and set into content attribute

            const files = (req.files && req.files.optionsFiles) || [];

            let countFilesIndex = 0;
            const optionsWithUrls = options?.map((option, index) => {
                if (option.type === "Text") {
                    return option;
                } else if (option.type === "Image") {

                    if (option.isEdited) {
                        const file = files[countFilesIndex]
                        if (!file) {
                            throw new Error(`Missing image file for option ${countFilesIndex}`);
                        }
                        const imageUrl = file.location;
                        countFilesIndex += 1;
                        return { ...option, content: imageUrl };
                    } else {
                        return option;
                    }

                } else if (option.type === "Video") {
                    if (option.isEdited) {

                        const file = files[countFilesIndex]
                        if (!file) {
                            throw new Error(`Missing video file for option ${countFilesIndex}`);
                        }
                        const videoUrl = file.location;
                        countFilesIndex += 1;
                        return { ...option, content: videoUrl };
                    } else {
                        return option;
                    }
                } else if (option.type === "Audio") {
                    if (option.isEdited) {

                        const file = files[countFilesIndex]
                        if (!file) {
                            throw new Error(`Missing audio file for option ${countFilesIndex}`);
                        }
                        const videoUrl = file.location;
                        countFilesIndex += 1;
                        return { ...option, content: videoUrl };
                    } else {
                        return option;
                    }
                } else {
                    throw new Error(`Invalid content type for question ${countFilesIndex}`);
                }
            });
            question.options = optionsWithUrls;
        }



        if (type === 'Text') {
            if (!req.body.content) {
                return res.status(400).json({
                    message: `Please update the content of the question also`
                })
            }
        }

        question.type = type || question.type;
        question.content = req.body.content || question.content
        question.instruction = instruction || question.instruction;
        question.status = status || question.status;
        if (answerType === 'Text') {
            question.options = [];
        } else if (answerType === 'SingleSelect' || answerType === 'MultiSelect') {
            if (!options || options.length < 1) {
                return res.status(400).json({
                    error: true,
                    message: "You are changing answerType, so you also have to pass options to update"
                });
            }
        }
        question.answerType = answerType || question.answerType


        const logPayload = {
            title: "edit question",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: beforeChangesofQuestion,
            afterChanges: question
        }
        await createLog(logPayload)
        await question.save();

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules`)
        deleteCourseCache(`courses`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(200).json({
            error: false,
            message: "Question updated succesfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


// REMOVE Question
const remove_question = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.questionId,
            { status: "Deleted" },
            { new: true }
        );
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules`)
        deleteCourseCache(`courses`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(200).json({ message: "Question removed" });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// GET all Question by lessonId with pagination and filters 
const get_all_question = async (req, res) => {
    const status = req.query.status;
    const lessonId = req.params.lessonId;
  
    try {
      const cacheKey = `questions:${lessonId}`;
  
      redis.get(cacheKey, async (err, cachedData) => {
        if (err) {
          return res.status(500).json({
            message: "Redis error",
            error: err.message,
          });
        }
  
        if (cachedData) {
          return res.status(200).json(JSON.parse(cachedData));
        } else {
          const filter = {
            lessonId: lessonId,
          };
  
          if (status) {
            filter.status = status;
          } else {
            filter.status = { $ne: "Deleted" };
          }
  
          const count = await Question.countDocuments(filter);
       
  
          const questions = await Question.find(filter)
           
  
          const result = {
            questions,
            totalQuestion: count,
          };
  
          redis.set(cacheKey, JSON.stringify(result));
  
          return res.status(200).json(result);
        }
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };



module.exports = {
    add_question,
    edit_question,
    remove_question,
    get_all_question,
}


