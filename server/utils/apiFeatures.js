/**
 * APIFeatures Class
 *
 * Provides query building utilities for MongoDB:
 * - Filtering by field values
 * - Text search with regex fallback
 * - Sorting
 * - Field selection
 * - Pagination
 */
const mongoose = require('mongoose');

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    /**
     * Filter query by field values
     * Supports comparison operators: gte, gt, lte, lt
     * Handles ObjectId fields automatically
     */
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Fields that should be treated as ObjectIds
        const objectIdFields = ['organisationId', 'userId', 'eventId'];

        // Convert ObjectId string fields to actual ObjectIds
        objectIdFields.forEach(field => {
            if (queryObj[field] && mongoose.Types.ObjectId.isValid(queryObj[field])) {
                queryObj[field] = new mongoose.Types.ObjectId(queryObj[field]);
            }
        });

        // Advanced filtering with comparison operators
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // Parse back and handle ObjectIds (they get stringified)
        const parsedQuery = JSON.parse(queryStr);

        // Re-convert ObjectId fields after JSON parse
        objectIdFields.forEach(field => {
            if (parsedQuery[field] && typeof parsedQuery[field] === 'string' &&
                mongoose.Types.ObjectId.isValid(parsedQuery[field])) {
                parsedQuery[field] = new mongoose.Types.ObjectId(parsedQuery[field]);
            }
        });

        this.query = this.query.find(parsedQuery);

        return this;
    }

    /**
     * Search using regex on specified fields
     * More reliable than $text search for partial matches
     * @param {Array} fields - Fields to search in (default: title, description)
     */
    search(fields = ['title', 'description']) {
        if (this.queryString.search) {
            const searchTerm = this.queryString.search.trim();
            if (searchTerm) {
                // Escape special regex characters to prevent errors
                const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Create case-insensitive regex search on multiple fields
                const searchRegex = new RegExp(escapedTerm, 'i');
                const orConditions = fields.map(field => ({ [field]: searchRegex }));
                this.query = this.query.find({ $or: orConditions });
            }
        }

        return this;
    }

    /**
     * Sort results by specified fields
     * Default: newest first (-createdAt)
     */
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    /**
     * Select specific fields to return
     */
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    /**
     * Paginate results
     * Default: page 1, limit 10
     */
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;