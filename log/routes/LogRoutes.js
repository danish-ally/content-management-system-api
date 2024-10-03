const router = require("express").Router();
const logController = require('../controllers/v1/LogController');


router.get("/:courseId", logController.get_all_log_by_courseId);





module.exports = router;