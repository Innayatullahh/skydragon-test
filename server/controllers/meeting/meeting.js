const MeetingHistory = require('../../model/schema/meeting')

/**
 * Retrieves all meetings based on query parameters
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters for filtering meetings
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with meeting data
 */
const index = async (req, res) => {
    try {
        const query = req.query;
        // Ensure we only get non-deleted meetings
        query.deleted = false;

        let allData = await MeetingHistory.find(query)
            .populate({
                path: 'createBy',
                match: { deleted: false },
                select: 'username firstName lastName'
            })
            .populate('attendes', 'email')
            .populate('attendesLead', 'leadEmail')
            .exec();

        // Filter out meetings
        const result = allData.filter(item => item.createBy !== null);

        // Transform data to include creator name and combined attendee list
        const processedData = result.map(meeting => ({
            ...meeting.toObject(),
            createdByName: meeting.createBy ? meeting.createBy.username : '',
            attendesArray: [
                ...(meeting.attendes || []).map(contact => contact.email),
                ...(meeting.attendesLead || []).map(lead => lead.leadEmail)
            ]
        }));

        res.status(200).json({
            success: true,
            data: processedData
        });
    } catch (error) {
        console.error('Failed to fetch meetings:', error);
        // Details variable has information about the error
        res.status(500).json({ error: 'Failed to fetch meetings', details: error.message });
    }
};

/**
 * Creates a new meeting
 * @param {Object} req - Express request object
 * @param {Object} req.body - Meeting data
 * @param {Object} req.user - User information from auth middleware
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created meeting
 */
const add = async (req, res) => {

    try {
        // Create new meeting
        const meeting = new MeetingHistory({
            ...req.body,
            timestamp: new Date(),
            createBy: req.user.userId
        });
        await meeting.save();

        res.status(201).json({
            success: true,
            message: 'Meeting created successfully',
            data: meeting
        });
    } catch (error) {
        console.error('Failed to create meeting:', error);
        // Details variable has information about the error
        res.status(400).json({ error: 'Failed to create meeting', details: error.message });
    }
};

/**
 * Retrieves a single meeting by ID
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Meeting ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with meeting details
 */
const view = async (req, res) => {
    try {
        // Find meeting by ID with populated creator and attendee information
        const meeting = await MeetingHistory.findOne({ _id: req.params.id })
            .populate('createBy', 'username firstName lastName')
            .populate('attendes')
            .populate('attendesLead');

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found',
            });
        }

        const response = {
            ...meeting.toObject(),
            createdByName: meeting.createBy ? meeting.createBy.username : '',
            attendesArray: [
                ...(meeting.attendes || []).map(contact => contact.email),
                ...(meeting.attendesLead || []).map(lead => lead.leadEmail)
            ]
        };

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Failed to fetch meeting:', error);
        // Details variable has information about the error
        res.status(500).json({ error: 'Failed to fetch meeting', details: error.message });
    }
};

/**
 * Soft deletes a meeting by ID
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Meeting ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deletion status
 */
const deleteData = async (req, res) => {
    try {
        // Soft delete by setting deleted flag to true
        const meeting = await MeetingHistory.findByIdAndUpdate(
            req.params.id,
            { deleted: true },
            { new: true }
        );

        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found',
            });
        }

        res.status(200).json({
            success: true,
            message: "Meeting deleted successfully",
            data: meeting
        });
    } catch (err) {
        console.error('Failed to delete meeting:', err);
        // Details variable has information about the error
        res.status(500).json({ error: 'Failed to delete meeting', details: err.message });
    }
};

/**
 * Soft deletes multiple meetings by their IDs
 * @param {Object} req - Express request object
 * @param {Array} req.body - Array of meeting IDs to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deletion status
 */
const deleteMany = async (req, res) => {
    try {
        // Soft delete multiple meetings by setting deleted flag to true
        const result = await MeetingHistory.updateMany(
            { _id: { $in: req.body } },
            { $set: { deleted: true } }
        );

        res.status(200).json({
            success: true,
            message: "Meetings deleted successfully",
            data: result
        });
    } catch (err) {
        console.error('Failed to delete meetings:', err);
        // Details variable has information about the error
        res.status(500).json({ error: 'Failed to delete meetings', details: err.message });
    }
};

module.exports = { index, add, view, deleteData, deleteMany }