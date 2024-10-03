const router = require("express").Router();
const topicController = require('../controllers/v1/TopicController');
const path = require('path');
const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/topic-files');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
});

const upload = multer({ storage: storage })

router.post("/course/:courseId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/add", upload.array('files'), topicController.add_topic);
router.put("/:topicId", upload.array('content'), topicController.edit_topic);
router.delete("/:topicId/remove", topicController.remove_topic);
router.get("/", topicController.get_all_topic);
router.get("/lesson/:lessonId", topicController.get_all_topic_by_lesson_id);
router.get("/:topicId/content/all", topicController.get_all_content_by_topic_id)





module.exports = router;