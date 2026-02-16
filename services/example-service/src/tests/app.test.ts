import request from 'supertest';
import app from '../app';

describe('App Endpoints', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'OK', service: 'example-service' });
  });
});
