const express = require('express');
const auth = require('../../middelwares/auth');
const meeting = require('./meeting');

/**
 * Meeting Routes.
 * All routes are protected by authentication middleware
 * `auth` middleware is used to check if the user is authenticated
 */
const router = express.Router();

/**
 * GET /api/meeting
 * Retrieves all meetings based on query parameters
 * @route GET /api/meeting
 */
router.get('/', auth, meeting.index);

/**
 * GET /api/meeting/:id
 * Retrieves a single meeting by ID
 * @route GET /api/meeting/:id
 */
router.get('/:id', auth, meeting.view);

/**
 * POST /api/meeting
 * Creates a new meeting
 * @route POST /api/meeting
 */
router.post('/', auth, meeting.add);

/**
 * POST /api/meeting/delete-many
 * Soft deletes multiple meetings by their IDs
 * @route POST /api/meeting/delete-many
 */
router.post('/batch-delete', auth, meeting.deleteMany);

/**
 * DELETE /api/meeting/:id
 * Soft deletes a meeting by ID
 * @route DELETE /api/meeting/:id
 */
router.delete('/:id', auth, meeting.deleteData);

module.exports = router;