const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../app')
const mongoose = require('mongoose');
chai.should()
chai.use(chaiHttp)


before(async () => {
    
    await mongoose.connect(process.env.DATABASE_ACCESS, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

after(async () => {
    await mongoose.disconnect();
});

describe('Course unit testing ⤵️', function () {
    describe('POST Method Unit Testing', () => {
        it('Add Course', (done) => {

            const newCourse = {
                "name": "Intermediate Python",
                "url": "intermediate-python",
                "code": "PY201",
                "refCode": "PY201-01",
                "appId": "6175f5a731ec5c5d411d9431",
                "courseCategoryId": "2a3f508b367d5b5e5c5a5f5c",
                "isPaid": true,
                "level": "Intermediate",
                "plans": {
                    "monthly": 12.99,
                    "quarterly": 34.99,
                    "yearly": 119.99
                },
                "description": {
                    "intro": "This course will help you build upon your foundational Python knowledge.",
                    "details": "You'll learn about object-oriented programming, file input/output, error handling, and more."
                },
                "instructions": {
                    "readingHours": "10"
                },
                "pictures": {
                    "banners": [
                        {
                            "imageName": "banner-3.jpg",
                            "heading": "Take Your Python Skills to the Next Level",
                            "path": "/images/banners/banner-3.jpg"
                        },
                        {
                            "imageName": "banner-4.jpg",
                            "heading": "Become an Intermediate Python Developer",
                            "path": "/images/banners/banner-4.jpg"
                        }
                    ],
                    "profile": {
                        "imageName": "profile2.jpg",
                        "icon": "/images/profiles/profile2.jpg"
                    }
                },
                "status": "Active"
            }



            chai.request(server).post('/api/v1/course').send(newCourse).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(201);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('course')
                    response.body.should.have.property('course').that.is.an('object');
                    done()
                }
            })
        })
        it('Add Module By CourseId', (done) => {

            const courseId = "643cce32e7a337f02a41b194"

            const newModule = {
                "name": "Module B",
                "url": "module-b",
                "details": "This is Module B",
                "logo": "https://logo.png",
                "instructions": {
                    "readingHours": "1"
                }
            }


            chai.request(server).post(`/api/v1/course/${courseId}/modules`).send(newModule).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(201);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('course')
                    response.body.should.have.property('course').that.is.an('object');
                    done()
                }
            })
        })
        it('Add chapter by Module Id and CourseId', (done) => {

            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = ""

            const newChapter = {
                "name": "Chapter A",
                "url": "chapter-a",
            }


            chai.request(server).post(`/api/v1/course/${courseId}/module/${moduleId}/chapter/add`).send(newChapter).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(201);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
    })
    describe('PUT Method Unit Testing', () => {
        it('Edit Course', (done) => {

            const courseId = "643cce32e7a337f02a41b194"
            const updateCourse = {
                name: "Introduction to JavaScript",
            }

            chai.request(server).put('/api/v1/course/' + courseId).send(updateCourse).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Update Module By ModuleId By CourseId', (done) => {

            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = "643cce93e7a337f02a41b19b"


            const updateModule = {
                "name": "Module A",
            }


            chai.request(server).put(`/api/v1/course/${courseId}/module/${moduleId}`).send(updateModule).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('module')
                    response.body.should.have.property('module').that.is.an('object');
                    done()
                }
            })
        })

        it('Update Chapter By ChapterId, ModuleId By CourseId', (done) => {

            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = "643cce93e7a337f02a41b19b"
            const chapterId = ""

            const updateChapter = {
                "name": "Chapter A",
            }


            chai.request(server).put(`/api/v1/course/${courseId}/module/${moduleId}/chapter/${chapterId}/edit`).send(updateChapter).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
    })
    describe('GET Method Unit Testing', () => {
        it('Get All Course', (done) => {

            chai.request(server).get('/api/v1/course/').end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('courses')
                    response.body.should.have.property('currentPage')
                    response.body.should.have.property('totalPages')
                    response.body.should.have.property('totalCourses')
                    done()
                }
            })
        })
        it('Get Course Details By Id', (done) => {
            const courseId = "643cce32e7a337f02a41b194";
            chai.request(server).get(`/api/v1/course/${courseId}/details`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('course')
                    done()
                }
            })
        })
        it('Get Course Details Structure By Id (From Student pov)', (done) => {
            const courseId = "646337b709e147b5745757a0";
            chai.request(server).get(`/api/v1/course/${courseId}/details/user`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('course')
                    done()
                }
            })
        })
        it('Get Course With Categories (From Student pov)', (done) => {
            chai.request(server).get(`/api/v1/course/active`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('coursesWithCategories')
                    done()
                }
            })
        })
        it('Get All Course For Filter', (done) => {

            chai.request(server).get('/api/v1/course/filter/').end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('courses')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Get All Module By Course Id', (done) => {

            const courseId = ""
            chai.request(server).get('/api/v1/course/' + { courseId } + "modules/all").end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('modules')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Get All Chapters By Course Id and ModuleId', (done) => {

            const courseId = ""
            const moduleId = ""
            chai.request(server).get('/api/v1/course/' + { courseId } + "module" + { moduleId } + "/chapters/all").end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('chapters')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
    })
    describe('PATCH Method Unit Testing', () => {
        it('Update Status Of Course', (done) => {

            const courseId = "643cce32e7a337f02a41b194"
            const status = {
                status: "Inactive",
            }

            chai.request(server).patch('/api/v1/course/' + courseId + '/status').send(status).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Update Status Of Module', (done) => {

            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = ""

            const status = {
                status: "Inactive",
            }

            chai.request(server).patch('/api/v1/course/' + courseId + '/module' + moduleId + '/status').send(status).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Update Status Of Chapter', (done) => {

            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = ""
            const chapterId = ""


            const status = {
                status: "Inactive",
            }

            chai.request(server).patch('/api/v1/course/' + courseId + '/module' + moduleId + '/chapter' + chapterId + '/status').send(status).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Delete Course By courseId', (done) => {
            const courseId = "643cce32e7a337f02a41b194"

            chai.request(server).patch(`/api/v1/course/${courseId}`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Delete Module By courseId and moduleId', (done) => {
            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = "643cee302c1134414df42a73"

            chai.request(server).patch(`/api/v1/course/${courseId}/module/${moduleId}`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Delete Chapter By courseId and moduleId and chapterId', (done) => {
            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = "643cee302c1134414df42a73"
            const chapterId = ""

            chai.request(server).patch(`/api/v1/course/${courseId}/module/${moduleId}/chapter/${chapterId}`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
    })
    describe('DELETE Method Unit Testing', () => {
        it('Delete Course By courseId', (done) => {
            const courseId = "643cce32e7a337f02a41b194"

            chai.request(server).delete(`/api/v1/course/${courseId}`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Delete Module By courseId and moduleId', (done) => {
            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = "643cee302c1134414df42a73"

            chai.request(server).delete(`/api/v1/course/${courseId}/module/${moduleId}`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
        it('Delete Chapter By courseId and moduleId and chapterId', (done) => {
            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = "643cee302c1134414df42a73"
            const chapterId = ""

            chai.request(server).delete(`/api/v1/course/${courseId}/module/${moduleId}/chapter/${chapterId}`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    done()
                }
            })
        })
    })
})