import mongoose from 'mongoose';

const craftTagSchema = new mongoose.Schema({
    name_english: {
        type: String,
        required: true,
        unique: true,
    },
    name_vernacular: {
        type: String, // Localized name
    },
    type: {
        type: String,
        enum: ['Material', 'Technique', 'Region'],
        required: true,
    },
}, { timestamps: false });

const CraftTag = mongoose.model('CraftTag', craftTagSchema);
export default CraftTag;
