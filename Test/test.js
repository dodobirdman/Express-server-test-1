const assert = require('assert');
const request = require('supertest');
const app = require('../app');

describe('Login endpoint', () => {
    it('should return status 401 if username or password is empty', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: '', password: '' });

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.text, 'Invalid username or password');
    });

    it('should return "Login successful!" if username and password are correct', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'test', password: 'test' });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.text, 'Login successful!');
    });

    it('should return status 401 if username is correct but password is incorrect', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'test', password: 'incorrectPassword' });

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.text, 'Invalid username or password');
    });

    it('should return status 401 if username is incorrect but password is correct', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'incorrectUsername', password: 'test' });

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.text, 'Invalid username or password');
    });

    it('should return status 401 if both username and password are incorrect', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'incorrectUsername', password: 'incorrectPassword' });

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.text, 'Invalid username or password');
    });
});
