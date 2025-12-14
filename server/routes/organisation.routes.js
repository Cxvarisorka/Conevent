/**
 * Organisation Routes
 *
 * Public routes for viewing organisations
 * Admin routes for CRUD operations and admin management
 */

const express = require('express');
const router = express.Router();
const organisationController = require('../controllers/organisation.controller');
const { auth, allowedTo } = require('../middleware/auth.middleware');
const { uploadOrganisationImages } = require('../middleware/upload.middleware');

// Public Routes - Anyone can view organisations
router.get('/', organisationController.getAllOrganisations);
router.get('/:id', organisationController.getOrganisation);

// Admin Only Routes - Only admins can create, update, or delete organisations
router.post('/',
    auth,
    allowedTo('admin'),
    uploadOrganisationImages,
    organisationController.createOrganisation
);

router.put('/:id',
    auth,
    allowedTo('admin'),
    uploadOrganisationImages,
    organisationController.updateOrganisation
);

router.delete('/:id', auth, allowedTo('admin'), organisationController.deleteOrganisation);

// Organisation Admin Management Routes
router.post('/:id/admins', auth, allowedTo('admin'), organisationController.addAdmin);
router.delete('/:id/admins/:userId', auth, allowedTo('admin'), organisationController.removeAdmin);

module.exports = router;
