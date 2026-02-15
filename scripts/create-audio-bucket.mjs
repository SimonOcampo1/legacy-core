/**
 * Quick script to create the audio_comments storage bucket in Appwrite.
 * Run: node scripts/create-audio-bucket.mjs
 * 
 * You need to set APPWRITE_API_KEY environment variable with a key that has
 * storage.buckets.write permission.
 */

const ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '698d01bd002acb579ff7';
const BUCKET_ID = 'audio_comments';

const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error('\n❌ APPWRITE_API_KEY environment variable is required.');
    console.error('   Set it with: $env:APPWRITE_API_KEY="your-api-key-here"');
    console.error('   You can create an API key in your Appwrite Console → Settings → API Keys\n');
    process.exit(1);
}

async function createBucket() {
    console.log(`\nCreating storage bucket: ${BUCKET_ID}...`);

    const response = await fetch(`${ENDPOINT}/storage/buckets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': PROJECT_ID,
            'X-Appwrite-Key': API_KEY
        },
        body: JSON.stringify({
            bucketId: BUCKET_ID,
            name: 'Audio Comments',
            permissions: [
                'read("any")',
                'create("users")',
                'update("users")',
                'delete("users")'
            ],
            fileSecurity: false,
            maximumFileSize: 10485760, // 10MB
            allowedFileExtensions: ['webm', 'ogg', 'mp3', 'wav', 'm4a'],
            enabled: true
        })
    });

    const data = await response.json();

    if (response.ok) {
        console.log('✅ Bucket created successfully!');
        console.log(`   ID: ${data.$id}`);
        console.log(`   Name: ${data.name}`);
        console.log(`   Permissions: ${JSON.stringify(data.$permissions)}\n`);
    } else if (data.code === 409) {
        console.log('ℹ️  Bucket already exists. Updating permissions...');

        const updateResponse = await fetch(`${ENDPOINT}/storage/buckets/${BUCKET_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': PROJECT_ID,
                'X-Appwrite-Key': API_KEY
            },
            body: JSON.stringify({
                name: 'Audio Comments',
                permissions: [
                    'read("any")',
                    'create("users")',
                    'update("users")',
                    'delete("users")'
                ],
                fileSecurity: false,
                maximumFileSize: 10485760,
                allowedFileExtensions: ['webm', 'ogg', 'mp3', 'wav', 'm4a'],
                enabled: true
            })
        });

        if (updateResponse.ok) {
            console.log('✅ Bucket permissions updated successfully!\n');
        } else {
            const updateData = await updateResponse.json();
            console.error('❌ Failed to update bucket:', updateData.message, '\n');
        }
    } else {
        console.error('❌ Failed to create bucket:', data.message);
        console.error('   Code:', data.code, '\n');
    }
}

createBucket();
