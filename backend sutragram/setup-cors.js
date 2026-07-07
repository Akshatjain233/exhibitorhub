/**
 * Configure CORS for DigitalOcean Spaces
 * This allows videos and images to be loaded from web and mobile apps
 */

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const buildEndpoint = (endpoint, region) => {
    if (!endpoint) {
        return `https://${region}.digitaloceanspaces.com`;
    }
    return endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
};

// Initialize DigitalOcean Spaces client
const s3Client = new S3Client({
    endpoint: buildEndpoint(process.env.DO_SPACES_ENDPOINT, process.env.DO_SPACES_REGION || 'sgp1'),
    region: process.env.DO_SPACES_REGION || 'sgp1',
    credentials: {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
    },
});

const corsConfiguration = {
    CORSRules: [
        {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'HEAD'],
            AllowedOrigins: ['*'], // Allow all origins for public content
            ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
            MaxAgeSeconds: 3600,
        },
    ],
};

async function configureCORS() {
    try {
        console.log('🔧 Configuring CORS for bucket:', process.env.DO_SPACES_BUCKET);
        
        const command = new PutBucketCorsCommand({
            Bucket: process.env.DO_SPACES_BUCKET,
            CORSConfiguration: corsConfiguration,
        });

        await s3Client.send(command);
        
        console.log('✅ CORS configuration updated successfully!');
        console.log('📋 Configuration:');
        console.log(JSON.stringify(corsConfiguration, null, 2));
        
    } catch (error) {
        console.error('❌ Error configuring CORS:', error);
        process.exit(1);
    }
}

configureCORS()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
