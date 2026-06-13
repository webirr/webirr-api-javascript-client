require('jest');
const webirr = require('../webirr');

const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID;
const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY;

if (!merchantId || !apiKey) {
    throw new Error('WEBIRR_TEST_ENV_MERCHANT_ID and WEBIRR_TEST_ENV_API_KEY are required for TestEnv smoke tests.');
}

const api = new webirr.WeBirrClient(merchantId, apiKey, true);
const billReference = `javascript/test/${Date.now()}/${Math.floor(Math.random() * 100000)}`;
const exampleCursor = '20251231';
let paymentCode = '';
let updateTimeStamp = '';
let billDeleted = false;

function sampleBill() {
    return {
        amount: '270.90',
        customerCode: 'cc01',
        customerName: 'Elias Haileselassie',
        customerPhone: '0911000000',
        time: '2021-07-22 22:14',
        description: 'hotel booking',
        billReference,
        extras: {}
    };
}

function normalizePaymentCode(value) {
    return (value || '').toString().replace(/\s+/g, '');
}

function cursorBefore(updateTimeStampValue) {
    const value = (updateTimeStampValue || '').toString();
    if (!value || !/^\d+$/.test(value)) {
        return exampleCursor;
    }

    const previous = BigInt(value) > 0n ? BigInt(value) - 1n : BigInt(value);
    return previous.toString().padStart(value.length, '0');
}

function assertNoApiError(response, operation) {
    expect(response).toBeTruthy();
    if (response.error) {
        throw new Error(`${operation} failed: ${response.error} ${response.errorCode || ''}`);
    }
}

function assertApiError(response) {
    expect(response).toBeTruthy();
    expect(response.error && response.error.length > 0).toBe(true);
}

function assertCreatedBill(bill) {
    expect(bill).toBeTruthy();
    expect((bill.billReference || '').toLowerCase()).toBe(billReference.toLowerCase());
    expect((bill.customerCode || '').toLowerCase()).toBe('cc01');
    expect(bill.customerName).toBe('Elias Haileselassie');
    expect(bill.customerPhone).toBe('0911000000');
    expect(bill.description).toBe('hotel booking');
    expect(bill.merchantID).toBe(merchantId);
    expect(normalizePaymentCode(bill.wbcCode)).toBe(normalizePaymentCode(paymentCode));
    expect(bill.updateTimeStamp).toBeTruthy();
    updateTimeStamp = bill.updateTimeStamp;
}

async function getCreatedBillByReference() {
    const response = await api.getBillByReference(billReference);
    assertNoApiError(response, 'getBillByReference');
    return response.res;
}

afterAll(async () => {
    if (paymentCode && !billDeleted) {
        await api.deleteBill(paymentCode);
    }
});

test('TestEnv createBill creates bill without manual merchant id', async () => {
    const response = await api.createBill(sampleBill());
    assertNoApiError(response, 'createBill');

    paymentCode = response.res;
    expect(paymentCode).toBeTruthy();
    expect(normalizePaymentCode(paymentCode)).toMatch(/^\d+$/);
});

test('TestEnv updateBill updates created bill', async () => {
    const bill = sampleBill();
    bill.amount = '278.00';

    const response = await api.updateBill(bill);
    assertNoApiError(response, 'updateBill');
    expect((response.res || '').toString().toLowerCase()).toBe('ok');
});

test('TestEnv getPaymentStatus returns pending for new bill', async () => {
    const response = await api.getPaymentStatus(paymentCode);
    assertNoApiError(response, 'getPaymentStatus');

    expect(response.res).toBeTruthy();
    expect(response.res.status).toBe(0);
    expect(response.res.data == null).toBe(true);
});

test('TestEnv getBillByReference returns created bill', async () => {
    const bill = await getCreatedBillByReference();
    assertCreatedBill(bill);
    expect(parseFloat(bill.amount)).toBeCloseTo(278);
});

test('TestEnv getBillByPaymentCode returns created bill', async () => {
    const response = await api.getBillByPaymentCode(paymentCode);
    assertNoApiError(response, 'getBillByPaymentCode');
    assertCreatedBill(response.res);
});

test('TestEnv getBills finds created bill', async () => {
    if (!updateTimeStamp) {
        await getCreatedBillByReference();
    }

    const response = await api.getBills(0, cursorBefore(updateTimeStamp), 100);
    assertNoApiError(response, 'getBills');
    expect(Array.isArray(response.res)).toBe(true);

    const found = response.res.find((bill) => (bill.billReference || '').toLowerCase() === billReference.toLowerCase());
    expect(found).toBeTruthy();
    assertCreatedBill(found);
});

test('TestEnv getPayments returns payment array', async () => {
    const response = await api.getPayments(exampleCursor, 10);
    assertNoApiError(response, 'getPayments');
    expect(Array.isArray(response.res)).toBe(true);
});

test('TestEnv getStat returns stat object', async () => {
    const response = await api.getStat('2025-01-01', '2030-01-31');
    assertNoApiError(response, 'getStat');
    expect(response.res).toBeTruthy();
});

test('TestEnv deleteBill removes created bill', async () => {
    const response = await api.deleteBill(paymentCode);
    assertNoApiError(response, 'deleteBill');
    expect((response.res || '').toString().toLowerCase()).toBe('ok');
    billDeleted = true;

    const deletedBill = await api.getBillByReference(billReference);
    assertApiError(deletedBill);
});
