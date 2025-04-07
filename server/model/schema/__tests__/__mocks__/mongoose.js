class MockSchema {
    constructor(definition) {
        Object.assign(this, definition);
    }
}

MockSchema.Types = {
    ObjectId: String
};

const mockModel = jest.fn((name, schema, collection) => {
    return function(data) {
        return {
            ...data,
            save: jest.fn().mockResolvedValue(data)
        };
    };
});

module.exports = {
    Schema: MockSchema,
    model: mockModel,
    connect: jest.fn(),
    Types: {
        ObjectId: String
    }
}; 