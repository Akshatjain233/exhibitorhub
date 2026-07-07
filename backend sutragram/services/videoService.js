import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// FFmpeg Video Processing Service
// Handles thumbnail generation, compression, and format conversion

const s3Client = new S3Client({
    region: process.env.DO_SPACES_REGION || 'nyc3',
    endpoint: process.env.DO_SPACES_ENDPOINT,
    credentials: {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
    },
});

const TEMP_DIR = '/tmp/video-processing';

// Ensure temp directory exists
await fs.mkdir(TEMP_DIR, { recursive: true }).catch(() => { });

/**
 * Generate thumbnail from video
 * @param {string} videoPath - Path to video file
 * @param {string} outputKey - S3 key for thumbnail
 * @returns {Promise<string>} - URL of uploaded thumbnail
 */
export const generateThumbnail = async (videoPath, outputKey) => {
    const thumbnailPath = path.join(TEMP_DIR, `thumb-${Date.now()}.jpg`);

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: ['10%'], // Capture at 10% of video duration
                filename: path.basename(thumbnailPath),
                folder: path.dirname(thumbnailPath),
                size: '640x360', // 16:9 aspect ratio
            })
            .on('end', async () => {
                try {
                    // Upload to DO Spaces
                    const fileBuffer = await fs.readFile(thumbnailPath);
                    await s3Client.send(
                        new PutObjectCommand({
                            Bucket: process.env.DO_SPACES_BUCKET,
                            Key: outputKey,
                            Body: fileBuffer,
                            ContentType: 'image/jpeg',
                            ACL: 'public-read',
                        })
                    );

                    // Cleanup
                    await fs.unlink(thumbnailPath).catch(() => { });

                    const cdnUrl = `${process.env.DO_SPACES_CDN_ENDPOINT}/${outputKey}`;
                    resolve(cdnUrl);
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (err) => reject(err));
    });
};

/**
 * Get video metadata (duration, resolution, etc.)
 * @param {string} videoPath - Path to video file
 * @returns {Promise<Object>} - Video metadata
 */
export const getVideoMetadata = async (videoPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
                resolve({
                    duration: metadata.format.duration,
                    width: videoStream?.width,
                    height: videoStream?.height,
                    bitrate: metadata.format.bit_rate,
                    size: metadata.format.size,
                    format: metadata.format.format_name,
                });
            }
        });
    });
};

/**
 * Compress video to reduce file size
 * @param {string} inputPath - Input video path
 * @param {string} outputKey - S3 key for compressed video
 * @returns {Promise<string>} - URL of compressed video
 */
export const compressVideo = async (inputPath, outputKey) => {
    const outputPath = path.join(TEMP_DIR, `compressed-${Date.now()}.mp4`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .size('1280x720') // 720p max resolution
            .videoBitrate('1000k') // 1Mbps for mobile-friendly streaming
            .audioBitrate('128k')
            .format('mp4')
            .on('end', async () => {
                try {
                    // Upload to DO Spaces
                    const fileBuffer = await fs.readFile(outputPath);
                    await s3Client.send(
                        new PutObjectCommand({
                            Bucket: process.env.DO_SPACES_BUCKET,
                            Key: outputKey,
                            Body: fileBuffer,
                            ContentType: 'video/mp4',
                            ACL: 'public-read',
                        })
                    );

                    // Cleanup
                    await fs.unlink(outputPath).catch(() => { });

                    const cdnUrl = `${process.env.DO_SPACES_CDN_ENDPOINT}/${outputKey}`;
                    resolve(cdnUrl);
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (err) => reject(err));
    });
};

/**
 * Process uploaded video: generate thumbnail + compress
 * @param {string} videoUrl - URL of uploaded video
 * @param {string} userId - User ID for organizing files
 * @returns {Promise<Object>} - Processed video data
 */
export const processVideo = async (videoUrl, userId) => {
    const tempVideoPath = path.join(TEMP_DIR, `input-${Date.now()}.mp4`);

    try {
        // Download video to temp (if from URL)
        // In production, you might stream directly from S3
        const response = await fetch(videoUrl);
        const buffer = await response.arrayBuffer();
        await fs.writeFile(tempVideoPath, Buffer.from(buffer));

        // Get metadata
        const metadata = await getVideoMetadata(tempVideoPath);

        // Generate thumbnail
        const thumbnailKey = `thumbnails/${userId}/${Date.now()}.jpg`;
        const thumbnailUrl = await generateThumbnail(tempVideoPath, thumbnailKey);

        // Compress video if needed (optional, can be done async)
        let compressedUrl = videoUrl;
        if (metadata.size > 50 * 1024 * 1024) {
            // Compress if > 50MB
            const compressedKey = `videos/compressed/${userId}/${Date.now()}.mp4`;
            compressedUrl = await compressVideo(tempVideoPath, compressedKey);
        }

        // Cleanup
        await fs.unlink(tempVideoPath).catch(() => { });

        return {
            originalUrl: videoUrl,
            processedUrl: compressedUrl,
            thumbnailUrl,
            metadata,
        };
    } catch (error) {
        // Cleanup on error
        await fs.unlink(tempVideoPath).catch(() => { });
        throw error;
    }
};

export default {
    generateThumbnail,
    getVideoMetadata,
    compressVideo,
    processVideo,
};
