const { client, printError } = require('./example-support');

async function main()
{
    const api = client();

    var paymentCode = 'PAYMENT_CODE_YOU_SAVED_AFTER_CREATING_A_NEW_BILL';  // suchas as '141 263 782';

    console.log('Getting Payment Status...');
    var r = await api.getPaymentStatus(paymentCode);

    if (!r.error) {
        // success
        if (r.res.status == 2) {
            console.log('bill is paid');
            console.log('bill payment detail');
            console.log(`Bank: ${r.res.data.bankID}`);
            console.log(`Bank Reference Number: ${r.res.data.paymentReference}`);
            console.log(`Amount Paid: ${r.res.data.amount}`);
            console.log(`Payment Date: ${r.res.data.paymentDate || r.res.data.time}`);
        } else {
            console.log('bill is pending payment');
        }
    } else {
        // fail
        printError(r);
    }
}

main();
