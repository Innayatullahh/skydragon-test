const mongoose = require('mongoose');
const meetingController = require('../meeting');

// Mock the MeetingHistory model
const mockSave = jest.fn();
const mockFindByIdAndUpdate = jest.fn();

function MockMeetingHistory(data) {
    return {
        ...data,
        save: mockSave
    };
}

MockMeetingHistory.findByIdAndUpdate = mockFindByIdAndUpdate;
MockMeetingHistory.findById = jest.fn();
MockMeetingHistory.find = jest.fn();

jest.mock('../../../model/schema/meeting', () => {
    return MockMeetingHistory;
});

const MeetingHistory = require('../../../model/schema/meeting');

describe('Meeting Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('add', () => {
        it('should create a new meeting successfully', async () => {
            // Mock request and response objects
            const req = {
                body: {
                    agenda: 'Test Meeting',
                    attendes: ['60d21b4667d0d8992e610c85'],
                    dateTime: '2023-04-07T10:00:00Z'
                },
                user: {
                    userId: '60d21b4667d0d8992e610c86'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock successful save
            mockSave.mockResolvedValue({
                ...req.body,
                createBy: req.user.userId,
                timestamp: new Date()
            });

            // Call the controller method
            await meetingController.add(req, res);

            // Verify response
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Meeting created successfully',
                data: expect.objectContaining({
                    agenda: req.body.agenda,
                    attendes: req.body.attendes,
                    dateTime: req.body.dateTime,
                    createBy: req.user.userId,
                    timestamp: expect.any(Date)
                })
            });
        });

        it('should handle errors when creating a meeting', async () => {
            // Mock request and response objects
            const req = {
                body: {
                    // Missing required fields
                },
                user: {
                    userId: '60d21b4667d0d8992e610c86'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock save to throw an error
            mockSave.mockRejectedValue(new Error('Validation error'));

            // Call the controller method
            await meetingController.add(req, res);

            // Verify error response
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to create meeting',
                details: 'Validation error'
            });
        });
    });

    describe('deleteData', () => {
        it('should delete a meeting successfully', async () => {
            const mockMeeting = {
                _id: '60d21b4667d0d8992e610c85',
                agenda: 'Test Meeting'
            };

            // Mock findByIdAndUpdate
            mockFindByIdAndUpdate.mockResolvedValue(mockMeeting);

            // Mock request and response objects
            const req = { 
                params: { id: '60d21b4667d0d8992e610c85' },
                user: {
                    userId: '60d21b4667d0d8992e610c86'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Call the controller method
            await meetingController.deleteData(req, res);

            // Verify response
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Meeting deleted successfully',
                data: mockMeeting
            });
        });

        it('should return 404 when meeting to delete is not found', async () => {
            // Mock findByIdAndUpdate to return null
            mockFindByIdAndUpdate.mockResolvedValue(null);

            // Mock request and response objects
            const req = { 
                params: { id: '60d21b4667d0d8992e610c85' },
                user: {
                    userId: '60d21b4667d0d8992e610c86'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Call the controller method
            await meetingController.deleteData(req, res);

            // Verify error response
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Meeting not found',
                success: false
            });
        });
    });
});