import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuid } from 'uuid';
import path from 'path';

const buildEndpoint = (endpoint, region) => {
    if (!endpoint) {
        return `https://${region}.digitaloceanspaces.com`;
    }
    return endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
};

// Initialize DigitalOcean Spaces client (S3-compatible)
if (!process.env.DO_SPACES_ACCESS_KEY || !process.env.DO_SPACES_SECRET_KEY) {
    console.warn('⚠️ DO_SPACES credentials not configured. File uploads will fail.');
}

const s3Client = new S3Client({
    endpoint: buildEndpoint(process.env.DO_SPACES_ENDPOINT, process.env.DO_SPACES_REGION || 'sgp1'),
    region: process.env.DO_SPACES_REGION || 'sgp1',
    credentials: {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
    },
});

// Configure multer for Spaces uploads
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.DO_SPACES_BUCKET,
        acl: 'public-read', // Make uploaded files publicly accessible
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, {
                fieldName: file.fieldname,
                uploadedBy: req.user?._id?.toString() || 'unknown',
            });
        },
        key: function (req, file, cb) {
            const userId = req.user?._id || 'unknown';
            const timestamp = Date.now();
            const ext = path.extname(file.originalname);
            const baseName = file.originalname
                .replace(ext, '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 60) || 'upload';
            const uniqueSuffix = uuid().split('-')[0];
            const key = `uploads/${userId}/${timestamp}-${baseName}-${uniqueSuffix}${ext}`;
            cb(null, key);
        },
    }),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video and image files are allowed'));
        }
    },
});

export { s3Client, upload };

const normalizeUrl = (value) => {
    if (!value) return null;
    return value.startsWith('http') ? value : `https://${value}`;
};

const getHost = (value) => {
    try {
        const url = new URL(normalizeUrl(value));
        return url.host;
    } catch {
        return null;
    }
};

const isSpacesUrl = (fileUrl) => {
    const host = getHost(fileUrl);
    if (!host) return false;

    if (host.includes('digitaloceanspaces.com')) return true;

    const cdnHost = getHost(process.env.DO_SPACES_CDN_ENDPOINT);
    return !!cdnHost && host === cdnHost;
};

const getSpacesKeyFromUrl = (fileUrl) => {
    if (!fileUrl || !isSpacesUrl(fileUrl)) return null;

    try {
        const url = new URL(normalizeUrl(fileUrl));
        let key = url.pathname.replace(/^\/+/, '');
        const bucket = process.env.DO_SPACES_BUCKET;

        if (bucket && key.startsWith(`${bucket}/`)) {
            key = key.slice(bucket.length + 1);
        }

        return key || null;
    } catch {
        return null;
    }
};

const deleteSpacesObject = async (fileUrl) => {
    const bucket = process.env.DO_SPACES_BUCKET;
    const key = getSpacesKeyFromUrl(fileUrl);

    if (!bucket || !key) return false;

    try {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
        return true;
    } catch (error) {
        console.error('Spaces delete error:', error);
        return false;
    }
};

export { deleteSpacesObject, getSpacesKeyFromUrl };
