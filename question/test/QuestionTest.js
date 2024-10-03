const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../app')
const mongoose = require('mongoose');
chai.should()
chai.use(chaiHttp)


before(async () => {
    // mongoServer = await MongoMemoryServer.create();
    // const uri = mongoServer.getUri();
    await mongoose.connect(process.env.DATABASE_ACCESS, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

after(async () => {
    await mongoose.disconnect();
});

describe('Questions unit testing ⤵️', function () {
    describe('POST Method Unit Testing', () => {
        it('Add Question', (done) => {

            const newQuestion = {
                "type": "Multiple Choice",
                "content": "What is the capital of West Bengal?",
                "instruction": "Select the correct answer",
                "options": [
                    {
                        "type": "Choice",
                        "content": "Kolkata",
                        "instruction": "",
                        "isCorrect": true
                    },
                    {
                        "type": "Choice",
                        "content": "Delhi",
                        "instruction": "",
                        "isCorrect": false
                    },
                    {
                        "type": "Choice",
                        "content": "New York",
                        "instruction": "",
                        "isCorrect": false
                    },
                    {
                        "type": "Choice",
                        "content": "Tokyo",
                        "instruction": "",
                        "isCorrect": false
                    }
                ]
            }


            const lessonId = "64548d9258f30743f926de24"

            chai.request(server).post(`/api/v1/question/lesson/${lessonId}/add`).send(newQuestion).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(201);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('savedQuestion')
                    done()
                }
            })
        })
    })
    describe('DELETE Method Unit Testing', () => {
        it('Remove Question with PATCH method', (done) => {

            const questionId = "6454b5d6cbf6fcf780d3faa5"
            chai.request(server).delete(`/api/v1/question/${questionId}/remove`).end((err, response) => {
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
    describe('PUT Method Unit Testing', () => {
        it('Edit Question', (done) => {

            const questionId = "643f8a64dcf08cd0800434b4"

            const updateQuestion = {
                "instruction": "Updated",
            }


            chai.request(server).put(`/api/v1/question/${questionId}`).send(updateQuestion).end((err, response) => {
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
        it('Get All Question', (done) => {

            const lessonId = "64548d9258f30743f926de24"

            chai.request(server).get(`/api/v1/question/lesson/${lessonId}/all`).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('questions')
                    response.body.should.have.property('currentPage')
                    response.body.should.have.property('totalPages')
                    response.body.should.have.property('totalQuestion')
                    done()
                }
            })
        })
    })
})