const { client, printError } = require('./example-support');

async function main()
{
    const api = client();

    var paymentCode = 'PAYMENT_CODE_YOU_SAVED_AFTER_CREATING_A_NEW_BILL';  // suchas as '141 263 782';

    console.log('Deleting Bill...');
    var res = await api.deleteBill(paymentCode);

    if (!res.error) {
        // success
        console.log('bill is deleted succesfully'); //res.res will be 'OK'  no need to check here!
    } else {
        // fail
        printError(res);
    }
}

main();
