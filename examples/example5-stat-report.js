const { client, printError } = require('./example-support');

async function main()
{
    const api = client();

    const dateFrom = '2025-01-01';
    const dateTo = '2030-01-31';

    console.log('Getting Stat...');
    var response = await api.getStat(dateFrom, dateTo);

    if (!response.error) {
        // success
        console.log(`Bills Created: ${response.res.nBills}`);
        console.log(`Bills Paid: ${response.res.nBillsPaid}`);
        console.log(`Bills Unpaid: ${response.res.nBillsUnpaid}`);
        console.log(`Amount Bills: ${response.res.amountBills}`);
        console.log(`Amount Paid: ${response.res.amountPaid}`);
        console.log(`Amount Unpaid: ${response.res.amountUnpaid}`);
    } else {
        // fail
        printError(response);
    }
}

main();
