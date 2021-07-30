require('jest');
const webirr = require('webirr');

const sampleBill = {
    amount: '270.90',
    customerCode: 'cc01',
    customerName: 'Elias Haileselassie',
    time: '2021-07-22 22:14',
    description: 'hotel booking',
    billReference: 'drt/2021/125',
    merchantID: 'x',
};

 test('createBill should get error from WebService on invalid api key - TestEnv', async () => {
   
    var bill = sampleBill;

    var api = new webirr.WeBirrClient('x', true);
    var res = await api.createBill(bill);

    expect(res.error.length > 0).toBe(true);  // should contain error

});

test('createBill should get error from WebService on invalid api key - ProdEnv', async () => {
  
    var bill = sampleBill;
    
    var api = new webirr.WeBirrClient('x', false);
    var res = await api.createBill(bill);

    expect(res.error.length > 0).toBe(true);  // should contain error

});

test('updateBill should get error from WebService on invalid api key', async () => {
   
    var bill = sampleBill;

    var api = new webirr.WeBirrClient('x', true);
    var res = await api.updateBill(bill);

    expect(res.error.length > 0).toBe(true);  // should contain error

});

test('deleteBill should get error from WebService on invalid api key', async () => {
   
    var api = new webirr.WeBirrClient('x', true);
    var res = await api.deleteBill('xxxx');

    expect(res.error.length > 0).toBe(true);  // should contain error

});

test('getPaymentStatus should get error from WebService on invalid api key', async () => {
   
    var api = new webirr.WeBirrClient('x', true);
    var res = await api.getPaymentStatus('xxxx');

    expect(res.error.length > 0).toBe(true);  // should contain error

});







