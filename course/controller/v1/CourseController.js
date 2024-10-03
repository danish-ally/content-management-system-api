const Course = require("../../models/Course")
const Lesson = require("../../../lesson/models/Lesson");
const Topic = require("../../../topic/models/Topic");
const CourseCategory = require("../../../course-category/models/CourseCategory");
const Question = require("../../../question/model/Question");
const createLog = require("../../../log/helpers/createLog");
const redis = require('../../../common/config/redisConfig');
const deleteCourseCache = require('../../../common/utils/deleteRedisKey')



// Create a new course
const create_course = async (req, res) => {

    const user = req.user;
    console.log("user", user)
    try {
        const {
            name,
            url,
            code,
            refCode,
            appId,
            courseCategoryIds,
            isPaid,
            level,
            plans,
            description,
            readingHours,
            banners,
            profile,
            status,
            publish,
        } = req.body;

        //------Field Validation Codes Start---------//
        const requiredFields = ["name", "url", "code", "courseCategoryIds", "plans", "description", "readingHours"];
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }
        //------Field Validation Codes End--------//


        // Check if the url or code already exists
        const courseUrl = await Course.findOne({ url: url });
        const courseCode = await Course.findOne({ code: code });
        if (courseUrl) {
            return res.status(400).json({ message: "Course with this name already exists" });
        }
        if (courseCode) {
            return res.status(400).json({ message: "This course code already exists" });
        }

        const bannersFiles = req.files.bannersImage || [];
        const profileFiles = req.files.profileImage || [];

        if (bannersFiles.length > 0 && profileFiles.length === 0) {
            console.log("banner")
            console.log(bannersFiles)
            const bannnersWithUrl = await banners?.map((banner, index) => {
                const file = bannersFiles[index]

                const imageUrl = file.location;
                return { ...banner, url: imageUrl };

            })

            // Create the new course
            const course = new Course({
                name,
                url,
                code,
                refCode,
                appId,
                courseCategoryIds,
                isPaid,
                level,
                plans,
                description,
                readingHours,
                banners: bannnersWithUrl,
                status,
                publish
            });



            const savedCourse = await course.save();

            const logPayload = {
                title: "create course",
                changeTime: new Date(),
                changeBy: {
                    refId: user.user_id,
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phone,
                },
                beforeChanges: {},
                afterChanges: savedCourse
            }
            await createLog(logPayload)
            deleteCourseCache('courses')

            return res.status(201).json({
                message: "Course created successfully",
                course: savedCourse,
            });

        } else if (bannersFiles.length === 0 && profileFiles.length > 0) {

            console.log(profileFiles)

            if (profile) {

                const { imageName } = profileFiles[0]?.originalname;
                const imageUrl = profileFiles[0]?.location;
                const profileWithUrl = { imageName, url: imageUrl };

                // Create the new course
                const course = new Course({
                    name,
                    url,
                    code,
                    refCode,
                    appId,
                    courseCategoryIds,
                    isPaid,
                    level,
                    plans,
                    description,
                    readingHours,
                    profile: profileWithUrl,
                    status,
                    publish
                });


                const savedCourse = await course.save();

                const logPayload = {
                    title: "create course",
                    changeTime: new Date(),
                    changeBy: {
                        refId: user.user_id,
                        name: user.name,
                        email: user.email,
                        phoneNo: user.phone,
                    },
                    beforeChanges: {},
                    afterChanges: savedCourse
                }
                await createLog(logPayload)
                deleteCourseCache('courses')

                return res.status(201).json({
                    message: "Course created successfully",
                    course: course,
                });
            } else {

                const { imageName } = profileFiles[0]?.originalname;
                const imageUrl = profileFiles[0]?.location;
                const profileWithUrl = { imageName, url: imageUrl };

                // Create the new course
                const course = new Course({
                    name,
                    url,
                    code,
                    refCode,
                    appId,
                    courseCategoryIds,
                    isPaid,
                    level,
                    plans,
                    description,
                    readingHours,
                    profile: profileWithUrl,
                    status,
                    publish
                });


                const savedCourse = await course.save();

                const logPayload = {
                    title: "create course",
                    changeTime: new Date(),
                    changeBy: {
                        refId: user.user_id,
                        name: user.name,
                        email: user.email,
                        phoneNo: user.phone,
                    },
                    beforeChanges: {},
                    afterChanges: savedCourse
                }
                await createLog(logPayload)
                deleteCourseCache('courses')

                return res.status(201).json({
                    message: "Course created successfully",
                    course: savedCourse,
                });
            }


        } else if (bannersFiles.length > 0 && profileFiles.length > 0) {
            console.log("banner & profile")
            console.log(req.files)
            if (profile) {
                const bannnersWithUrl = await banners?.map((banner, index) => {
                    const file = bannersFiles[index]

                    const imageUrl = file.location;
                    return { ...banner, url: imageUrl };

                })


                const { imageName } = profileFiles[0]?.originalname;
                const file = profileFiles[0];


                const imageUrl = file.location;
                const profileWithUrl = { imageName, url: imageUrl };

                // Create the new course
                const course = new Course({
                    name,
                    url,
                    code,
                    refCode,
                    appId,
                    courseCategoryIds,
                    isPaid,
                    level,
                    plans,
                    description,
                    readingHours,
                    banners: bannnersWithUrl,
                    profile: profileWithUrl,
                    status,
                    publish
                });


                const savedCourse = await course.save();

                const logPayload = {
                    title: "create course",
                    changeTime: new Date(),
                    changeBy: {
                        refId: user.user_id,
                        name: user.name,
                        email: user.email,
                        phoneNo: user.phone,
                    },
                    beforeChanges: {},
                    afterChanges: savedCourse
                }
                await createLog(logPayload)
                deleteCourseCache('courses')

                return res.status(201).json({
                    message: "Course created successfully",
                    course: savedCourse,
                });
            } else {
                const bannnersWithUrl = await banners?.map((banner, index) => {
                    const file = bannersFiles[index]

                    const imageUrl = file.location;
                    return { ...banner, url: imageUrl };

                })

                const file = profileFiles[0];

                const imageUrl = file.location;
                const profileWithUrl = { imageName: null, url: imageUrl };

                // Create the new course
                const course = new Course({
                    name,
                    url,
                    code,
                    refCode,
                    appId,
                    courseCategoryIds,
                    isPaid,
                    level,
                    plans,
                    description,
                    readingHours,
                    banners: bannnersWithUrl,
                    profile: profileWithUrl,
                    status,
                    publish
                });


                const savedCourse = await course.save();

                const logPayload = {
                    title: "create course",
                    changeTime: new Date(),
                    changeBy: {
                        refId: user.user_id,
                        name: user.name,
                        email: user.email,
                        phoneNo: user.phone,
                    },
                    beforeChanges: {},
                    afterChanges: savedCourse
                }
                await createLog(logPayload)
                deleteCourseCache('courses')

                return res.status(201).json({
                    message: "Course created successfully",
                    course: savedCourse,
                });
            }

        } else {
            console.log("nothing")
            // Create the new course
            const course = new Course({
                name,
                url,
                code,
                refCode,
                appId,
                courseCategoryIds,
                isPaid,
                level,
                plans,
                description,
                readingHours,
                status,
                publish
            });


            const savedCourse = await course.save();

            const logPayload = {
                title: "create course",
                changeTime: new Date(),
                changeBy: {
                    refId: user.user_id,
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phone,
                },
                beforeChanges: {},
                afterChanges: savedCourse
            }
            await createLog(logPayload)
            deleteCourseCache('courses')

            return res.status(201).json({
                message: "Course created successfully",
                course: savedCourse,
            });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Add a new module to an existing course
const add_new_module = async (req, res) => {
    const user = req.user;
    console.log("user", user)
    try {
        const { name, url, details, readingHours, status, logo } = req.body;
        const { courseId } = req.params;


        const requiredFields = ["name", "url", "details", "readingHours"];
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }
        //------Field Validation Codes End---------//





        // Check if the course exists
        const course = await Course.findById(courseId);
        const beforeChangesofCourse = JSON.parse(JSON.stringify(course.toObject()));


        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the module url is unique within the course
        const existingModuleUrls = course.modules.map((module) => {
            if (module.status != 'Deleted') return module.url
        });
        if (existingModuleUrls.includes(url)) {
            return res.status(400).json({ message: "Module with this name already exists" });
        }






        if (req.file) {

            console.log(req.file)
            const logo = req.file.location



            // Create the new module and add it to the course

            course.modules.push({ name, url, details, logo, readingHours, status, order: course.modules.length > 0 ? course.modules.length + 1 : 1 });



            const logPayload = {
                title: "add module",
                changeTime: new Date(),
                changeBy: {
                    refId: user.user_id,
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phone,
                },
                beforeChanges: beforeChangesofCourse,
                afterChanges: course
            }

            console.log("logPayload", logPayload)
            await createLog(logPayload)
            const savedCourse = await course.save();

            deleteCourseCache('courses')
            deleteCourseCache(`courseDetail:${courseId}`)

            return res.status(201).json({
                message: "Module added to course successfully",
                course: savedCourse,
            });
        } else {

            course.modules.push({ name, url, details, logo, readingHours, status, order: course.modules.length > 0 ? course.modules.length + 1 : 1 });

            const logPayload = {
                title: "add module",
                changeTime: new Date(),
                changeBy: {
                    refId: user.user_id,
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phone,
                },
                beforeChanges: beforeChangesofCourse,
                afterChanges: course
            }

            console.log("logPayload", logPayload)
            await createLog(logPayload)
            const savedCourse = await course.save();

            deleteCourseCache('courses')
            deleteCourseCache(`courseDetail:${courseId}`)

            return res.status(201).json({
                message: "Module added to course successfully",
                course: savedCourse,
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update an existing module in an existing course
const update_existing_module = async (req, res) => {
    const user = req.user;
    console.log("user", user)

    const { courseId, moduleId } = req.params;

    if (!courseId) {
        return res.status(400).json({
            message: `Missing required Params: courseId`
        })
    }

    if (!moduleId) {
        return res.status(400).json({
            message: `Missing required Params: moduleId`
        })
    }

    try {
        const course = await Course.findById(courseId);
        const beforeChangesofCourse = JSON.parse(JSON.stringify(course.toObject()));

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const moduleIndex = course.modules.findIndex(
            (module) => module._id.toString() === moduleId
        );

        if (moduleIndex === -1) {
            return res.status(404).json({ message: "Module not found" });
        }


        const {
            name,
            url,
            details,
            readingHours,
            status
        } = req.body;




        const existingModuleUrls = course.modules.map((module, i) => {
            if (i !== moduleIndex && module.status != 'Deleted') return module.url
        });
        if (existingModuleUrls.includes(url)) {
            return res.status(400).json({ message: "Module with this name already exists" });
        }


        course.modules[moduleIndex].name = name || course.modules[moduleIndex].name;
        course.modules[moduleIndex].url = url || course.modules[moduleIndex].url;
        course.modules[moduleIndex].details = details || course.modules[moduleIndex].details;
        course.modules[moduleIndex].status = status || course.modules[moduleIndex].status;

        if (req.file) {
            console.log("file has:", req.file)
            console.log(req.file)
            const logo = req.file.location
            course.modules[moduleIndex].logo = logo
        } else {
            console.log("file not:", req.file)
            course.modules[moduleIndex].logo
        }
        course.modules[moduleIndex].readingHours = readingHours || course.modules[moduleIndex].readingHours;

        const logPayload = {
            title: "update module",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: beforeChangesofCourse,
            afterChanges: course
        }

        console.log("logPayload", logPayload)
        await createLog(logPayload)

        await course.save();

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}:${moduleId}`)
        

        res.json({
            message: "Module updated successfully",
            module: course.modules[moduleIndex],
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Edit Course (ADMIN)
const edit_course = async (req, res) => {
    try {
        const user = req.user;
        console.log("user", user)


        const {
            name,
            url,
            code,
            refCode,
            appId,
            courseCategoryIds,
            isPaid,
            level,
            plans,
            description,
            readingHours,
            banners,
            profile,
            status,
            publish
        } = req.body;

        console.log('workingggg........................')
        console.log("request body",req.body)


        const courseId = req.params.courseId;
        if (!courseId) {
            return res.status(400).json({
                message: `Missing required Params: courseId`
            })
        }

        const course = await Course.findById(courseId);
        const beforeChangesofCourse = JSON.parse(JSON.stringify(course.toObject()));
        console.log("course:", course)
        console.log("beforeChangesofCourse 0", beforeChangesofCourse)


        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const courseUrl = await Course.findOne({ url: url, _id: { $nin: [courseId] } });
        const courseCode = await Course.findOne({ code: code, _id: { $nin: [courseId] } });
        if (courseUrl) {
            return res.status(400).json({ message: "Course with this name already exists" });
        }
        if (courseCode) {
            return res.status(400).json({ message: "This course code already exists" });
        }

        // Update course fields
        course.name = name || course.name;
        course.url = url || course.url;
        course.code = code || course.code;
        course.refCode = refCode || course.refCode;
        course.appId = appId || course.appId;
        course.courseCategoryIds = courseCategoryIds || course.courseCategoryIds;
        course.isPaid = isPaid || course.isPaid;
        course.level = level || course.level;
        course.plans = plans || course.plans;
        course.description = description || course.description;
        course.readingHours = readingHours || course.readingHours;
        course.status = status || course.status;
        course.publish = publish || course.publish

        // Update banners images
        if (req.files && req.files.bannersImage) {
            const bannersFiles = req.files.bannersImage;
            const bannnersWithUrl = await banners.map((banner, index) => {
                const file = bannersFiles[index]
                // const imageUrl = `${process.env.BASE_URL}/uploads/course-files/${file.filename}`;
                // console.log(file)
                const imageUrl = file.location;
                return { ...banner, url: imageUrl };
            });
            course.banners = bannnersWithUrl;
        }

        // Update profile image
        if (req.files && req.files.profileImage) {

            if (profile) {

                // console.log("req.files", req.files)
                const imageName = req.files.profileImage[0]?.originalname;

                // const imageUrl = profileFiles[0]?.location;
                // const { imageName } = profile;
                const file = req.files.profileImage[0];
                // const imageUrl = `${process.env.BASE_URL}/uploads/course-files/${file.filename}`;
                // console.log(file)
                const imageUrl = file.location;
                course.profile = { imageName, url: imageUrl };
            } else {
                const file = req.files.profileImage[0];
                // const imageUrl = `${process.env.BASE_URL}/uploads/course-files/${file.filename}`;
                // console.log(file)
                const imageUrl = file.location;
                course.profile = { imageName: course.profile.imageName, url: imageUrl };
            }

        }

        const logPayload = {
            title: "update course",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: beforeChangesofCourse,
            afterChanges: course
        }
        await createLog(logPayload)

        console.log("beforeChangesofCourse", beforeChangesofCourse)

        // Save the updated course
        const updatedCourse = await course.save();
        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}`)

        return res.status(200).json({
            message: "Course updated successfully",
            course: updatedCourse,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Remove a module from an existing course (ADMIN)
const remove_module = async (req, res) => {
    const { courseId, moduleId } = req.params;

    try {

        if (!courseId) {
            return res.status(400).json({
                message: `Missing required Params: courseId`
            })
        }

        if (!moduleId) {
            return res.status(400).json({
                message: `Missing required Params: moduleId`
            })
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const moduleIndex = course.modules.findIndex(
            (module) => module._id.toString() === moduleId
        );

        if (moduleIndex === -1) {
            return res.status(404).json({ message: "Module not found" });
        }


        await Course.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    "modules.$[module].status": "Deleted",
                    "modules.$[module].chapters.$[].status": "Deleted"
                }
            },
            {
                new: true,
                arrayFilters: [
                    { "module._id": moduleId }
                ]
            }
        );


        // Update the status of all related lessons 
        await Lesson.updateMany(
            { courseId, moduleId },
            { $set: { status: "Deleted" } }
        );

        // Update the status of all related topics 
        await Topic.updateMany(
            { courseId, moduleId },
            { $set: { status: "Deleted" } }
        );
        // Update the status of all related questions
        await Question.updateMany(
            { courseId, moduleId },
            { $set: { status: "Deleted" } }
        );

        // Save the updated course
        await course.save();

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}:${moduleId}`)

        res.json({ message: "Module removed from course" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }

};

// Remove a chapter from an existing module (ADMIN)
const remove_chapter = async (req, res) => {
    const { courseId, moduleId, chapterId } = req.params;

    try {

        if (!courseId) {
            return res.status(400).json({
                message: `Missing required Params: courseId`
            })
        }

        if (!moduleId) {
            return res.status(400).json({
                message: `Missing required Params: moduleId`
            })
        }

        if (!chapterId) {
            return res.status(400).json({
                message: `Missing required Params: chapterId`
            })
        }
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const moduleIndex = course.modules.findIndex(
            (module) => module._id.toString() === moduleId
        );

        if (moduleIndex === -1) {
            return res.status(404).json({ message: "Module not found" });
        }

        const module = course.modules[moduleIndex];

        const chapterIndex = module.chapters.findIndex(
            (chapter) => chapter._id.toString() === chapterId
        );

        if (chapterIndex === -1) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        // Update the chapter status to "deleted"
        module.chapters[chapterIndex].status = "Deleted";

        // Save the updated course
        await course.save();

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}:${moduleId}`)

        res.json({ message: "Chapter removed from module" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Add a chapter from an existing module (ADMIN)
const add_chapter = async (req, res) => {
    const user = req.user;
    console.log("user", user)

    const { courseId, moduleId } = req.params;
    const { name, url, status } = req.body

    try {

        if (!courseId) {
            return res.status(400).json({
                message: `Missing required Params: courseId`
            })
        }

        if (!moduleId) {
            return res.status(400).json({
                message: `Missing required Params: moduleId`
            })
        }

        const course = await Course.findById(courseId);
        const beforeChangesofCourse = JSON.parse(JSON.stringify(course.toObject()));

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const moduleIndex = course.modules.findIndex(
            (module) => module._id.toString() === moduleId
        );

        if (moduleIndex === -1) {
            return res.status(404).json({ message: "Module not found" });
        }

        const module = course.modules[moduleIndex];


        // Check if name and url are unique within chapters array
        const isDuplicateChapter = module.chapters.some(
            (chapter) => chapter.name === name || chapter.url === url
        );

        if (isDuplicateChapter) {
            return res.status(400).json({
                message: "Chapter with this name already exists"
            });
        }

        // Add the new chapter to the chapters array
        module.chapters.push({ name, url, status, order: module.chapters.length > 0 ? module.chapters.length + 1 : 1 });


        const logPayload = {
            title: "add chapter",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: beforeChangesofCourse,
            afterChanges: course
        }
        await createLog(logPayload)
        // Save the updated course
        await course.save();

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}:${moduleId}`)

        res.json({ message: "Chapter added to modules successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Edit a chapter in an existing module (ADMIN)
const edit_chapter = async (req, res) => {
    const user = req.user;
    console.log("user", user)
    const { courseId, moduleId, chapterId } = req.params;
    const { name, url, status } = req.body;

    try {
        if (!courseId || !moduleId || !chapterId) {
            return res.status(400).json({
                message: `Missing required parameters: courseId, moduleId, or chapterId`
            });
        }

        const course = await Course.findById(courseId);
        const beforeChangesofCourse = JSON.parse(JSON.stringify(course.toObject()));

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const moduleIndex = course.modules.findIndex(
            (module) => module._id.toString() === moduleId
        );

        if (moduleIndex === -1) {
            return res.status(404).json({ message: "Module not found" });
        }

        const module = course.modules[moduleIndex];

        const chapterIndex = module.chapters.findIndex(
            (chapter) => chapter._id.toString() === chapterId
        );

        if (chapterIndex === -1) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        const chapter = module.chapters[chapterIndex];

        // Check if name or url already exists in other chapters
        const isDuplicateChapter = module.chapters.some(
            (ch, index) => (ch.name === name || ch.url === url) && index !== chapterIndex
        );

        if (isDuplicateChapter) {
            return res.status(400).json({
                message: "Chapter with this name already exists"
            });
        }

        // Update the chapter with the provided data
        if (name) {
            chapter.name = name;
        }

        if (url) {
            chapter.url = url;
        }

        if (status) {
            chapter.status = status;
        }


        const logPayload = {
            title: "update chapter",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: beforeChangesofCourse,
            afterChanges: course
        }
        await createLog(logPayload)
        // Save the updated course
        await course.save();

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}:${moduleId}`)

        res.json({ message: "Chapter updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


// GET all courses with pagination and filters 
const get_all_course = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
  
    try {
      const filter = {};
      if (status && status !== "Deleted") {
        filter.status = status;
      } else {
        filter.status = { $ne: "Deleted" };
      }
  
      const cacheKey = `courses:${page}:${limit}:${status || 'all'}:${search || 'all'}`;
  
      // Check Redis cache first
      redis.get(cacheKey, async (err, cachedData) => {
        if (err) throw err;
  
        if (cachedData) {
          // Send response with cached data
          return res.status(200).json(JSON.parse(cachedData));
        } else {
          // Fetch data from MongoDB
          let count;
          let courses;
          let searchFilter = filter;
  
          if (search) {
            const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(sanitizedSearch.length === 1 ? `^${sanitizedSearch}` : sanitizedSearch, "i");
  
            searchFilter = {
              $or: [{ name: { $regex: regex } }],
              ...filter,
            };
          }
  
          count = await Course.countDocuments(searchFilter);
          const totalPages = Math.ceil(count / limit);
          const skip = (page - 1) * limit;
  
          courses = await Course.find(searchFilter)
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })
            .populate("courseCategoryIds");
  
          courses = courses.map((course) => ({
            ...course.toObject(),
            activeModuleCount: course.modules.filter((module) => module.status === "Active").length,
          }));
  
          const result = {
            courses,
            currentPage: page,
            limit: limit,
            totalPages: totalPages,
            totalCourses: count,
          };
  
          // Cache the result in Redis
          redis.set(cacheKey, JSON.stringify(result));
  
          return res.status(200).json(result);
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };
  



// GET Course Details by courseId
const course_detail = async (req, res) => {
    const { courseId } = req.params;
  
    try {
      const cacheKey = `courseDetail:${courseId}`;
  
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
          const course = await Course.findById(courseId).lean();
  
          if (!course) {
            return res.status(404).json({ message: "Course not found" });
          }
  
          course.modules.forEach((module) => {
            module.activeChapterCount = module.chapters.filter((chapter) => chapter.status === "Active").length;
          });
  
          course.modules = course.modules.filter((module) => module.status !== "Deleted");
          course.modules.sort((a, b) => a.order - b.order);
  
          const result = {
            message: "Course details successfully retrieved",
            course: course,
          };
          redis.set(cacheKey, JSON.stringify(result));
  
          return res.status(200).json(result);
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };



// delete a course and also lesson which are relate to that course
const delete_course = async (req, res) => {
    const user = req.user;
    console.log("user", user)
    const courseId = req.params.courseId;

    try {

        const course = await Course.findById(courseId)
        const beforeChangesofCourse = JSON.parse(JSON.stringify(course.toObject()));
        // Update the status of the course to "Deleted"
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    status: "Deleted",
                    "modules.$[].status": "Deleted",
                    "modules.$[].chapters.$[].status": "Deleted"
                }
            },
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        const logPayload = {
            title: "delete course",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: beforeChangesofCourse,
            afterChanges: updatedCourse
        }
        await createLog(logPayload)



        // Update the status of all related lessons to "Deleted"
        await Lesson.updateMany(
            { courseId },
            { $set: { status: "Deleted" } }
        );
        // Update the status of all related topics to "Deleted"
        await Topic.updateMany(
            { courseId },
            { $set: { status: "Deleted" } }
        );
        // Update the status of all related questions to "Deleted"
        await Question.updateMany(
            { courseId },
            { $set: { status: "Deleted" } }
        );

        
        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)

        return res.status(200).json({ message: "Course and related childs marked as deleted" });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// update course status from parents to it's child
const update_course_status = async (req, res) => {
    const user = req.user;
    console.log("user", user)

    const courseId = req.params.courseId;
    const status = req.body.status



    try {
        if (!courseId) {
            return res.status(400).json({
                message: `Missing required Params: courseId`
            })
        }

        if (!status) {
            return res.status(400).json({
                message: "Missing required fields: status"
            })
        }

        if (
            status !== "Active" &&
            status !== "Inactive" &&
            status !== "Retire" &&
            status !== "Archive"
        ) {
            return res.status(400).json({
                message: "Please write any valid status"
            })
        }

        const course = await Course.findById(courseId)
        const beforeChangesofCourse = JSON.parse(JSON.stringify(course.toObject()));
        // Update the status of the course to "Deleted"
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    status: status,
                    "modules.$[].status": status,
                    "modules.$[].chapters.$[].status": status
                }
            },
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        const logPayload = {
            title: "change status of course",
            changeTime: new Date(),
            changeBy: {
                refId: user.user_id,
                name: user.name,
                email: user.email,
                phoneNo: user.phone,
            },
            beforeChanges: beforeChangesofCourse,
            afterChanges: updatedCourse
        }
        await createLog(logPayload)

        // Update the status of all related lessons to "Deleted"
        await Lesson.updateMany(
            { courseId },
            { $set: { status: status } }
        );

        // Update the status of all related topics to "Deleted"
        await Topic.updateMany(
            { courseId },
            { $set: { status: status } }
        );
        // Update the status of all related questions to "Deleted"
        await Question.updateMany(
            { courseId },
            { $set: { status: status } }
        );

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}`)

        return res.status(200).json({ message: `Course and related childs marked as ${status}` });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// getting course details structure
const course_detail_structure = async (req, res) => {
    const { courseId } = req.params;
  
    try {
  
          const course = await Course.findById(courseId).populate('courseCategoryIds').lean();
  
          if (!course) {
            return res.status(404).json({ message: "Course not found" });
          }
  
          const activeModules = course.modules
            .filter((module) => module.status === "Active")
            .sort((a, b) => a.order - b.order);
  
          const modulePromises = activeModules.map(async (module) => {
            const activeChapters = module.chapters
              .filter((chapter) => chapter.status === "Active")
              .sort((a, b) => a.order - b.order);
  
            const chapterPromises = activeChapters.map(async (chapter) => {
              const filter = {
                courseId: course._id,
                moduleId: module._id,
                chapterId: chapter._id,
              };
              const lessons = await Lesson.find(filter, '-contents').sort({ order: 1 }).lean();
  
              const activeLessons = lessons.filter((lesson) => lesson.status === "Active");
  
              const questionPromises = activeLessons.map(async (lesson) => {
                const filter = {
                  lessonId: lesson._id,
                  status: "Active",
                };
                const questions = await Question.find(filter).sort({ order: 1 }).lean();
                lesson.totalQuestions = questions.length;
              });
  
              await Promise.all(questionPromises);
              chapter.lessons = activeLessons;
            });
  
            await Promise.all(chapterPromises);
            module.chapters = activeChapters;
          });
  
          await Promise.all(modulePromises);
  
          const result = {
            message: "Course details obtained successfully",
            course: {
              ...course,
              modules: activeModules,
            },
          };
  
       
  
          return res.status(200).json(result);
    
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };
  



// GET all active courses with pagination and filters (From Student POV)
const get_all_active_course = async (req, res) => {
    try {
      const cacheKey = 'coursesactiveWithCategories';
  
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
          const categories = await CourseCategory.find().lean();
  
          const coursesWithCategories = await Promise.all(
            categories.map(async (category) => {
              const courses = await Course.find({
                courseCategoryIds: category._id,
                status: "Active",
              }).lean();
  
              return {
                _id: category._id,
                category: category.name,
                courses: courses,
              };
            })
          );
  
          const totalCourseSet = new Set();
  
          coursesWithCategories.forEach(categoryWithCourse => {
            categoryWithCourse.courses.forEach(course => {
              totalCourseSet.add(course._id.toString());
            });
          });
  
          const result = {
            message: "Got course with categories successfully",
            totalcourses: totalCourseSet.size,
            coursesWithCategories: coursesWithCategories
          };
  
          redis.set(cacheKey, JSON.stringify(result));
  
          return res.status(200).json(result);
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

// GET all standalone active courses with pagination and filters (From Student POV)
const get_all_standalone_active_course = async (req, res) => {
    try {
    //   const cacheKey = 'coursesActiveStandalone';
  
    //   redis.get(cacheKey, async (err, cachedData) => {
    //     if (err) {
    //       return res.status(500).json({
    //         message: "Redis error",
    //         error: err.message,
    //       });
    //     }
  
    //     if (cachedData) {
    //       return res.status(200).json(JSON.parse(cachedData));
    //     } else {
          const courses = await Course.find({ status: "Active" }).lean();
  
          const totalCourseSet = new Set(courses.map(course => course._id.toString()));
  
          const result = {
            message: "Got course with active status",
            totalcourses: totalCourseSet.size,
            course: courses
          };
  
        //   redis.set(cacheKey, JSON.stringify(result));
  
          return res.status(200).json(result);
    //     }
    //   });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

// update module status from parents to it's child
const update_module_status = async (req, res) => {
    const courseId = req.params.courseId;
    const moduleId = req.params.moduleId
    const status = req.body.status

    try {
        if (!courseId) {
            return res.status(400).json({
                message: `Missing required Params: courseId`
            })
        }

        if (!status) {
            return res.status(400).json({
                message: "Missing required fields: status"
            })
        }

        if (
            status !== "Active" &&
            status !== "Inactive" &&
            status !== "Retire" &&
            status !== "Archive"
        ) {
            return res.status(400).json({
                message: "Please write any valid status"
            })
        }

        // Update the status of the course to "Deleted"
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    "modules.$[module].status": status,
                    "modules.$[module].chapters.$[].status": status
                }
            },
            {
                new: true,
                arrayFilters: [
                    { "module._id": moduleId }
                ]
            }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Update the status of all related lessons 
        await Lesson.updateMany(
            { courseId, moduleId },
            { $set: { status: status } }
        );

        // Update the status of all related topics 
        await Topic.updateMany(
            { courseId, moduleId },
            { $set: { status: status } }
        );
        // Update the status of all related questions
        await Question.updateMany(
            { courseId, moduleId },
            { $set: { status: status } }
        );

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}:${moduleId}`)

        return res.status(200).json({ message: `Module and related childs marked as ${status}` });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// update chapter status from parents to it's child
const update_chapter_status = async (req, res) => {
    const courseId = req.params.courseId;
    const moduleId = req.params.moduleId
    const chapterId = req.params.chapterId
    const status = req.body.status

    try {
        if (!courseId) {
            return res.status(400).json({
                message: `Missing required Params: courseId`
            })
        }
        if (!moduleId) {
            return res.status(400).json({
                message: `Missing required Params: moduleId`
            })
        }
        if (!chapterId) {
            return res.status(400).json({
                message: `Missing required Params: chapterId`
            })
        }

        if (!status) {
            return res.status(400).json({
                message: "Missing required fields: status"
            })
        }

        if (
            status !== "Active" &&
            status !== "Inactive" &&
            status !== "Retire" &&
            status !== "Archive"
        ) {
            return res.status(400).json({
                message: "Please write any valid status"
            })
        }

        // Update the status of the course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    "modules.$[module].chapters.$[chapter].status": status
                }
            },
            {
                new: true,
                arrayFilters: [
                    { "module._id": moduleId },
                    { "chapter._id": chapterId }
                ]
            }
        );


        if (!updatedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Update the status of all related lessons 
        await Lesson.updateMany(
            { courseId, moduleId, chapterId },
            { $set: { status: status } }
        );

        // Update the status of all related topics 
        await Topic.updateMany(
            { courseId, moduleId, chapterId },
            { $set: { status: status } }
        );
        // Update the status of all related questions
        await Question.updateMany(
            { courseId, moduleId, chapterId },
            { $set: { status: status } }
        );

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}:${moduleId}`)

        return res.status(200).json({ message: `Chapters and related childs marked as ${status}` });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// GET all courses with pagination and filters 
const get_all_course_for_filter = async (req, res) => {
    const search = req.query.search;

    try {

        let courses;
        if (search) {
            let regex;
            if (search.length === 1) {
                // If search query is a single alphabet, search for all courses with names that start with the alphabet
                regex = new RegExp(`^${search}`, 'i');
            } else {
                // If search query is more than one alphabet, use text search to find courses
                regex = new RegExp(search, 'i');
            }

            courses = await Course.find(
                {
                    $or: [
                        { name: { $regex: regex } },
                    ],
                },
                '_id name' // Specify the fields you want to retrieve
            ).sort({ _id: -1 });

        } else {
            // If no search keyword, use regular find method with filters
            courses = await Course.find({}, '_id name').sort({ _id: -1 }); // Populate the courseCategoryIds field
        }

        return res.status(200).json({
            message: "Got course list for filter succuessfully",
            courses: courses,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// GET all module by courseId
const get_all_module_by_courseId = async (req, res) => {
    const { courseId } = req.params;
    const search = req.query.search;
  
    try {
      const cacheKey = `modules:${courseId}:${search || 'all'}`;
  
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
          const course = await Course.findOne({ _id: courseId }).lean();
  
          if (!course) {
            return res.status(404).json({
              message: "Course not found",
            });
          }
  
          let modules = [];
          const regex = search ? new RegExp(search.length === 1 ? `^${search}` : search, "i") : null;
  
          modules = course.modules
            .filter(module => module.status !== "Deleted" && (!search || regex.test(module.name)))
            .map(module => ({ _id: module._id, name: module.name, order: module.order }));
  
          const result = {
            message: "Got module list for courseId successfully",
            modules: modules,
          };
  
          redis.set(cacheKey, JSON.stringify(result));
  
          return res.status(200).json(result);
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

// GET all Chapter by courseId and moduleId
const get_all_chapter_by_courseId_and_moduleId = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const search = req.query.search;
  
    try {
      const cacheKey = `courses:chapters_${courseId}:${moduleId}:${search || 'all'}`;
  
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
          const course = await Course.findOne({ _id: courseId }).lean();
  
          if (!course) {
            return res.status(404).json({
              message: "Course not found",
            });
          }
  
          const module = course.modules.find(module => module._id.toString() === moduleId);
  
          if (!module) {
            return res.status(404).json({
              message: "Module not found",
            });
          }
  
          let chapters = [];
          const regex = search ? new RegExp(search, "i") : null;
  
          chapters = module.chapters
            .filter(chapter => chapter.status !== "Deleted" && (!search || regex.test(chapter.name)))
            .map(async chapter => {
              const activeLessonsCount = await Lesson.countDocuments({
                chapterId: chapter._id,
                status: "Active",
              });
  
              return {
                _id: chapter._id,
                name: chapter.name,
                url: chapter.url,
                status: chapter.status,
                order: chapter.order,
                activeLessonsCount,
              };
            });
  
          chapters = await Promise.all(chapters);
          chapters.sort((a, b) => a.order - b.order);
  
          const result = {
            message: "Got chapter list for courseId and moduleId successfully",
            chapters: chapters,
          };
  
          redis.set(cacheKey, JSON.stringify(result));
  
          return res.status(200).json(result);
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };



//Update Module Position
const Update_module_position = async (req, res) => {


    let updatedModule = req.body

    const { courseId } = req.params;

    try {

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        course.modules.map((e) => {
            let order = 0
            for (let i = 0; i < updatedModule.length; i++) {
                if (updatedModule[i]._id == e._id) {
                    order = i
                    break;
                }
            }
            e.order = order + 1
        })


        const update_position = await course.save()

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}`)


        return res.status(200).json({
            message: "updated",
            update_position
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

//Update chapter Position
const Update_chapter_position = async (req, res) => {

    let updatedChapter = req.body

    const { courseId, moduleId } = req.params;

    try {

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const moduleIndex = course.modules.findIndex(
            (module) => module._id.toString() === moduleId
        );

        if (moduleIndex === -1) {
            return res.status(404).json({ message: "Module not found" });
        }

        const module = course.modules[moduleIndex];

        module.chapters.map((e) => {
            let order = 0
            for (let i = 0; i < updatedChapter.length; i++) {
                if (updatedChapter[i]._id == e._id) {
                    order = i
                    break;
                }
            }
            e.order = order + 1
        })

        const update_position = await course.save()
        console.log(update_position)

        deleteCourseCache('courses')
        deleteCourseCache(`courseDetail:${courseId}`)
        deleteCourseCache(`modules:${courseId}`)
        deleteCourseCache(`courses:chapters_${courseId}:${moduleId}`)

        return res.status(200).json({
            message: "updated",
            update_position
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};



const files_upload = async (req, res) => {
    try {

        const files = req.files || [];

        console.log("files", files)

        if (files.length > 0) {
            console.log(files)
            const filesWithUrl = await files?.map((file, index) => {
                const fileIndex = files[index]

                console.log("file", fileIndex)
                const imageUrl = fileIndex.location;
                return { url: imageUrl };

            })

            return res.status(201).json({
                message: "Files uploaded sucessfully",
                filesWithUrl: filesWithUrl,
            });

        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = {
    create_course,
    add_new_module,
    update_existing_module,
    edit_course,
    remove_module,
    get_all_course,
    course_detail,
    delete_course,
    update_course_status,
    remove_chapter,
    course_detail_structure,
    get_all_active_course,
    update_module_status,
    update_chapter_status,
    get_all_course_for_filter,
    get_all_module_by_courseId,
    get_all_chapter_by_courseId_and_moduleId,
    add_chapter,
    edit_chapter,
    Update_module_position,
    Update_chapter_position,
    get_all_standalone_active_course,
    files_upload
}