import axios from 'axios';
import 'dotenv/config';

console.log('Testing Brevo Email Service...\n');
console.log('API Key:', process.env.BREVO_API_KEY ? '✅ Found' : '❌ Not found');

async function testBrevoAPI() {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: 'Artisan Platform Test',
                    email: 'no-reply@snacktrack.me',
                },
                to: [{ email: 'kartikgoutam7@gmail.com' }],
                subject: 'Test Email - OTP Service',
                htmlContent: `
                    <h1>Test Email</h1>
                    <p>This is a test email to verify Brevo API is working.</p>
                    <p>Your OTP: <strong>123456</strong></p>
                `,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                },
            }
        );

        console.log('\n✅ Email sent successfully!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('\n📧 Check your inbox at kartikgoutam7@gmail.com');
    } catch (error) {
        console.error('\n❌ Failed to send email:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testBrevoAPI();
