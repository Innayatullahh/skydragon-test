const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');
const Contact = require('../../model/schema/contact')

const index = async (req, res) => {
    try {
        const query = req.query;
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

        const result = allData.filter(item => item.createBy !== null);

        const processedData = result.map(meeting => ({
            ...meeting.toObject(),
            createdByName: meeting.createBy ? meeting.createBy.username : '',
            attendesArray: [
                ...(meeting.attendes || []).map(contact => contact.email),
                ...(meeting.attendesLead || []).map(lead => lead.leadEmail)
            ]
        }));

        res.status(200).json(processedData);
    } catch (error) {
        console.error('Failed to fetch meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings', details: error.message });
    }
};

const add = async (req, res) => {
    console.log("🚀 ~ add ~ req:", req)
    
    try {
        const meeting = new MeetingHistory({
            ...req.body,
            timestamp: new Date(),
            createBy: req.user.userId
        });
        await meeting.save();
        res.status(200).json(meeting);
    } catch (err) {
        console.error('Failed to create meeting:', err);
        res.status(400).json({ error: 'Failed to create meeting' });
    }
};

const view = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findOne({ _id: req.params.id })
            .populate('createBy', 'username firstName lastName')
            .populate('attendes')
            .populate('attendesLead');

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const response = {
            ...meeting.toObject(),
            createdByName: meeting.createBy ? meeting.createBy.username : '',
            attendesArray: [
                ...(meeting.attendes || []).map(contact => contact.email),
                ...(meeting.attendesLead || []).map(lead => lead.leadEmail)
            ]
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Failed to fetch meeting:', error);
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
};

const deleteData = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findByIdAndUpdate(
            req.params.id,
            { deleted: true },
            { new: true }
        );
        
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        
        res.status(200).json({ message: "Meeting deleted successfully", meeting });
    } catch (err) {
        console.error('Failed to delete meeting:', err);
        res.status(500).json({ message: "Failed to delete meeting", error: err });
    }
};

const deleteMany = async (req, res) => {
    try {
        const result = await MeetingHistory.updateMany(
            { _id: { $in: req.body } },
            { $set: { deleted: true } }
        );
        
        res.status(200).json({ message: "Meetings deleted successfully", result });
    } catch (err) {
        console.error('Failed to delete meetings:', err);
        res.status(500).json({ message: "Failed to delete meetings", error: err });
    }
};

module.exports = { index, add, view, deleteData, deleteMany }