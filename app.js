const path = require('path');
require('dotenv').config();
const mongoose = require("mongoose");
const { port } = require("./common/config/key")
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJSDocs = YAML.load("./api.yaml");
const courseRoutes = require("./course/routes/CourseRoutes");
const courseCategoryRoutes = require("./course-category/routes/CourseCategoryRoutes");
const lessonRoutes = require("./lesson/routes/LessonRoutes")
const topicRoutes = require("./topic/routes/TopicRoutes")
const questionRoutes = require("./question/routes/QuestionRoutes")
const PageRoutes = require("./Pages/routes/pagesRotes")
const LogRoutes = require("./log/routes/LogRoutes")
const bodyParser = require('body-parser');



// configure env file
// if (process.env.NODE_ENV === 'production') {
//     dotenv.config({ path: '.env.production' });
// } else if (process.env.NODE_ENV === 'staging') {
//     console.log("inside staging")
//     dotenv.config({ path: '.env.staging' });
// } else if (process.env.NODE_ENV === 'uat') {
//     dotenv.config({ path: '.env.uat' });
// } else {
//     dotenv.config({ path: '.env.development' });
// }



const app = express();


app.use(logger('dev'));
app.use(bodyParser.json({ limit: '100mb' }));  // 100 MB limit

// Setting a high limit for URL-encoded body
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


// Swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));

// Routes
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/course-categories", courseCategoryRoutes);
app.use("/api/v1/lesson", lessonRoutes);
app.use("/api/v1/topic", topicRoutes);
app.use("/api/v1/question", questionRoutes);
app.use("/api/v1/pages",PageRoutes);
app.use("/api/v1/log", LogRoutes)



mongoose
    .connect(process.env.DATABASE_ACCESS, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        family: 4,
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 20000,
    })
    .then(() =>
        console.log("Database Connected! ✅"))
    .catch((err) => console.log(err));

app.listen(port, () => {
    console.log(`Server listening on ${port} ✅`);
    console.log("You can have Api docs from here ➡️  http://localhost:5000/api-docs/ and after clicking on this link select HTTP")
});


module.exports = app;




