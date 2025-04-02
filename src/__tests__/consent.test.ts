// Force provider to something safe
process.env.DB_PROVIDER = 'mongodb';

jest.mock('../auth/verifyIdToken', () => {
  const { testUserId, testUserEmail } = require('./common.data');
  return {
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: testUserId,
      email: testUserEmail,
    }),
  };
});

jest.mock('../database/repositories', () => ({
  getConsentRepository: () => ({
    saveConsent: jest.fn().mockResolvedValue(undefined),
  }),
}));

// import after the mocked functions
import request from 'supertest';
import app from '../app';

describe('POST /api/consent', () => {
  it('should reject invalid provider', async () => {
    const res = await request(app).post('/api/consent').send({
      provider: 'unknown',
      idToken: 'fake',
      sector: 'test',
      serviceUrl: 'https://example.com',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should accept a valid consent (create or update)', async () => {
    const res = await request(app).post('/api/consent').send({
      provider: 'google',
      idToken: 'mock-token',
      sector: 'healthcare',
      serviceUrl: 'https://uhi.example.org',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Consent saved successfully');
  });
});
