const router = require("express").Router();
const quesionController = require('../controller/v1/QuestionController');
const path = require('path');
const multer = require('multer')
const multerS3 = require("multer-s3");
const client = require("../../common/config/awsConfig");
const auth = require("../../middleware/auth");


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/uploads/question-files');
//     },
//     filename: function (req, file, cb) {
//         const ext = path.extname(file.originalname);
//         cb(null, `${file.fieldname}-${Date.now()}${ext}`);
//     },
// });

// const upload = multer({ storage: storage })

const BUCKET = process.env.BUCKET;

const upload = multer({
  storage: multerS3({
    s3: client,
    bucket: BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `upload/question-files/${file.fieldname}-${Date.now()}${ext}`); // Adjust the key as needed
    },fileFilter: (req, file, cb) => {
        
        cb(null, true);
    },
  })
});

router.post("/course/:courseId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/add", upload.fields([
    { name: 'questionFiles' },
    { name: 'optionsFiles' }
]), auth, quesionController.add_question);
router.put("/:questionId", upload.fields([
    { name: 'questionFiles' },
    { name: 'optionsFiles' }
]), auth, quesionController.edit_question);
router.delete("/:questionId/remove", quesionController.remove_question);
router.get("/lesson/:lessonId/all", quesionController.get_all_question);
// router.put("/:questionId/option/:optionId/edit", upload.array('files'), quesionController.edit_option);




module.exports = router;