const CourseCategory = require("../../models/CourseCategory")
const Course = require("../../../course/models/Course");
const createLog = require("../../../log/helpers/createLog");


// CREATE a new course category
const create_course_category = async (req, res) => {
    const user = req.user;
    console.log("user", user)
    try {
        const { name, urlMask, readingHours, description, publish, status } = req.body;
        //------Field Validation Codes Start---------//
        const requiredFields = ["name", "urlMask", "readingHours", "description"];
        const missingFields = requiredFields.filter(field => !(field in req.body));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }



        const existingCourseCategoryUrl = await CourseCategory.find({ urlMask: urlMask })
        const existingCourseName = await CourseCategory.find({ name: name })

        if (existingCourseCategoryUrl.length > 0) {
            return res.status(400).json({ message: 'This course url already used' });
        }
        if (existingCourseName.length > 0) {
            return res.status(400).json({ message: 'This course category name already used' });
        }


        if (req.file) {
            const logo = `${process.env.BASE_URL}/uploads/course-category-files/${req.file.filename}`


            const courseCategory = new CourseCategory({
                name,
                logo: logo,
                urlMask,
                readingHours,
                description,
                publish,
                status
            });
            await courseCategory.save();
            return res.status(201).json({
                message: "Course category created successfully",
                courseCategory: courseCategory,
            });

        } else {

            const courseCategory = new CourseCategory({
                name,
                urlMask,
                readingHours,
                description,
                publish,
                status
            });

            const logPayload = {
                title: "add course category",
                changeTime: new Date(),
                changeBy: {
                    refId: user.user_id,
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phone,
                },
                beforeChanges: {},
                afterChanges: courseCategory
            }
            await createLog(logPayload)
            await courseCategory.save();
            return res.status(201).json({
                message: "Course category created successfully",
                courseCategory: courseCategory,
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// LIST of course category
const list_of_course_category = async (req, res) => {
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

        let count;
        let courseCategories;

        if (search) {

            let regex;
            const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
            if (sanitizedSearch.length === 1) {
                regex = new RegExp(`^${sanitizedSearch}`, 'i');
            } else {
                regex = new RegExp(sanitizedSearch, 'i');
            }

            const searchFilter = {
                $or: [
                    { name: { $regex: regex } }
                ],
                ...filter,
            };

            count = await CourseCategory.countDocuments(searchFilter);
            const totalPages = Math.ceil(count / limit);
            const skip = (page - 1) * limit;

            courseCategories = await CourseCategory.find(searchFilter)
                .skip(skip)
                .limit(limit)
                .sort({ _id: -1 });

            const populatedCourseCategories = await Promise.all(courseCategories.map(async (category) => {
                const courses = await Course.find({ courseCategoryIds: category.id });
                return {
                    ...category.toObject(),
                    courses
                };
            }));

            return res.status(200).json({
                courseCategories: populatedCourseCategories,
                currentPage: page,
                limit: limit,
                totalPages: totalPages,
                totalCategories: count
            });
        } else {
            count = await CourseCategory.countDocuments(filter);
            const totalPages = Math.ceil(count / limit);
            const skip = (page - 1) * limit;

            courseCategories = await CourseCategory.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ _id: -1 });

            const populatedCourseCategories = await Promise.all(courseCategories.map(async (category) => {
                const courses = await Course.find({ courseCategoryIds: category.id });
                return {
                    ...category.toObject(),
                    courses
                };
            }));

            return res.status(200).json({
                courseCategories: populatedCourseCategories,
                currentPage: page,
                limit: limit,
                totalPages: totalPages,
                totalCategories: count
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};



// UPDATE of courseCategory
const update_course_category = async (req, res) => {
    const user = req.user;
    console.log("user", user)
    try {
        const { name, urlMask, readingHours, description, publish, status } = req.body;


        const courseCategoryDetails = await CourseCategory.findById(req.params.courseCategoryId)
        const beforeChangesofCoursecategory = JSON.parse(JSON.stringify(courseCategoryDetails.toObject()));
        if (req.file) {

            const logoUrl = `${process.env.BASE_URL}/uploads/course-category-files/${req.file.filename}`
            const courseCategory = await CourseCategory.findByIdAndUpdate(
                req.params.courseCategoryId,
                { name, logo: logoUrl, urlMask, readingHours, description, publish, status },
                { new: true }
            );



            const logPayload = {
                title: "update course category",
                changeTime: new Date(),
                changeBy: {
                    refId: user.user_id,
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phone,
                },
                beforeChanges: beforeChangesofCoursecategory,
                afterChanges: courseCategory
            }

            await createLog(logPayload)
            res.json({
                message: "Course category updated successfully",
                courseCategory: courseCategory,
            });
        } else {
            const courseCategory = await CourseCategory.findByIdAndUpdate(
                req.params.courseCategoryId,
                { name, urlMask, readingHours, description, publish, status },
                { new: true }
            );

            const logPayload = {
                title: "update course category",
                changeTime: new Date(),
                changeBy: {
                    refId: user.user_id,
                    name: user.name,
                    email: user.email,
                    phoneNo: user.phone,
                },
                beforeChanges: beforeChangesofCoursecategory,
                afterChanges: courseCategory
            }

            await createLog(logPayload)
            res.json({
                message: "Course category updated successfully",
                courseCategory: courseCategory,
            });
        }

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }

};

// REMOVE a course category
const remove_course_category = async (req, res) => {
    try {

        if (!req.params.courseCategoryId) {
            return res.status(400).json({ message: `Missing required params: courseCategoryId` });
        }

        const courseCategory = await CourseCategory.findByIdAndUpdate(
            req.params.courseCategoryId,
            { status: "Deleted" },
            { new: true }
        );
        if (!courseCategory) {
            return res.status(404).json({ message: "Course category not found" });
        }

        res.json({ message: "Course category removed" });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


module.exports = {
    create_course_category,
    list_of_course_category,
    update_course_category,
    remove_course_category
}