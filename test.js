let chai = require('chai')
  , chaiHttp = require('chai-http');

const app = require('app.js'); // Adjust the path based on your project structure
const PORT = 4000;

chai.use(chaiHttp);
const expect = chai.expect;

describe('POST /login', function() {
    it('should return "Login successful!" with valid credentials', function(done) {
        chai.request(app)
            .post('/login')
            .send({ username: 'validUsername', password: 'validPassword' })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('Login successful!');
                done();
            });
    });

    it('should return "Invalid username or password" with invalid credentials', function(done) {
        chai.request(app)
            .post('/login')
            .send({ username: 'invalidUsername', password: 'invalidPassword' })
            .end(function(err, res) {
                expect(res).to.have.status(401);
                expect(res.text).to.equal('Invalid username or password');
                done();
            });
    });
});
