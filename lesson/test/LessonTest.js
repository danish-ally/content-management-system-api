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

describe('Lessons unit testing ⤵️', function () {
    describe('POST Method Unit Testing', () => {
        it('Add Lesson', (done) => {

            const newLesson = {
                "name": "Introduction to JavaScript",
                "url": "javascript-intro",
                "moduleId": "643cf2489ec2836ad4558791",
                "chapterId": "643cf2489ec2836ad4558792",
                "details": "This is the details"
            }

            const courseId = "643cce32e7a337f02a41b194"

            chai.request(server).post(`/api/v1/lesson/course/${courseId}`).send(newLesson).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(201);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('lesson')
                    done()
                }
            })
        })
    })
    describe('PUT Method Unit Testing', () => {
        it('Update Lesson', (done) => {

            const courseId = "643cce32e7a337f02a41b194"
            const lessonId = "643f8a64dcf08cd0800434b4"

            const updateLesson = {
                "name": "Introduction to JavaScript updated",
                "moduleId": "643cf2489ec2836ad4558791",
                "chapterId": "643cf2489ec2836ad4558792"
            }


            chai.request(server).put(`/api/v1/lesson/${lessonId}/course/${courseId}`).send(updateLesson).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('error')
                    response.body.should.have.property('error').eql(false)
                    done()
                }
            })
        })
    })
    describe('GET Method Unit Testing', () => {
        it('Get a list of lessons based on course, module, and chapter filters', (done) => {


            chai.request(server).get(`/api/v1/lesson`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('lessons')
                    done()
                }
            })
        })
    })
    describe('DELETE Method Unit Testing', () => {
        it('Remove Lesson with PATCH method', (done) => {

            const lessonId = ""
            chai.request(server).delete(`/api/v1/lesson/${lessonId}/remove`).end((err, response) => {
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