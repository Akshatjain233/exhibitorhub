const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuid } = require('uuid');
const path = require('path');

const buildEndpoint = (endpoint, region) => {
    if (!endpoint) {
        return `https://${region}.digitaloceanspaces.com`;
    }
    return endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
};

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

const uploadS3 = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.DO_SPACES_BUCKET,
        acl: 'public-read',
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
            const key = `uploads/exhibitorhub/${userId}/${timestamp}-${baseName}-${uniqueSuffix}${ext}`;
            cb(null, key);
        },
    }),
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only video, image, and PDF files are allowed'));
        }
    },
});

const deleteSpacesObject = async (fileUrl) => {
    try {
        if (!fileUrl || !fileUrl.includes('digitaloceanspaces.com')) return false;
        
        const url = new URL(fileUrl);
        let key = url.pathname.replace(/^\/+/, '');
        const bucket = process.env.DO_SPACES_BUCKET;

        if (bucket && key.startsWith(`${bucket}/`)) {
            key = key.slice(bucket.length + 1);
        }

        if (!bucket || !key) return false;

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

module.exports = {
    s3Client,
    uploadS3,
    deleteSpacesObject
};
