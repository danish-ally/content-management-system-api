const Lesson = require('../../models/Lesson');
const Course = require('../../../course/models/Course');
const axios = require('axios');
const createLog = require('../../../log/helpers/createLog');
const redis = require('../../../common/config/redisConfig');
const deleteCourseCache = require('../../../common/utils/deleteRedisKey')

// Add a new lesson to a course
const add_lesson = async (req, res) => {
    const user = req.user;
    console.log("user", user)
    try {
        const courseId = req.params.courseId;
        const { name, url, moduleId, chapterId, details, status, contents } = req.body;

        //------Field Validation Codes Start---------//
        const requiredFields = ["name", "url", "moduleId", "chapterId", "details", "contents"];
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }

        //------Field Validation Codes End---------//


        // Existing course
        const courseExists = await Course.exists({ _id: courseId });
        if (!courseExists) {
            return res.status(400).json({ message: "Course does not exist" });
        }
        console.log(req.files)

        // Existing module
        const moduleExists = await Course.exists({
            _id: courseId,
            "modules._id": moduleId,
        });
        if (!moduleExists) {
            return res.status(400).json({ message: "Module does not exist" });
        }

        // Existing chapter
        const chapterExists = await Course.exists({
            _id: courseId,
            "modules._id": moduleId,
            "modules.chapters._id": chapterId,
        });
        if (!chapterExists) {
            return res.status(400).json({ message: "Chapter does not exist" });
        }

        // Existing lesson name
        const lessonNameExists = await Lesson.exists({
            courseId: courseId,
            moduleId: moduleId,
            chapterId: chapterId,
            name: name

        });


        if (lessonNameExists) {
            return res.status(400).json({ message: "Lesson with this name already exists" });
        }



        // Saving all files into folder and generating url and set into content attribute
        const files = req.files || [];
        let countFilesIndex = 0;
        const contentsWithUrls = contents.map((content, index) => {
            if (content.type === "Text") {

                return { ...content, order: index + 1 };

            } else if (content.type === "VideoLink" || content.type === "AudioLink") {
                var urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
                // Check if the content is a valid URL
                if (urlPattern.test(content.urlOrText)) {
                    return { ...content, order: index + 1 };
                } else {
                    console.log("Invalid URL:", content.urlOrText);
                    throw new Error(`Invalid URL: ${content.urlOrText}`);
                }
            } else if (content.type === "Image") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing image file for content ${countFilesIndex}`);
                }
                const imageUrl = file.location;
                countFilesIndex += 1;
                return { ...content, urlOrText: imageUrl, order: index + 1 };
            } else if (content.type === "Video") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing video file for content ${countFilesIndex}`);
                }
                const videoUrl = file.location;
                countFilesIndex += 1;
                return { ...content, urlOrText: videoUrl, order: index + 1 };
            } else if (content.type === "Audio") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing audio file for content index ${index}`);
                }
                const audioUrl = file.location;
                countFilesIndex += 1;
                return { ...content, urlOrText: audioUrl, order: index + 1 };
            } else if (content.type === "Pdf") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing pdf file for content index ${index}`);
                }
                const pdfUrl = file.location;
                countFilesIndex += 1;
                return { ...content, urlOrText: pdfUrl, order: index + 1 };
            }
            else {
                throw new Error(`Invalid content type for content ${countFilesIndex}`);
            }
        });



        // Existing highest lesson order in the chapter
        const highestLessonOrder = await Lesson.findOne({ chapterId }).sort({ order: -1 }).limit(1);
        console.log(highestLessonOrder)
        const nextOrder = highestLessonOrder ? highestLessonOrder.order + 1 : 1;



        let lesson = new Lesson({
            name,
            url,
            courseId,
            moduleId,
            chapterId,
            details,
            order: nextOrder,
            status,
            contents: contentsWithUrls,
        });





        lesson = await lesson.save();
        let obj = {
            "title": name,
            "description": name,
            "course": courseId,
            "modules": moduleId,
            "chapter": chapterId,
            "lesson": lesson._id,
            "is_public": '0',
            "createdBy": req.body.createdBy ?? 1
        }

        console.log("hey")
        let discussion = await axios.post(process.env.FORUM_URL + 'api/v1/discussion/adddiscussion', obj);
        console.log("By", discussion)


        console.log(discussion?.data?.discussion?.id)

        const logPayloadForDiscussion = {
            title: "add discussion",
            changeTime: new Date(),
            changeBy: {
                nrefId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: {},
            afterChanges: obj
        }
        
        await createLog(logPayloadForDiscussion);

        console.log("after")


        let updatedLesson = await Lesson.findByIdAndUpdate(lesson._id, { discussionId: discussion?.data?.discussion?.id });

        const logPayload = {
            title: "add lesson",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: {},
            afterChanges: updatedLesson
        }
        await createLog(logPayload)

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(201).json({
            message: "Lesson added successfully",
            lesson: updatedLesson,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update a lesson
const update_lesson = async (req, res) => {
    const user = req.user;
    console.log("user", user)
    try {
        const courseId = req.params.courseId;
        const lessonId = req.params.lessonId;

        if (!courseId) {
            return res.status(400).json({
                message: `Missing required Params: courseId`
            })
        }

        if (!lessonId) {
            return res.status(400).json({
                message: `Missing required Params: lessonId`
            })
        }
        const { name, url, moduleId, chapterId, details, status, contents } = req.body;

        // Check if the lesson exists
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const beforeChangesofLesson = JSON.parse(JSON.stringify(lesson.toObject()));

        // This will check if the courseId exists 
        const courseExists = await Course.exists({
            _id: courseId,
        });

        if (!courseExists) {
            return res.status(400).json({ message: "Course does'nt exists" });
        }

        // This will check if the moduleId exists 
        const modulesExists = await Course.exists({
            "modules._id": moduleId,
        });
        console.log(moduleId, modulesExists)

        if (!modulesExists) {
            return res.status(400).json({ message: "Modules does'nt exists" });
        }

        // This will check if the chapterId exists 
        const chapterExists = await Course.exists({
            "modules.chapters._id": chapterId
        });

        if (!chapterExists) {
            return res.status(400).json({ message: "Chapter does'nt exists" });
        }



        const lessonNameExists = await Lesson.exists({
            courseId: courseId,
            moduleId: moduleId,
            chapterId: chapterId,
            name: name,
            _id: { $ne: req.params.lessonId }
        });


        if (lessonNameExists) {
            return res.status(400).json({ message: 'Lesson with this name already exist' });
        }


        // Saving all files into folder and generating url and set into content attribute


        if (req.files.length > 0 || contents?.length > 0) {

            const files = req.files || [];
            let countFilesIndex = 0;
            const contentsWithUrls = contents.map((content, index) => {
                if (content.type === "Text") {

                    return { ...content, order: index + 1 };

                } else if (content.type === "VideoLink" || content.type === "AudioLink") {
                    var urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
                    // Check if the content is a valid URL
                    if (urlPattern.test(content.urlOrText)) {

                        return { ...content, order: index + 1 };
                    } else {
                        console.log("Invalid URL:", content.urlOrText);
                        throw new Error(`Invalid URL: ${content.urlOrText}`);
                    }
                } else if (content.type === "Image") {
                    const file = files[countFilesIndex]
                    if (!file) {
                        throw new Error(`Missing image file for content ${countFilesIndex}`);
                    }
                    const imageUrl = file.location;
                    countFilesIndex += 1;
                    return { ...content, urlOrText: imageUrl, order: index + 1 };
                } else if (content.type === "Video") {
                    const file = files[countFilesIndex]
                    if (!file) {
                        throw new Error(`Missing video file for content ${countFilesIndex}`);
                    }
                    const videoUrl = file.location;
                    countFilesIndex += 1;
                    return { ...content, urlOrText: videoUrl, order: index + 1 };
                } else if (content.type === "Audio") {
                    const file = files[countFilesIndex]
                    if (!file) {
                        throw new Error(`Missing audio file for content ${countFilesIndex}`);
                    }
                    const videoUrl = file.location;
                    countFilesIndex += 1;
                    return { ...content, urlOrText: videoUrl, order: index + 1 };
                } else if (content.type === "Pdf") {
                    const file = files[countFilesIndex]
                    if (!file) {
                        throw new Error(`Missing pdf file for content index ${index}`);
                    }
                    const pdfUrl = file.location;
                    countFilesIndex += 1;
                    return { ...content, urlOrText: pdfUrl, order: index + 1 };
                }
                else {
                    throw new Error(`Invalid content type for content ${countFilesIndex}`);
                }
            });
            lesson.contents = contentsWithUrls;

        }



        lesson.name = name || lesson.name;
        lesson.url = url || lesson.url;
        lesson.details = details || lesson.details
        lesson.status = status || lesson.status


        const logPayload = {
            title: "update lesson",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: beforeChangesofLesson,
            afterChanges: lesson
        }
        await createLog(logPayload)

        await lesson.save();

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}`)
        deleteCourseCache(`lesson:${lessonId}`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(200).json({
            error: false,
            message: "Lesson updated succesfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get a list of lessons based on course, module, and chapter filters
const get_all_lesson = async (req, res) => {
    try {
        const { courseId, moduleId, chapterId } = req.query;

        const filter = {
            status: { $ne: "Deleted" }
        };

        if (courseId) {
            const courseExists = await Course.exists({
                _id: courseId,
            });

            if (!courseExists) {
                return res.status(400).json({ message: "Course doesn't exist" });
            }

            filter.courseId = courseId;
        }

        if (moduleId) {
            const moduleExists = await Course.exists({
                "modules._id": moduleId,
            });

            if (!moduleExists) {
                return res.status(400).json({ message: "Module doesn't exist" });
            }

            filter.moduleId = moduleId;
        }

        if (chapterId) {
            const chapterExists = await Course.exists({
                "modules.chapters._id": chapterId
            });

            if (!chapterExists) {
                return res.status(400).json({ message: "Chapter doesn't exist" });
            }

            filter.chapterId = chapterId;
        }

        const lessons = await Lesson.find(filter).sort({ order: 1 });

        res.status(200).json({
            message: "Got Lesson List Succussfully",
            lessons: lessons
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}


// REMOVE lesson
const remove_lesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(
            req.params.lessonId,
            { status: "Deleted" },
            { new: true }
        );
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
       
        deleteCourseCache('courses')
        deleteCourseCache(`lesson:${req.params.lessonId}`)
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(200).json({ message: "Lesson removed" });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// DELETE content
const delete_content = async (req, res) => {
    const { lessonId, contentId } = req.params;
    console.log(lessonId, contentId)

    try {
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const contentIndex = lesson.contents.findIndex(
            (content) => content._id.toString() === contentId
        );

        if (contentIndex === -1) {
            return res.status(404).json({ message: "Content not found" });
        }

        lesson.contents.splice(contentIndex, 1);

        await lesson.save();
        
        deleteCourseCache('courses')
        deleteCourseCache(`lesson:${lessonId}`)
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(200).json({ message: "Content removed" });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

const edit_content = async (req, res) => {
    const { lessonId, contentId } = req.params;
    const { title, type, urlOrText } = req.body; // Assuming the updated content is sent in the request body

    try {
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const contentIndex = lesson.contents.findIndex(
            (content) => content._id.toString() === contentId
        );

        if (contentIndex === -1) {
            return res.status(404).json({ message: "Content not found" });
        }

        const existingContent = lesson.contents[contentIndex];
        console.log(req.files)
        if (req.files?.length === 0 || req.files === undefined) {
            console.log(existingContent.title, title)
            lesson.contents[contentIndex] = {
                type: type || existingContent.type,
                urlOrText: urlOrText || existingContent.urlOrText,
                order: existingContent.order,
                title: title || existingContent.title,
                _id: existingContent._id
            }
            console.log(lesson.contents[contentIndex])
            await lesson.save();

            deleteCourseCache('courses')
            deleteCourseCache(`lesson:${lessonId}`)
            deleteCourseCache(`courseDetail`)
            deleteCourseCache(`modules`)
            deleteCourseCache(`topic`)
            deleteCourseCache(`page`)
            deleteCourseCache(`questions`)

            return res.status(200).json({ message: "Content updated", content: lesson.contents[contentIndex] });
        } else {

            const files = req.files || [];
            const file = files[0]
            const url = file.location;

            lesson.contents[contentIndex] = {
                type: type || existingContent.type,
                urlOrText: url,
                order: existingContent.order,
                title: title || existingContent.title,
                _id: existingContent._id
            }
            console.log(lesson.contents[contentIndex])
            await lesson.save();

            deleteCourseCache('courses')
            deleteCourseCache(`lesson:${lessonId}`)

            return res.status(200).json({ message: "Content updated", content: lesson.contents[contentIndex] });
        }

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

const add_content = async (req, res) => {
    const { lessonId } = req.params;
    const { title, type, urlOrText } = req.body; // Assuming the updated content is sent in the request body

    try {
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }



        if (type === "Text") {
            // Create a new content object
            const newContent = {
                title,
                type,
                urlOrText,
                order: lesson.contents.length + 1,
            };

            // Add the new content to the lesson's contents array
            lesson.contents.push(newContent);

            // Save the updated lesson
            await lesson.save();


            return res.status(200).json({ message: "Content added successfully", content: lesson.contents[lesson.contents.length - 1] });

        } else if (type === "VideoLink" || type === "AudioLink") {
            var urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
            // Check if the content is a valid URL
            if (urlPattern.test(urlOrText)) {
                // Create a new content object
                const newContent = {
                    title,
                    type,
                    urlOrText,
                    order: lesson.contents.length + 1,
                };

                // Add the new content to the lesson's contents array
                lesson.contents.push(newContent);

                // Save the updated lesson
                await lesson.save();

                deleteCourseCache('courses')
                deleteCourseCache(`lesson:${lessonId}`)
                deleteCourseCache(`courseDetail`)
                deleteCourseCache(`modules`)
                deleteCourseCache(`topic`)
                deleteCourseCache(`page`)
                deleteCourseCache(`questions`)

                return res.status(200).json({ message: "Content added successfully", content: lesson.contents[lesson.contents.length - 1] });
            } else {
                console.log("Invalid URL:", urlOrText);
                throw new Error(`Invalid URL: ${urlOrText}`);
            }
        } else if (type === "Image") {
            const file = req.files[0]
            if (!file) {
                throw new Error(`Missing image file for content`);
            }
            const imageUrl = file.location;

            // Create a new content object
            const newContent = {
                title,
                type,
                urlOrText: imageUrl,
                order: lesson.contents.length + 1,
            };

            // Add the new content to the lesson's contents array
            lesson.contents.push(newContent);

            // Save the updated lesson
            await lesson.save();
            
            deleteCourseCache('courses')
            deleteCourseCache(`lesson:${lessonId}`)
            deleteCourseCache(`courseDetail`)
            deleteCourseCache(`modules`)
            deleteCourseCache(`topic`)
            deleteCourseCache(`page`)
            deleteCourseCache(`questions`)

            return res.status(200).json({ message: "Content added successfully", content: lesson.contents[lesson.contents.length - 1] });
        } else if (type === "Video") {
            const file = req.files[0]
            if (!file) {
                throw new Error(`Missing video file for content`);
            }
            const videoUrl = file.location;
            // Create a new content object
            const newContent = {
                title,
                type,
                urlOrText: videoUrl,
                order: lesson.contents.length + 1,
            };

            // Add the new content to the lesson's contents array
            lesson.contents.push(newContent);

            // Save the updated lesson
            await lesson.save();

            deleteCourseCache('courses')
            deleteCourseCache(`lesson:${lessonId}`)
            deleteCourseCache(`courseDetail`)
            deleteCourseCache(`modules`)
            deleteCourseCache(`topic`)
            deleteCourseCache(`page`)
            deleteCourseCache(`questions`)

            return res.status(200).json({ message: "Content added successfully", content: lesson.contents[lesson.contents.length - 1] });
        } else if (type === "Audio") {
            const file = req.files[0]
            if (!file) {
                throw new Error(`Missing audio file for content`);
            }
            const audioUrl = file.location;
            // Create a new content object
            const newContent = {
                title,
                type,
                urlOrText: audioUrl,
                order: lesson.contents.length + 1,
            };

            // Add the new content to the lesson's contents array
            lesson.contents.push(newContent);

            // Save the updated lesson
            await lesson.save();

            deleteCourseCache('courses')
            deleteCourseCache(`lesson:${lessonId}`)
            deleteCourseCache(`courseDetail`)
            deleteCourseCache(`modules`)
            deleteCourseCache(`topic`)
            deleteCourseCache(`page`)
            deleteCourseCache(`questions`)


            return res.status(200).json({ message: "Content added successfully", content: lesson.contents[lesson.contents.length - 1] });
        } else if (type === "Pdf") {
            const file = req.files[0]
            if (!file) {
                throw new Error(`Missing pdf file for content`);
            }
            const pdfUrl = file.location;
            // Create a new content object
            const newContent = {
                title,
                type,
                urlOrText: pdfUrl,
                order: lesson.contents.length + 1,
            };

            // Add the new content to the lesson's contents array
            lesson.contents.push(newContent);

            // Save the updated lesson
            await lesson.save();
            
            deleteCourseCache('courses')
            deleteCourseCache(`lesson:${lessonId}`)
            deleteCourseCache(`courseDetail`)
            deleteCourseCache(`modules`)
            deleteCourseCache(`topic`)
            deleteCourseCache(`page`)
            deleteCourseCache(`questions`)

            return res.status(200).json({ message: "Content added successfully", content: lesson.contents[lesson.contents.length - 1] });
        }
        else {
            throw new Error(`Invalid type for content`);
        }



    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


const changeContentOrderByLessonId = async (req, res) => {
    const { lessonId } = req.params
    try {

        const { contents } = req.body;

        let contentsArray = contents
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }


        console.log(contentsArray)

        for (let i = 0; i < contentsArray.length; i++) {

            const content = contentsArray[i];

            content.order = i + 1;

        }

        console.log(contentsArray)
        lesson.contents = await contentsArray;
        await lesson.save();

        deleteCourseCache('courses')
        deleteCourseCache(`lesson:${lessonId}`)
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        return res.status(200).json({
            message: "Order updated successfully"
        })


    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}


const update_lesson_position = async (req, res) => {
    try {
        const { courseId, moduleId, chapterId } = req.query;
        let updatedlesson = req.body;
        const filter = {};
        console.log(req.query)

        if (courseId) {
            const courseExists = await Course.exists({
                _id: courseId,
            });

            if (!courseExists) {
                return res.status(400).json({ message: "Course doesn't exist" });
            }

            filter.courseId = courseId;
        }

        if (moduleId) {
            const modulesExists = await Course.exists({
                "modules._id": moduleId,
            });

            if (!modulesExists) {
                return res.status(400).json({ message: "Module doesn't exist" });
            }

            filter.moduleId = moduleId;
        }

        if (chapterId) {
            const chapterExists = await Course.exists({
                "modules.chapters._id": chapterId,
            });

            if (!chapterExists) {
                return res.status(400).json({ message: "Chapter doesn't exist" });
            }

            filter.chapterId = chapterId;
        }

        const lessons = await Lesson.find(filter);

        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            for (let j = 0; j < updatedlesson.length; j++) {
                if (updatedlesson[j]._id == lesson._id) {
                    lesson.order = j + 1;
                    break;
                }
            }
        }

        lessons.forEach(async (aLesson) => {
            await aLesson.save()
        })

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules:`)
        deleteCourseCache(`courses:chapters`)          
        deleteCourseCache(`lesson:${lessonId}`)


        res.status(200).json({
            message: "Updated lesson position",
            lessons,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};



const getAllContentByLessonId = async (req, res) => {
    const { lessonId } = req.params;
  
    try {
      const cacheKey = `lesson:${lessonId}`;
  
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
          const lesson = await Lesson.findById(lessonId);
  
          if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
          }
  
          const result = {
            error: false,
            lesson: lesson,
            message: "Got Lesson List Successfully",
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
  }

module.exports = {
    add_lesson,
    update_lesson,
    get_all_lesson,
    remove_lesson,
    delete_content,
    edit_content,
    add_content,
    changeContentOrderByLessonId,
    update_lesson_position,
    getAllContentByLessonId
}


