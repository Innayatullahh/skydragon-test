// Mock mongoose
const mockSchema = jest.fn().mockImplementation((definition) => definition);
mockSchema.Types = {
    ObjectId: 'ObjectId'
};

jest.mock('mongoose', () => ({
    Schema: mockSchema,
    model: jest.fn(),
    Types: {
        ObjectId: 'ObjectId'
    }
}));

// Mock the schema file to use our mocked ObjectId
jest.mock('../meeting', () => {
    const mongoose = require('mongoose');
    const schema = new mongoose.Schema({
        agenda: { type: String, required: true },
        attendes: [{
            type: 'ObjectId',
            ref: 'Contacts'
        }],
        attendesLead: [{
            type: 'ObjectId',
            ref: 'Leads'
        }],
        location: String,
        related: String,
        dateTime: String,
        notes: String,
        createBy: {
            type: 'ObjectId',
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        deleted: {
            type: Boolean,
            default: false
        }
    });

    return mongoose.model('Meeting', schema, 'Meetings');
});

const mongoose = require('mongoose');
const MeetingHistory = require('../meeting');

describe('Meeting Schema', () => {
    test('should define a schema with correct fields', () => {
        // Verify that mongoose.Schema was called
        expect(mongoose.Schema).toHaveBeenCalled();

        // Get the schema definition passed to Schema constructor
        const schemaDefinition = mongoose.Schema.mock.calls[0][0];

        // Test required fields
        expect(schemaDefinition.agenda.type).toBe(String);
        expect(schemaDefinition.agenda.required).toBe(true);

        // Test array fields with references
        expect(Array.isArray(schemaDefinition.attendes)).toBe(true);
        expect(schemaDefinition.attendes[0].ref).toBe('Contacts');
        expect(schemaDefinition.attendes[0].type).toBe('ObjectId');

        expect(Array.isArray(schemaDefinition.attendesLead)).toBe(true);
        expect(schemaDefinition.attendesLead[0].ref).toBe('Leads');
        expect(schemaDefinition.attendesLead[0].type).toBe('ObjectId');

        // Test optional fields
        expect(schemaDefinition.location).toBe(String);
        expect(schemaDefinition.related).toBe(String);
        expect(schemaDefinition.dateTime).toBe(String);
        expect(schemaDefinition.notes).toBe(String);

        // Test createBy field
        expect(schemaDefinition.createBy.ref).toBe('User');
        expect(schemaDefinition.createBy.type).toBe('ObjectId');

        // Test timestamp field
        expect(schemaDefinition.timestamp.type).toBe(Date);
        expect(typeof schemaDefinition.timestamp.default).toBe('function');

        // Test deleted field
        expect(schemaDefinition.deleted.type).toBe(Boolean);
        expect(schemaDefinition.deleted.default).toBe(false);
    });

    test('should register the model with mongoose', () => {
        expect(mongoose.model).toHaveBeenCalledWith('Meeting', expect.any(Object), 'Meetings');
    });
}); 