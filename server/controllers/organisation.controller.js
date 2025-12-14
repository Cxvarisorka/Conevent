const catchAsync = require("../utils/catchAsync");
const Organisation = require("../models/organisation.model");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUpload");

const createOrganisation = catchAsync(async (req, res, next) => {
    const {
        name,
        type,
        description,
        website,
        email,
        phone,
        address,
        location,
        socialMedia,
        admins
    } = req.body;

    // Check if organisation with same email already exists
    const existingOrganisation = await Organisation.findOne({ email });
    if (existingOrganisation) {
        return next(new AppError("Organisation with this email already exists", 400));
    }

    // Handle image uploads to Cloudinary
    let logoUrl = null;
    let coverImageUrl = null;

    if (req.files) {
        // Upload logo if provided
        if (req.files.logo && req.files.logo[0]) {
            logoUrl = await uploadToCloudinary(req.files.logo[0].buffer, 'conevent/logos');
        }

        // Upload cover image if provided
        if (req.files.coverImage && req.files.coverImage[0]) {
            coverImageUrl = await uploadToCloudinary(req.files.coverImage[0].buffer, 'conevent/coverImages');
        }
    }

    // Create organisation
    let organisation = await Organisation.create({
        name,
        type,
        description,
        logo: logoUrl,
        coverImage: coverImageUrl,
        website,
        email,
        phone,
        address,
        location,
        socialMedia,
        admins: admins || []
    });

    // Populate admins with user data
    organisation = await organisation.populate('admins', 'name email');

    res.status(201).json({
        status: "success",
        data: {
            organisation
        }
    });
});

const getAllOrganisations = catchAsync(async (req, res, next) => {
    // Search fields for organisations (name instead of title)
    const searchFields = ['name', 'description'];

    // Get total count for pagination
    const totalQuery = new APIFeatures(Organisation.find(), req.query)
        .filter()
        .search(searchFields);
    const total = await Organisation.countDocuments(totalQuery.query.getFilter());

    // Execute query with all features
    const features = new APIFeatures(Organisation.find(), req.query)
        .filter()
        .search(searchFields)
        .sort()
        .limitFields()
        .paginate();

    // Populate admins with user data (name and email)
    const organisations = await features.query.populate('admins', 'name email');

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;

    res.status(200).json({
        status: "success",
        results: organisations.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: {
            organisations
        }
    });
});

const getOrganisation = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Populate admins with user data
    const organisation = await Organisation.findById(id).populate('admins', 'name email');

    if (!organisation) {
        return next(new AppError("Organisation not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            organisation
        }
    });
});

/**
 * Update an existing organisation
 * Handles partial updates and image replacement
 */
const updateOrganisation = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const {
        name,
        type,
        description,
        website,
        email,
        phone,
        address,
        location,
        socialMedia,
        admins
    } = req.body;

    const organisation = await Organisation.findById(id);

    if (!organisation) {
        return next(new AppError("Organisation not found", 404));
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== organisation.email) {
        const existingOrg = await Organisation.findOne({ email });
        if (existingOrg) {
            return next(new AppError("Organisation with this email already exists", 400));
        }
    }

    // Handle image uploads to Cloudinary
    let logoUrl = organisation.logo;
    let coverImageUrl = organisation.coverImage;

    if (req.files) {
        // Upload new logo if provided
        if (req.files.logo && req.files.logo[0]) {
            // Delete old logo from Cloudinary
            if (organisation.logo) {
                try {
                    await deleteFromCloudinary(organisation.logo);
                } catch (error) {
                    console.error('Error deleting old logo:', error);
                }
            }
            logoUrl = await uploadToCloudinary(req.files.logo[0].buffer, 'conevent/logos');
        }

        // Upload new cover image if provided
        if (req.files.coverImage && req.files.coverImage[0]) {
            // Delete old cover image from Cloudinary
            if (organisation.coverImage) {
                try {
                    await deleteFromCloudinary(organisation.coverImage);
                } catch (error) {
                    console.error('Error deleting old cover image:', error);
                }
            }
            coverImageUrl = await uploadToCloudinary(req.files.coverImage[0].buffer, 'conevent/coverImages');
        }
    }

    // Update organisation fields
    const updatedOrganisation = await Organisation.findByIdAndUpdate(
        id,
        {
            name: name || organisation.name,
            type: type || organisation.type,
            description: description || organisation.description,
            logo: logoUrl,
            coverImage: coverImageUrl,
            website: website !== undefined ? website : organisation.website,
            email: email || organisation.email,
            phone: phone !== undefined ? phone : organisation.phone,
            address: address !== undefined ? address : organisation.address,
            location: location !== undefined ? location : organisation.location,
            socialMedia: socialMedia || organisation.socialMedia,
            admins: admins || organisation.admins
        },
        { new: true, runValidators: true }
    ).populate('admins', 'name email');

    res.status(200).json({
        status: "success",
        data: {
            organisation: updatedOrganisation
        }
    });
});

/**
 * Delete an organisation
 * Also removes associated images from Cloudinary
 */
const deleteOrganisation = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const organisation = await Organisation.findById(id);

    if (!organisation) {
        return next(new AppError("Organisation not found", 404));
    }

    // Delete images from Cloudinary if they exist
    if (organisation.logo) {
        try {
            await deleteFromCloudinary(organisation.logo);
        } catch (error) {
            console.error('Error deleting logo from Cloudinary:', error);
        }
    }

    if (organisation.coverImage) {
        try {
            await deleteFromCloudinary(organisation.coverImage);
        } catch (error) {
            console.error('Error deleting cover image from Cloudinary:', error);
        }
    }

    // Delete organisation from database
    await Organisation.findByIdAndDelete(id);

    res.status(204).json({
        status: "success",
        data: null
    });
});

/**
 * Add an admin to an organisation
 * @param {string} req.params.id - Organisation ID
 * @param {string} req.body.userId - User ID to add as admin
 */
const addAdmin = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return next(new AppError("User ID is required", 400));
    }

    const organisation = await Organisation.findById(id);

    if (!organisation) {
        return next(new AppError("Organisation not found", 404));
    }

    // Check if user is already an admin
    if (organisation.admins.includes(userId)) {
        return next(new AppError("User is already an admin of this organisation", 400));
    }

    // Add user to admins array
    organisation.admins.push(userId);
    await organisation.save();

    // Populate admins for response
    await organisation.populate('admins', 'name email');

    res.status(200).json({
        status: "success",
        data: {
            organisation
        }
    });
});

/**
 * Remove an admin from an organisation
 * @param {string} req.params.id - Organisation ID
 * @param {string} req.params.userId - User ID to remove
 */
const removeAdmin = catchAsync(async (req, res, next) => {
    const { id, userId } = req.params;

    const organisation = await Organisation.findById(id);

    if (!organisation) {
        return next(new AppError("Organisation not found", 404));
    }

    // Check if user is an admin
    const adminIndex = organisation.admins.indexOf(userId);
    if (adminIndex === -1) {
        return next(new AppError("User is not an admin of this organisation", 400));
    }

    // Remove user from admins array
    organisation.admins.splice(adminIndex, 1);
    await organisation.save();

    // Populate admins for response
    await organisation.populate('admins', 'name email');

    res.status(200).json({
        status: "success",
        data: {
            organisation
        }
    });
});

module.exports = {
    createOrganisation,
    getAllOrganisations,
    getOrganisation,
    updateOrganisation,
    deleteOrganisation,
    addAdmin,
    removeAdmin
};