/**
 * Fix Video ACL - Make uploaded videos publicly accessible
 * Run this script to fix existing videos that were uploaded with private ACL
 */

import { S3Client, PutObjectAclCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

async function makeAllUploadsPublic() {
    try {
        console.log('🔍 Fetching all uploaded files...');
        
        const listCommand = new ListObjectsV2Command({
            Bucket: process.env.DO_SPACES_BUCKET,
            Prefix: 'uploads/',
        });

        const response = await s3Client.send(listCommand);
        const objects = response.Contents || [];

        console.log(`📦 Found ${objects.length} files`);

        let successCount = 0;
        let errorCount = 0;

        for (const obj of objects) {
            try {
                const aclCommand = new PutObjectAclCommand({
                    Bucket: process.env.DO_SPACES_BUCKET,
                    Key: obj.Key,
                    ACL: 'public-read',
                });

                await s3Client.send(aclCommand);
                console.log(`✅ Made public: ${obj.Key}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Error with ${obj.Key}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📦 Total: ${objects.length}`);

    } catch (error) {
        console.error('❌ Error listing objects:', error);
        process.exit(1);
    }
}

makeAllUploadsPublic()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
