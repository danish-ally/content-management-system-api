const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../app')

chai.should()
chai.use(chaiHttp)



describe('Course Category unit testing ⤵️', function () {
    describe('POST Method Unit Testing', () => {
        it('Add Course Catgory', (done) => {

            const newCourseCategory = {
                "name": "Data Science",
                "logo": "https://example.com/data-science-logo.png",
                "urlMask": "data-science",
                "instructions": {
                    "readingHours": "30",
                },
                "description": "Learn the fundamentals of data science and data analysis",
                "publish": true
            }




            chai.request(server).post('/api/course-categories').send(newCourseCategory).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(201);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('courseCategory')
                    done()
                }
            })
        })
    })
    describe('GET Method Unit Testing', () => {
        it('Get All Course Category', (done) => {


            chai.request(server).get('/api/course-categories').end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('courseCatgories')
                    response.body.should.have.property('currentPage')
                    response.body.should.have.property('limit')
                    response.body.should.have.property('totalPages')
                    response.body.should.have.property('totalCategories')
                    done()
                }
            })
        })
    })
    describe('PATCH Method Unit Testing', () => {
        it('Update Course Category', (done) => {

            const courseCategoryId = "6433b9e24e7a8745818a5c6a"

            const updatedCourseCatgory = {
                "instructions": {
                    "readingHours": "15"
                }
            }
            chai.request(server).patch('/api/course-categories/' + courseCategoryId).send(updatedCourseCatgory).end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                    response.body.should.have.property('courseCategory')

                    done()
                }
            })
        })
    })
    describe('DELETE Method Unit Testing', () => {
        it('delete Course Category', (done) => {

            const courseCategoryId = "642fa9a12c4a783ccdb220e3"

            chai.request(server).delete('/api/course-categories/' + courseCategoryId + '/delete/').end((err, response) => {
                if (err) {
                    console.log(err)
                    done(err)

                } else {
                    response.should.have.status(200);
                    response.body.should.be.a('object')
                    response.body.should.have.property("message").eql("Course category removed");
                    done()
                }
            })
        })
    })
})