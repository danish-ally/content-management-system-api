const Topic = require('../../../topic/models/Topic');
const Lesson = require('../../../lesson/models/Lesson')
const Course = require('../../../course/models/Course')
const redis = require('../../../common/config/redisConfig');
const deleteCourseCache = require('../../../common/utils/deleteRedisKey')


// Add Topic
const add_topic = async (req, res) => {

    try {
        const courseId = req.params.courseId;
        const moduleId = req.params.moduleId;
        const chapterId = req.params.chapterId;
        const lessonId = req.params.lessonId;
        const { name, url, content, order, status } = req.body

        //------Field Validation Codes Start---------//
        const requiredFields = ["name", "url", "content", "order"];
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }

        // Existing course
        const orderExists = await Topic.exists({ order: order });
        if (orderExists) {
            return res.status(400).json({ message: "This Order no. exists already " });
        }
        //------Field Validation Codes End---------//


        // Existing course
        const courseExists = await Course.exists({ _id: courseId });
        if (!courseExists) {
            return res.status(404).json({ message: "Course does not exist" });
        }

        // Existing module
        const moduleExists = await Course.exists({
            _id: courseId,
            "modules._id": moduleId,
        });
        if (!moduleExists) {
            return res.status(404).json({ message: "Module does not exist" });
        }

        // Existing chapter
        const chapterExists = await Course.exists({
            _id: courseId,
            "modules._id": moduleId,
            "modules.chapters._id": chapterId,
        });
        if (!chapterExists) {
            return res.status(404).json({ message: "Chapter does not exist" });
        }

        // Existing lesson
        const lessonExists = await Lesson.exists({ _id: lessonId });
        if (!lessonExists) {
            return res.status(404).json({ message: "Lesson does not exist" });
        }


        // Existing topic url
        const existingTopicUrl = await Topic.exists({ url });
        if (existingTopicUrl) {
            return res.status(400).json({ message: "Topic URL already exists" });
        }

        // Existing topic name
        const existingTopicName = await Topic.exists({ name });
        if (existingTopicName) {
            return res.status(400).json({ message: "Topic name already exists" });
        }

        // Saving all files into folder and generating url and set into content attribute
        const files = req.files || [];
        console.log("files", files)
        let countFilesIndex = 0;
        const contentsWithUrls = content.map((content, index) => {
            if (content.type === "Text") {
                return content;
            } else if (content.type === "VideoLink" || content.type === "AudioLink") {
                var urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
                // Check if the content is a valid URL
                if (urlPattern.test(content.urlOrText)) {
                    return content;
                } else {
                    console.log("Invalid URL:", content.urlOrText);
                    throw new Error(`Invalid URL: ${content.urlOrText}`);
                }
            } else if (content.type === "Image") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing image file for content index ${index}`);
                }
                const imageUrl = `${process.env.BASE_URL}/uploads/topic-files/${file.filename}`;
                countFilesIndex += 1;
                return { ...content, urlOrText: imageUrl };
            } else if (content.type === "Video") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing video file for content index ${index}`);
                }
                const videoUrl = `${process.env.BASE_URL}/uploads/topic-files/${file.filename}`;
                countFilesIndex += 1;
                return { ...content, urlOrText: videoUrl };
            } else if (content.type === "Audio") {
                const file = files[countFilesIndex]
                if (!file) {
                    throw new Error(`Missing audio file for content index ${index}`);
                }
                const audioUrl = `${process.env.BASE_URL}/uploads/topic-files/${file.filename}`;
                countFilesIndex += 1;
                return { ...content, urlOrText: audioUrl };
            } else {
                throw new Error(`Invalid content type for content index ${index}`);
            }
        });

        const topic = new Topic({
            name,
            url,
            courseId,
            moduleId,
            chapterId,
            lessonId,
            content: contentsWithUrls,
            order,
            status
        });



        await topic.save();

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}:${moduleId}`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(201).json({
            message: "Topic added successfully",
            topic: topic,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


// Edit Topic
const edit_topic = async (req, res) => {
    try {
        const topicId = req.params.topicId;
        console.log(req.params.topicId)
        console.log(req.body)

        const { name, url, content, order, courseId, moduleId, chapterId, lessonId, status } = req.body

        // Check if the topic exists
        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }


        // Checking existing topic url and name
        const existingTopicUrl = await Topic.find({ url: url });
        const existingTopicName = await Topic.find({ name: name });


        if (existingTopicUrl.length > 0) {
            return res.status(400).json({ message: 'This topic url already used' });
        }
        if (existingTopicName.length > 0) {
            return res.status(400).json({ message: 'This topic name already used' });
        }


        // Saving all files into folder and generating url and set into content attribute

        if (req.files.length > 0 || content?.length > 0) {

            const files = req.files || [];
            let countFilesIndex = 0;
            const contentsWithUrls = content.map((content, index) => {
                if (content.type === "Text") {
                    return content;
                } else if (content.type === "VideoLink" || content.type === "AudioLink") {
                    var urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
                    // Check if the content is a valid URL
                    if (urlPattern.test(content.urlOrText)) {
                        return content;
                    } else {
                        console.log("Invalid URL:", content.urlOrText);
                        throw new Error(`Invalid URL: ${content.urlOrText}`);
                    }
                } else if (content.type === "Image") {
                    const file = files[countFilesIndex]
                    if (!file) {
                        throw new Error(`Missing image file for content ${countFilesIndex}`);
                    }
                    const imageUrl = `${process.env.BASE_URL}/uploads/topic-files/${file.filename}`;
                    countFilesIndex += 1;
                    return { ...content, urlOrText: imageUrl };
                } else if (content.type === "Video") {
                    const file = files[countFilesIndex]
                    if (!file) {
                        throw new Error(`Missing video file for content ${countFilesIndex}`);
                    }
                    const videoUrl = `${process.env.BASE_URL}/uploads/topic-files/${file.filename}`;
                    countFilesIndex += 1;
                    return { ...content, urlOrText: videoUrl };
                } else if (content.type === "Audio") {
                    const file = files[countFilesIndex]
                    if (!file) {
                        throw new Error(`Missing audio file for content ${countFilesIndex}`);
                    }
                    const videoUrl = `${process.env.BASE_URL}/uploads/topic-files/${file.filename}`;
                    countFilesIndex += 1;
                    return { ...content, urlOrText: videoUrl };
                } else {
                    throw new Error(`Invalid content type for content ${countFilesIndex}`);
                }
            });
            topic.content = contentsWithUrls;

        }



        topic.name = name || topic.name;
        topic.url = url || topic.url;
        topic.order = order || topic.order;
        topic.courseId = courseId || topic.courseId;
        topic.moduleId = moduleId || topic.moduleId;
        topic.chapterId = chapterId || topic.chapterId;
        topic.lessonId = lessonId || topic.lessonId;
        topic.status = status || topic.status;


        await topic.save();
        deleteCourseCache('courses')
        deleteCourseCache(`topic:${topicId}`)
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(200).json({
            error: false,
            message: "Topic updated succesfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


// REMOVE topic
const remove_topic = async (req, res) => {
    try {
        const topic = await Topic.findByIdAndUpdate(
            req.params.topicId,
            { status: "Deleted" },
            { new: true }
        );
        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }

        deleteCourseCache('courses')
        deleteCourseCache(`topic:${req.params.topicId}`)
        deleteCourseCache(`courseDetail`)
        deleteCourseCache(`modules`)
        deleteCourseCache(`topic`)
        deleteCourseCache(`page`)
        deleteCourseCache(`questions`)

        res.status(200).json({ message: "Topic removed" });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};



// GET all Topic with pagination and filters 
const get_all_topic = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    try {
        const filter = {};
        if (status) {
            filter.status = status;
        } else {
            filter.status = { $ne: "Deleted" };
        }

        let count = await Topic.countDocuments(filter);
        const totalPages = Math.ceil(count / limit);
        const skip = (page - 1) * limit;

        let topics;
        if (search) {
            let regex;
            if (search.length === 1) {
                regex = new RegExp(`^${search}`, 'i');
            } else {
                regex = new RegExp(search, 'i');
            }

            topics = await Topic.find({
                $or: [
                    { name: { $regex: regex } },
                ],
                ...filter,
            })
                .skip(skip)
                .limit(limit);
        } else {
            topics = await Topic.find(filter).skip(skip).limit(limit);
        }

        res.status(200).json({
            topics,
            currentPage: page,
            limit: limit,
            totalPages: totalPages,
            totalTopics: count
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};



// GET all Topic By Lesson Id with pagination and filters 
const get_all_topic_by_lesson_id = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const lessonId = req.params.lessonId;

    try {
        const filter = {
            lessonId: lessonId,
        };
        if (status) {
            filter.status = status;
        } else {
            filter.status = { $ne: "Deleted" };
        }

        let count = await Topic.countDocuments(filter);
        const totalPages = Math.ceil(count / limit);
        const skip = (page - 1) * limit;

        let topics;
        if (search) {
            let regex;
            if (search.length === 1) {
                regex = new RegExp(`^${search}`, 'i');
            } else {
                regex = new RegExp(search, 'i');
            }

            topics = await Topic.find({
                $or: [
                    { name: { $regex: regex } },
                ],
                ...filter,
            })
                .skip(skip)
                .limit(limit);
        } else {
            topics = await Topic.find(filter).skip(skip).limit(limit);
        }

        res.status(200).json({
            topics,
            currentPage: page,
            limit: limit,
            totalPages: totalPages,
            totalTopics: count
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};



// GET all Topic By Lesson Id with pagination and filters 
const get_all_content_by_topic_id = async (req, res) => {
    const topicId = req.params.topicId;
  
    try {
      const cacheKey = `topic:${topicId}`;
  
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
          const topic = await Topic.findById(topicId);
  
          if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
          } else if (topic.status !== "Active") {
            return res.status(400).json({ message: "Topic is not Active" });
          } else {
            const result = {
              message: "Contents got successfully",
              content: topic.content,
            };
  
            redis.set(cacheKey, JSON.stringify(result));
            return res.status(200).json(result);
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

module.exports = {
    add_topic,
    edit_topic,
    remove_topic,
    get_all_topic,
    get_all_topic_by_lesson_id,
    get_all_content_by_topic_id
};



