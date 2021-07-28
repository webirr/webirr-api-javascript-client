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

The library needs to be configured with a *merchant Id* & *API key*. You can get it by contacting [webirr.com](https://webirr.com)

> You can use this library for production or test environments. you will need to set isTestEnv=true for test, and false for production apps when creating objects of class WeBirrClient

## Example

### Creating a new Bill / Updating an existing Bill on WeBirr Servers

```javascript

const webirr = require('webirr');

async function main() 
{
  const apiKey = 'YOUR_API_KEY';
  const merchantId = 'YOUR_MERCHANT_ID';

  var api = new webirr.WeBirrClient(apiKey, true);

  let bill = {
    amount: '270.90',
    customerCode: 'cc01',  // it can be email address or phone number if you dont have customer code
    customerName: 'Elias Haileselassie',
    time: '2021-07-22 22:14',   // your bill time, always in this format
    description: 'hotel booking',
    billReference: 'drt/2021/131', // your unique reference number
    merchantID: merchantId,
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

### Getting Payment status of an existing Bill from WeBirr Servers

```javascript

const webirr = require('webirr');

async function main() 
{
  const apiKey = 'YOUR_API_KEY';
  const merchantId = 'YOUR_MERCHANT_ID';

  var api = new webirr.WeBirrClient(apiKey, true);

  var paymentCode = 'PAYMENT_CODE_YOU_SAVED_AFTER_CREATING_A_NEW_BILL'  // suchas as '141 263 782';
  
  console.log('Getting Payment Status...');
  var r = await api.getPaymentStatus('624549955')

  if (!r.error) {
    // success
    if (r.res.status == 2) {
      console.log('bill is paid');
      console.log('bill payment detail');
      console.log(`Bank: ${r.res.data.bankID}`);
      console.log(`Bank Reference Number: ${r.res.data.paymentReference}`);
      console.log('Amount Paid: ${r.res?.data?.amount}');
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
      confirmed: true,
      confirmedTime: '2021-07-03 10:25:35',
      bankID: 'cbe_birr',
      time: '2021-07-03 10:25:33',
      amount: '4.60',
      wbcCode: '624 549 955'
    }
  },
  errorCode: null
}

```

### Deleting an existing Bill from WeBirr Servers (if it is not paid)

```javascript

const webirr = require('webirr');

async function main() 
{
  const apiKey = 'YOUR_API_KEY';
  const merchantId = 'YOUR_MERCHANT_ID';

  var api = new webirr.WeBirrClient(apiKey, true);

  var paymentCode = 'PAYMENT_CODE_YOU_SAVED_AFTER_CREATING_A_NEW_BILL'  // suchas as '141 263 782';
  
  console.log('Deleting Bill...');
  res = await api.deleteBill(paymentCode);

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