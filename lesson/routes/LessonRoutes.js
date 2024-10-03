const router = require("express").Router();
const lessonController = require('../controller/v1/LessonController');
const path = require('path');
const multer = require('multer')
const multerS3 = require("multer-s3");
const client = require("../../common/config/awsConfig");
const auth = require("../../middleware/auth");




const BUCKET = process.env.BUCKET;

const upload = multer({
  storage: multerS3({
    s3: client,
    bucket: BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `upload/files/${file.fieldname}-${Date.now()}${ext}`); // Adjust the key as needed
    },fileFilter: (req, file, cb) => {
        
        cb(null, true);
    },
  })
});

router.post("/course/:courseId", upload.array('files'), auth, lessonController.add_lesson);
router.put("/:lessonId/course/:courseId", upload.array('files'), auth, lessonController.update_lesson);
router.get("/", lessonController.get_all_lesson);
router.delete("/:lessonId/remove", lessonController.remove_lesson);
router.delete("/:lessonId/content/:contentId/delete", lessonController.delete_content);
router.put("/:lessonId/content/:contentId/edit", upload.array('files'), lessonController.edit_content);
router.post("/:lessonId/content/add", upload.array('files'), lessonController.add_content);
router.put("/:lessonId/content/changeOrder", lessonController.changeContentOrderByLessonId);
router.get("/:lessonId/contents", lessonController.getAllContentByLessonId);


router.patch("/updatelesson", lessonController.update_lesson_position);


module.exports = router;