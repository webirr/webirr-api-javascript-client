Official JavaScript Client Library for WeBirr Payment Gateway APIs 

This Client Library provides convenient access to WeBirr Payment Gateway APIs from JavaScript/Node/ReactNative Apps.

*Requires Javascript engine in browser or Node*

## Install

run the following command to install webirr client library

With npm

```bash
$ npm install webirr
```
With yarn

```bash
$ yarn add webirr
```

With bower

```bash
$ bower install webirr
```

## Usage

The library needs to be configured with a *merchant Id* & *API key*. You can get it by contacting [webirr.com](https://webirr.net)

> You can use this library for production or test environments. you will need to set isTestEnv=true for test, and false for production apps when creating objects of class WeBirrClient

Examples assume the WeBirr TestEnv and read credentials from environment variables:

```bash
export WEBIRR_TEST_ENV_MERCHANT_ID="YOUR_TEST_MERCHANT_ID"
export WEBIRR_TEST_ENV_API_KEY="YOUR_TEST_API_KEY"
```

Create the client with merchant ID, API key, and environment once. The client automatically sets `bill.merchantID` before sending bill create/update requests, so application code and examples should not set `merchantID` on the bill object.

```javascript
const webirr = require('webirr');

const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID || 'YOUR_MERCHANT_ID';
const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY || 'YOUR_API_KEY';

var api = new webirr.WeBirrClient(merchantId, apiKey, true);
```

The old constructor still works for existing applications:

```javascript
var api = new webirr.WeBirrClient(apiKey, true);
```

## Example

### Creating a new Bill / Updating an existing Bill on WeBirr Servers

```javascript

const webirr = require('webirr');

async function main() 
{
  const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY || 'YOUR_API_KEY';
  const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID || 'YOUR_MERCHANT_ID';

  var api = new webirr.WeBirrClient(merchantId, apiKey, true);

  let bill = {
    amount: '270.90',
    customerCode: 'cc01',  // it can be email address or phone number if you dont have customer code
    customerName: 'Elias Haileselassie',
    customerPhone: '0911000000',
    time: '2021-07-22 22:14',   // your bill time, always in this format
    description: 'hotel booking',
    billReference: `javascript/example/${Date.now()}`, // your unique reference number
    extras: {}
  };

  console.log('Creating Bill...');
  var res = await api.createBill(bill);
  
  if (!res.error) {
    // success
    let paymentCode = res.res;  // returns paymentcode such as 429 723 975
    console.log( `Payment Code = ${paymentCode}`); // we may want to save payment code in local db.

  } else {
    // fail
    console.log(`error: ${res.error}`);
    console.log(
        `errorCode: ${res.errorCode}`); // can be used to handle specific busines error such as ERROR_INVLAID_INPUT_DUP_REF
  }

  // update existing bill if it is not paid
  bill.amount = "278.00";
  bill.customerName = 'Elias javascript';
  //bill.billReference = "WE CAN NOT CHANGE THIS";

  console.log('Updating Bill...');
  res = await api.updateBill(bill);

  if (!res.error) {
    // success
    console.log('bill is updated succesfully'); //res.res will be 'OK'  no need to check here!
  } else {
    // fail
    console.log(`error: ${res.error}`);
    console.log(`errorCode: ${res.errorCode}`); // can be used to handle specific busines error such as ERROR_INVLAID_INPUT
  }

}

main();

```

### Getting a Bill and Listing Bills

```javascript

const webirr = require('webirr');

async function main() 
{
  const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY || 'YOUR_API_KEY';
  const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID || 'YOUR_MERCHANT_ID';

  var api = new webirr.WeBirrClient(merchantId, apiKey, true);

  var billReference = 'BILL_REFERENCE_YOU_SAVED_AFTER_CREATING_A_NEW_BILL';
  var paymentCode = 'PAYMENT_CODE_YOU_SAVED_AFTER_CREATING_A_NEW_BILL';

  console.log('Getting Bill By Reference...');
  var res = await api.getBillByReference(billReference);

  if (!res.error) {
    // success
    console.log(`Payment Code = ${res.res.wbcCode}`);
    console.log(`Payment Status = ${res.res.paymentStatus}`);
    console.log(`Last Timestamp = ${res.res.updateTimeStamp}`);
  } else {
    // fail
    console.log(`error: ${res.error}`);
    console.log(`errorCode: ${res.errorCode}`);
  }

  console.log('Getting Bill By Payment Code...');
  res = await api.getBillByPaymentCode(paymentCode);

  if (!res.error) {
    // success
    console.log(`Bill Reference = ${res.res.billReference}`);
    console.log(`Payment Status = ${res.res.paymentStatus}`);
    console.log(`Last Timestamp = ${res.res.updateTimeStamp}`);
  } else {
    // fail
    console.log(`error: ${res.error}`);
    console.log(`errorCode: ${res.errorCode}`);
  }

  console.log('Listing Bills...');
  var paymentStatus = -1; // -1 all, 0 pending, 1 unconfirmed payment, 2 paid.
  var lastTimeStamp = '20251231'; // Date-only cursor; use "20251231235959" when you need time precision.
  var limit = 10;

  res = await api.getBills(paymentStatus, lastTimeStamp, limit);

  if (!res.error) {
    // success
    console.log(`Bills returned: ${(res.res || []).length}`);
    for (const bill of res.res || []) {
      console.log(`Bill Reference = ${bill.billReference}`);
      console.log(`Payment Code = ${bill.wbcCode}`);
      console.log(`Payment Status = ${bill.paymentStatus}`);
      console.log(`Last Timestamp = ${bill.updateTimeStamp}`);
    }
  } else {
    // fail
    console.log(`error: ${res.error}`);
    console.log(`errorCode: ${res.errorCode}`);
  }
}

main();

```

Timestamp cursors can be date-only (`yyyyMMdd`) or include time (`yyyyMMddHHmmss`). Use empty string only when you intentionally want all history from the beginning.

### Getting Payment status of an existing Bill from WeBirr Servers

```javascript

const webirr = require('webirr');

async function main() 
{
  const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY || 'YOUR_API_KEY';
  const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID || 'YOUR_MERCHANT_ID';
  
  var api = new webirr.WeBirrClient(merchantId, apiKey, true);

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
    } else
      console.log('bill is pending payment');
  } else {
    // fail
    console.log(`error: ${r.error}`);
    console.log( `errorCode: ${r.errorCode}`); // can be used to handle specific busines error such as ERROR_INVLAID_INPUT
  }

}

main();

```  
*Sample object returned from getPaymentStatus()*

```javascript
{
  error: null,
  res: {
    status: 2,
    data: {
      id: 111112347,
      paymentReference: '8G3303GHJN',
      paymentDate: '2021-07-03 10:25:33',
      confirmed: true,
      confirmedTime: '2021-07-03 10:25:35',
      bankID: 'cbe_birr',
      time: '2021-07-03 10:25:33',
      amount: '4.60',
      wbcCode: '624 549 955',
      updateTimeStamp: '20210703102535000001'
    }
  },
  errorCode: null
}

```

`paymentDate` is the preferred payment time field. `time` is kept as a legacy alias where it is returned by existing API payloads.

### Deleting an existing Bill from WeBirr Servers (if it is not paid)

```javascript

const webirr = require('webirr');

async function main() 
{
  const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY || 'YOUR_API_KEY';
  const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID || 'YOUR_MERCHANT_ID';

  var api = new webirr.WeBirrClient(merchantId, apiKey, true);

  var paymentCode = 'PAYMENT_CODE_YOU_SAVED_AFTER_CREATING_A_NEW_BILL';  // suchas as '141 263 782';
  
  console.log('Deleting Bill...');
  var res = await api.deleteBill(paymentCode);

  if (!res.error) {
    // success
    console.log('bill is deleted succesfully'); //res.res will be 'OK'  no need to check here!
  } else {
    // fail
    console.log(`error: ${res.error}`);
    console.log(`errorCode: ${res.errorCode}`); // can be used to handle specific bussines error such as ERROR_INVLAID_INPUT
  }
  
}  

main();

```  

### Getting list of Payments and process them with Bulk Polling Consumer

```javascript

const webirr = require('webirr');

class BulkPaymentPollingConsumer {
  constructor()
  {
    const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY || 'YOUR_API_KEY';
    const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID || 'YOUR_MERCHANT_ID';

    this.api = new webirr.WeBirrClient(merchantId, apiKey, true);
    this.lastTimeStamp = '20251231'; // use a saved cursor; time precision can be like "20251231235959"
  }

  async Run()
  {
    await this.fetchAndProcessPayments();
  }

  async fetchAndProcessPayments()
  {
    const limit = 100;

    console.log('Getting Payments...');
    var response = await this.api.getPayments(this.lastTimeStamp, limit);

    if (!response.error) {
      // success
      for (const payment of response.res || []) {
        this.processPayment(payment);
        if (payment.updateTimeStamp) {
          this.lastTimeStamp = payment.updateTimeStamp;
          console.log(`Last Timestamp: ${this.lastTimeStamp}`); // save updateTimeStamp to your database for the next getPayments() call
        }
      }
    } else {
      // fail
      console.log(`error: ${response.error}`);
      console.log(`errorCode: ${response.errorCode}`);
    }
  }

  processPayment(payment)
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
  }
}

new BulkPaymentPollingConsumer().Run();

```

Bulk polling should persist `updateTimeStamp` only after processing the batch successfully. Polling processors should be idempotent because duplicate/redundant reads are possible.

### Webhooks - Payment processing using Webhook Callbacks

WeBirr can call your HTTPS webhook endpoint when payment updates happen. Validate that the request method is POST, authenticate the request with an `authKey` from the query string or your preferred signed gateway rule, parse the JSON payment payload, and process it idempotently.

```javascript

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
  req.on('data', (chunk) => body += chunk);
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
}).listen(3000);

```

### Gettting basic Statistics about bills created and payments received for a date range

```javascript

const webirr = require('webirr');

async function main() 
{
  const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY || 'YOUR_API_KEY';
  const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID || 'YOUR_MERCHANT_ID';

  var api = new webirr.WeBirrClient(merchantId, apiKey, true);

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
    console.log(`error: ${response.error}`);
    console.log(`errorCode: ${response.errorCode}`);
  }
}

main();

```

## Standalone Examples

The `examples` directory has runnable examples equivalent to the README sections:

```bash
node examples/example1-create-update-bill.js
node examples/example2-payment-status-single-poll.js
node examples/example3-delete-bill.js
node examples/example4-payment-status-bulk-poll.js
node examples/example5-stat-report.js
node examples/example6-payment-status-webhook.js
node examples/example7-get-bill-and-list-bills.js
```

## Tests

Fast tests cover endpoint shape, merchant ID handling, request defaults, and invalid API-key behavior:

```bash
npm test
```

Live TestEnv smoke tests call the real TestEnv endpoints and require credentials:

```bash
export WEBIRR_TEST_ENV_MERCHANT_ID="YOUR_TEST_MERCHANT_ID"
export WEBIRR_TEST_ENV_API_KEY="YOUR_TEST_API_KEY"
npm run test:testenv
```

## Reusing an Axios Client

For batch or mass bill workloads, you can pass a configured axios client so your application controls timeout, interceptors, and connection reuse:

```javascript
const http = require('http');
const https = require('https');
const axios = require('axios');
const webirr = require('webirr');

const httpClient = axios.create({
  timeout: 30000,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true })
});

const api = new webirr.WeBirrClient(merchantId, apiKey, true, httpClient);
```
