const express = require('express');
const request = require('supertest');
const meetingRoutes = require('../_routes');

// Mock the auth middleware
jest.mock('../../../middelwares/auth', () => {
  return (req, res, next) => {
    // Simulate authenticated user
    req.user = { userId: '60d21b4667d0d8992e610c86' };
    next();
  };
});

// Mock the meeting controller
jest.mock('../meeting', () => ({
  index: jest.fn((req, res) => {
    res.status(200).json({
      success: true,
      data: [{ _id: '60d21b4667d0d8992e610c85', agenda: 'Test Meeting' }]
    });
  }),
  add: jest.fn((req, res) => {
    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: { _id: '60d21b4667d0d8992e610c85', agenda: 'New Meeting' }
    });
  }),
  view: jest.fn((req, res) => {
    if (req.params.id === 'notfound') {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }
    res.status(200).json({
      success: true,
      data: { _id: req.params.id, agenda: 'Test Meeting' }
    });
  }),
  deleteData: jest.fn((req, res) => {
    if (req.params.id === 'notfound') {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully',
      data: { _id: req.params.id, deleted: true }
    });
  }),
  deleteMany: jest.fn((req, res) => {
    res.status(200).json({
      success: true,
      message: 'Meetings deleted successfully',
      data: { modifiedCount: req.body.length }
    });
  })
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/meeting', meetingRoutes);

describe('Meeting Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/meeting', () => {
    it('should return all meetings', async () => {
      const response = await request(app)
        .get('/api/meeting')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [{ _id: '60d21b4667d0d8992e610c85', agenda: 'Test Meeting' }]
      });
    });
  });

  describe('GET /api/meeting/:id', () => {
    it('should return a single meeting', async () => {
      const response = await request(app)
        .get('/api/meeting/60d21b4667d0d8992e610c85')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { _id: '60d21b4667d0d8992e610c85', agenda: 'Test Meeting' }
      });
    });

    it('should return 404 when meeting is not found', async () => {
      const response = await request(app)
        .get('/api/meeting/notfound')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Meeting not found'
      });
    });
  });

  describe('POST /api/meeting', () => {
    it('should create a new meeting', async () => {
      const meetingData = { agenda: 'New Meeting' };
      
      const response = await request(app)
        .post('/api/meeting')
        .send(meetingData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Meeting created successfully',
        data: { _id: '60d21b4667d0d8992e610c85', agenda: 'New Meeting' }
      });
    });
  });

  describe('POST /api/meeting/batch-delete', () => {
    it('should delete multiple meetings', async () => {
      const meetingIds = ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'];
      
      const response = await request(app)
        .post('/api/meeting/batch-delete')
        .send(meetingIds)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Meetings deleted successfully',
        data: { modifiedCount: 2 }
      });
    });
  });

  describe('DELETE /api/meeting/:id', () => {
    it('should delete a meeting', async () => {
      const response = await request(app)
        .delete('/api/meeting/60d21b4667d0d8992e610c85')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Meeting deleted successfully',
        data: { _id: '60d21b4667d0d8992e610c85', deleted: true }
      });
    });

    it('should return 404 when meeting to delete is not found', async () => {
      const response = await request(app)
        .delete('/api/meeting/notfound')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Meeting not found'
      });
    });
  });
}); 