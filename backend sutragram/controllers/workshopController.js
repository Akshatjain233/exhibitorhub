import Workshop from '../models/Workshop.js';
import mongoose from 'mongoose';
import { deleteSpacesObject } from '../config/s3.js';

// @desc    Create workshop
// @route   POST /api/workshops
// @access  Private (artisan only)
export const createWorkshop = async (req, res) => {
    try {
        const { title, scheduled_at, fee, max_participants, description, duration, location, image_url } = req.body;

        if (!title || !scheduled_at || fee === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Title, scheduled date, and fee are required.',
            });
        }

        const workshop = await Workshop.create({
            artisan: req.user._id,
            title,
            scheduled_at,
            fee,
            max_participants: max_participants || 10,
            description: description || '',
            duration: duration || 1,
            location: location || 'Online',
            image_url: image_url || null,
        });

        res.status(201).json({
            success: true,
            message: 'Workshop created successfully.',
            data: { workshop },
        });
    } catch (error) {
        console.error('Create workshop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create workshop.',
            error: error.message,
        });
    }
};

// @desc    Get all workshops
// @route   GET /api/workshops
// @access  Public
export const getAllWorkshops = async (req, res) => {
    try {
        const { status = 'Scheduled', page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (status) {
            query.status = status;
        }

        const workshops = await Workshop.find(query)
            .populate('artisan', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ scheduled_at: 1 });

        const total = await Workshop.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                workshops,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get all workshops error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workshops.',
            error: error.message,
        });
    }
};

// @desc    Get workshop by ID
// @route   GET /api/workshops/:workshopId
// @access  Public
export const getWorkshopById = async (req, res) => {
    try {
        const { id } = req.params;

        const workshop = await Workshop.findById(id)
            .populate('artisan', 'name email phone_number');

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: { workshop },
        });
    } catch (error) {
        console.error('Get workshop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workshop.',
            error: error.message,
        });
    }
};

// @desc    Update workshop
// @route   PUT /api/workshops/:id
// @access  Private (artisan only)
export const updateWorkshop = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const workshop = await Workshop.findById(id);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found.',
            });
        }

        // Verify ownership
        if (workshop.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this workshop.',
            });
        }

        Object.assign(workshop, updates);
        await workshop.save();

        res.status(200).json({
            success: true,
            message: 'Workshop updated successfully.',
            data: { workshop },
        });
    } catch (error) {
        console.error('Update workshop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update workshop.',
            error: error.message,
        });
    }
};

// @desc    Delete workshop
// @route   DELETE /api/workshops/:id
// @access  Private (artisan only)
export const deleteWorkshop = async (req, res) => {
    try {
        const { id } = req.params;

        const workshop = await Workshop.findById(id);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found.',
            });
        }

        // Verify ownership
        if (workshop.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this workshop.',
            });
        }

        if (workshop.image_url) {
            await deleteSpacesObject(workshop.image_url);
        }

        await Workshop.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Workshop deleted successfully.',
        });
    } catch (error) {
        console.error('Delete workshop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete workshop.',
            error: error.message,
        });
    }
};

// @desc    Get workshops by artisan
// @route   GET /api/workshops/artisan/:artisanId
// @access  Public
export const getWorkshopsByArtisan = async (req, res) => {
    try {
        const { artisanId } = req.params;
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { artisan: artisanId };
        if (status) {
            query.status = status;
        }

        const workshops = await Workshop.find(query)
            .populate('artisan', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ scheduled_at: -1 });

        const total = await Workshop.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                workshops,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get workshops by artisan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workshops.',
            error: error.message,
        });
    }
};
