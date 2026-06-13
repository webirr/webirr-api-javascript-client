const http = require('http');

const expectedAuthKey = process.env.WEBIRR_WEBHOOK_AUTH_KEY || 'YOUR_WEBHOOK_AUTH_KEY';

function processPayment(payment)
{
    if (payment.status == 2) {
        console.log('bill is paid');
    } else if (payment.status == 3) {
        console.log('bill payment is reversed');
    }

    console.log(`Bank: ${payment.bankID}`);
    console.log(`Bank Reference Number: ${payment.paymentReference}`);
    console.log(`Amount Paid: ${payment.amount}`);
    console.log(`Payment Date: ${payment.paymentDate || payment.time}`);
    console.log(`Canceled Time: ${payment.canceledTime}`);
    console.log(`Update Timestamp: ${payment.updateTimeStamp}`);

    // Payment processing should be idempotent.
    // In production, save or enqueue this work in your application/database.
}

function jsonResponse(res, statusCode, body)
{
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (req.method !== 'POST') {
        jsonResponse(res, 405, { error: 'method not allowed' });
        return;
    }

    if (url.searchParams.get('authKey') !== expectedAuthKey) {
        jsonResponse(res, 401, { error: 'unauthorized' });
        return;
    }

    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        if (!body) {
            jsonResponse(res, 400, { error: 'empty request body' });
            return;
        }

        try {
            const payment = JSON.parse(body);
            processPayment(payment);
            jsonResponse(res, 200, { error: null });
        } catch (error) {
            jsonResponse(res, 400, { error: 'invalid json' });
        }
    });
}).listen(3000, () => {
    console.log('Webhook example is listening on http://localhost:3000/webirr-webhook?authKey=YOUR_WEBHOOK_AUTH_KEY');
});
