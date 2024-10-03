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

describe('Topic unit testing ⤵️', function () {
    describe('POST Method Unit Testing', () => {
        it('Add Topic', (done) => {

            const newTopic = {
                "name": "Introduction to JavaScript",
                "url": "javascript-intro",
            }

            const courseId = "643cce32e7a337f02a41b194"
            const moduleId = ""
            const chapterId = ""
            const lessonId = ""

            chai.request(server).post(`/api/v1/topic/course/${courseId}/module/${moduleId}/chapter/${chapterId}/lesson/${lessonId}`).send(newTopic).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(201);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('topic')
                    done()
                }
            })
        })
    })
    describe('PUT Method Unit Testing', () => {
        it('Edit Topic', (done) => {

            const topicId = "643f8a64dcf08cd0800434b4"

            const updateTopic = {
                "name": "Introduction to JavaScript updated",
            }


            chai.request(server).put(`/api/v1/topic/${topicId}`).send(updateTopic).end((err, response) => {
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
    describe('DELETE Method Unit Testing', () => {
        it('Remove Topic with PATCH method', (done) => {

            const topicId = ""
            chai.request(server).delete(`/api/v1/topic/${topicId}/remove`).end((err, response) => {
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
        it('Get All Topic', (done) => {

            chai.request(server).get('/api/topic/').end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('topics')
                    response.body.should.have.property('currentPage')
                    response.body.should.have.property('totalPages')
                    response.body.should.have.property('totalTopics')
                    done()
                }
            })
        })
        it('Get All Topic By Lesson Id', (done) => {

            const lessonId = "6450e849d90f30c998d48ac5"

            chai.request(server).get('/api/topic/lesson/' + { lessonId }).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('topics')
                    response.body.should.have.property('currentPage')
                    response.body.should.have.property('limit')
                    response.body.should.have.property('totalPages')
                    response.body.should.have.property('totalTopics')
                    done()
                }
            })
        })
        it('Get All Content By Topic Id', (done) => {

            const topicId = "646b1e3c85e94e5d3124df78"

            chai.request(server).get('/api/topic/' + { topicId } + 'content/all').end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('content')
                    done()
                }
            })
        })
    })
})