import request from 'supertest';
import app from '../server.js';

describe('Health endpoint', () => {
  it('GET /health returns 200 and expected payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
  });
});
