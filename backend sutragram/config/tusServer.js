import { Server } from '@tus/server';
import { S3Store } from '@tus/s3-store';
import { S3Client } from '@aws-sdk/client-s3';

// TUS Resumable Upload Server for DigitalOcean Spaces
// This enables chunked, interruptible uploads for artisans with unstable internet

const s3Client = new S3Client({
    region: process.env.DO_SPACES_REGION || 'nyc3',
    endpoint: process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com',
    credentials: {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
    },
});

const tusStore = new S3Store({
    s3Client,
    bucket: process.env.DO_SPACES_BUCKET || 'sutragram-media',
    partSize: 8 * 1024 * 1024, // 8MB chunks (good for mobile networks)
});

export const tusServer = new Server({
    path: '/uploads',
    datastore: tusStore,
    namingFunction: (req) => {
        // Generate unique filename with timestamp
        const extension = req.headers['upload-metadata']?.match(/filename ([^,]+)/)?.[1] || 'bin';
        const decodedFilename = Buffer.from(extension, 'base64').toString('utf-8');
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        return `uploads/${timestamp}-${random}-${decodedFilename}`;
    },
    onUploadFinish: async (req, res, upload) => {
        console.log('✅ Upload complete:', upload.id);
        // Trigger post-processing (thumbnail generation, etc.)
        // This is handled in the POST /api/media/process-upload endpoint
    },
    respectForwardedHeaders: true,
});

export default tusServer;
