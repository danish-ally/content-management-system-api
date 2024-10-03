const router = require("express").Router();
const courseController = require("../controller/v1/CourseController");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const client = require("../../common/config/awsConfig");
const multerS3 = require("multer-s3");
const auth = require("../../middleware/auth");

const BUCKET = process.env.BUCKET;

const upload = multer({
  storage: multerS3({
    s3: client,
    bucket: BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `upload/images/${file.fieldname}-${Date.now()}${ext}`); // Adjust the key as needed
    }, fileFilter: (req, file, cb) => {

      cb(null, true);
    },
  })
});

// From ADMIN POV
router.post(
  "/",
  upload.fields([
    { name: "bannersImage", maxCount: 3 },
    { name: "profileImage", maxCount: 1 },
  ]),

  auth,

  courseController.create_course
);
router.post(
  "/:courseId/modules",
  upload.single("logo"),
  auth,
  courseController.add_new_module
);
router.put(
  "/:courseId/module/:moduleId",
  upload.single("logo"),
  auth,
  courseController.update_existing_module
);
router.put(
  "/:courseId",
  upload.fields([
    { name: "bannersImage", maxCount: 3 },
    { name: "profileImage", maxCount: 1 },
  ]),
  auth,
  courseController.edit_course
);
router.delete("/:courseId/module/:moduleId", courseController.remove_module);
router.get("/", courseController.get_all_course);
router.get("/:courseId/details", courseController.course_detail);
router.delete("/:courseId", auth, courseController.delete_course);
router.patch("/:courseId/status", auth, courseController.update_course_status);
router.patch(
  "/:courseId/module/:moduleId/status",
  courseController.update_module_status
);
router.patch(
  "/:courseId/module/:moduleId/chapter/:chapterId/status",
  courseController.update_chapter_status
);
router.delete(
  "/:courseId/module/:moduleId/chapter/:chapterId",
  courseController.remove_chapter
);
router.post(
  "/:courseId/module/:moduleId/chapter/add",
  auth,
  courseController.add_chapter
);
router.put(
  "/:courseId/module/:moduleId/chapter/:chapterId/edit",
  auth,
  courseController.edit_chapter
);
router.get("/filter", courseController.get_all_course_for_filter);
router.get(
  "/:courseId/modules/all",
  courseController.get_all_module_by_courseId
);
router.get(
  "/:courseId/module/:moduleId/chapters/all",
  courseController.get_all_chapter_by_courseId_and_moduleId
);

// From Student POV
router.get("/:courseId/details/user", courseController.course_detail_structure);
router.get("/active", courseController.get_all_active_course);
router.get(
  "/standalone/active",
  courseController.get_all_standalone_active_course
);

//Update Position
router.post("/:courseId/updated", courseController.Update_module_position);
router.post(
  "/:courseId/:moduleId/updatechapterposition",
  courseController.Update_chapter_position
);


router.post(
  "/files/upload",
  upload.array("files", 10),
  courseController.files_upload
);

module.exports = router;
