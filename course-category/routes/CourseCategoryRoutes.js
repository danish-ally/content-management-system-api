const router = require("express").Router();
const courseCategoryController = require('../controller/v1/CourseCategoryController');
const path = require('path');
const multer = require('multer');
const auth = require("../../middleware/auth");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/course-category-files');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
});

const upload = multer({ storage: storage })

router.post("/", upload.single('logo'), auth, courseCategoryController.create_course_category);
router.patch("/:courseCategoryId", upload.single('logo'), auth , courseCategoryController.update_course_category);
router.delete("/:courseCategoryId/delete", courseCategoryController.remove_course_category);
router.get("/", courseCategoryController.list_of_course_category);




module.exports = router;