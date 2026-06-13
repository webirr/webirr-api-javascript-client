const { client, sampleBill, printError } = require('./example-support');

async function main()
{
    const api = client();
    let bill = sampleBill(`javascript/example/${Date.now()}`);

    console.log('Creating Bill...');
    var res = await api.createBill(bill);

    if (!res.error) {
        // success
        let paymentCode = res.res;  // returns paymentcode such as 429 723 975
        console.log(`Payment Code = ${paymentCode}`); // we may want to save payment code in local db.
    } else {
        // fail
        printError(res);
        return;
    }

    // update existing bill if it is not paid
    bill.amount = '278.00';
    bill.customerName = 'Elias javascript';
    //bill.billReference = "WE CAN NOT CHANGE THIS";

    console.log('Updating Bill...');
    res = await api.updateBill(bill);

    if (!res.error) {
        // success
        console.log('bill is updated succesfully'); //res.res will be 'OK'  no need to check here!
    } else {
        // fail
        printError(res);
    }
}

main();
