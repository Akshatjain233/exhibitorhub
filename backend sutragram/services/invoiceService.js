import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// PDF Invoice Generation Service

const s3Client = new S3Client({
    region: process.env.DO_SPACES_REGION,
    endpoint: process.env.DO_SPACES_ENDPOINT,
    credentials: {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
    },
});

/**
 * Generate PDF invoice for an order
 * @param {Object} orderData - Order details
 * @returns {Promise<string>} - URL of generated PDF
 */
export const generateInvoice = async (orderData) => {
    const {
        orderId,
        orderNumber,
        orderDate,
        customer,
        artisan,
        items,
        subtotal,
        platformFee,
        total,
        paymentMethod,
    } = orderData;

    const pdfPath = path.join('/tmp', `invoice-${orderId}.pdf`);
    const doc = new PDFDocument({ margin: 50 });

    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // Header
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();

        // Company Info
        doc.fontSize(12).text('SutraGram Platform', { align: 'right' });
        doc.fontSize(10).text('Empowering Indian Artisans', { align: 'right' });
        doc.text('support@sutragram.com', { align: 'right' });
        doc.moveDown();

        // Invoice Details
        doc.fontSize(10);
        doc.text(`Invoice Number: ${orderNumber || orderId}`, 50, 150);
        doc.text(`Date: ${new Date(orderDate).toLocaleDateString('en-IN')}`, 50, 165);
        doc.moveDown();

        // Customer Details
        doc.fontSize(12).text('Bill To:', 50, 200);
        doc.fontSize(10);
        doc.text(customer.name, 50, 220);
        doc.text(customer.email, 50, 235);
        doc.text(customer.phone || '', 50, 250);
        doc.moveDown();

        // Artisan Details
        doc.fontSize(12).text('Artisan:', 350, 200);
        doc.fontSize(10);
        doc.text(artisan.name, 350, 220);
        doc.text(artisan.email, 350, 235);
        doc.moveDown();

        // Line Items Table
        const tableTop = 320;
        doc.fontSize(10);

        // Table Headers
        doc.text('Item', 50, tableTop, { width: 200 });
        doc.text('Qty', 260, tableTop, { width: 50, align: 'right' });
        doc.text('Price', 320, tableTop, { width: 80, align: 'right' });
        doc.text('Total', 410, tableTop, { width: 100, align: 'right' });

        // Horizontal line
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let yPosition = tableTop + 25;

        // Items
        items.forEach((item) => {
            doc.text(item.name, 50, yPosition, { width: 200 });
            doc.text(item.quantity.toString(), 260, yPosition, { width: 50, align: 'right' });
            doc.text(`₹${item.price.toFixed(2)}`, 320, yPosition, { width: 80, align: 'right' });
            doc.text(`₹${(item.quantity * item.price).toFixed(2)}`, 410, yPosition, {
                width: 100,
                align: 'right',
            });
            yPosition += 20;
        });

        // Totals
        yPosition += 10;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 15;

        doc.text('Subtotal:', 350, yPosition);
        doc.text(`₹${subtotal.toFixed(2)}`, 410, yPosition, { width: 100, align: 'right' });
        yPosition += 20;

        doc.text('Platform Fee (10%):', 350, yPosition);
        doc.text(`₹${platformFee.toFixed(2)}`, 410, yPosition, { width: 100, align: 'right' });
        yPosition += 20;

        doc.fontSize(12).text('Total:', 350, yPosition);
        doc.text(`₹${total.toFixed(2)}`, 410, yPosition, { width: 100, align: 'right' });

        // Payment Method
        yPosition += 40;
        doc.fontSize(10).text(`Payment Method: ${paymentMethod}`, 50, yPosition);

        // Footer
        doc.fontSize(8)
            .text(
                'Thank you for your purchase! For support, contact support@sutragram.com',
                50,
                doc.page.height - 50,
                { align: 'center' }
            );

        doc.end();

        writeStream.on('finish', async () => {
            try {
                // Upload to DO Spaces
                const fileBuffer = fs.readFileSync(pdfPath);
                const key = `invoices/${orderId}.pdf`;

                await s3Client.send(
                    new PutObjectCommand({
                        Bucket: process.env.DO_SPACES_BUCKET,
                        Key: key,
                        Body: fileBuffer,
                        ContentType: 'application/pdf',
                        ACL: 'private', // Invoices should be private
                    })
                );

                // Cleanup temp file
                fs.unlinkSync(pdfPath);

                const invoiceUrl = `${process.env.DO_SPACES_CDN_ENDPOINT}/${key}`;
                resolve(invoiceUrl);
            } catch (error) {
                reject(error);
            }
        });

        writeStream.on('error', reject);
    });
};

export default { generateInvoice };
