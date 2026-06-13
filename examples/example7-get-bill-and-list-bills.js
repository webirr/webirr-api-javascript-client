const { client, printError } = require('./example-support');

async function main()
{
    const api = client();

    const billReference = 'BILL_REFERENCE_YOU_SAVED_AFTER_CREATING_A_NEW_BILL';
    const paymentCode = 'PAYMENT_CODE_YOU_SAVED_AFTER_CREATING_A_NEW_BILL';

    console.log('Getting Bill By Reference...');
    var response = await api.getBillByReference(billReference);

    if (!response.error) {
        // success
        console.log(`Payment Code = ${response.res.wbcCode}`);
        console.log(`Payment Status = ${response.res.paymentStatus}`);
        console.log(`Last Timestamp = ${response.res.updateTimeStamp}`);
    } else {
        // fail
        printError(response);
    }

    console.log('Getting Bill By Payment Code...');
    response = await api.getBillByPaymentCode(paymentCode);

    if (!response.error) {
        // success
        console.log(`Bill Reference = ${response.res.billReference}`);
        console.log(`Payment Status = ${response.res.paymentStatus}`);
        console.log(`Last Timestamp = ${response.res.updateTimeStamp}`);
    } else {
        // fail
        printError(response);
    }

    const paymentStatus = -1;
    const lastTimeStamp = '20251231'; // can also include time parts like "20251231235959"
    const limit = 100;

    console.log('Getting Bills...');
    response = await api.getBills(paymentStatus, lastTimeStamp, limit);

    if (!response.error) {
        // success
        for (const bill of response.res || []) {
            console.log(`Bill Reference = ${bill.billReference}`);
            console.log(`Payment Code = ${bill.wbcCode}`);
            console.log(`Payment Status = ${bill.paymentStatus}`);
            console.log(`Last Timestamp = ${bill.updateTimeStamp}`);
        }
    } else {
        // fail
        printError(response);
    }
}

main();
