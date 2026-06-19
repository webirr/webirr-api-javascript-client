require('jest');
const webirr = require('../webirr');

const exampleCursor = '20251231';

function sampleBill() {
    return {
        amount: '270.90',
        customerCode: 'cc01',
        customerName: 'Elias Haileselassie',
        customerPhone: '0911000000',
        time: '2021-07-22 22:14',
        description: 'hotel booking',
        billReference: 'javascript/2021/125',
        merchantID: 'x',
        extras: {}
    };
}

function mockHttpClient(response = { status: 200, data: { error: null, res: 'OK', errorCode: null } }) {
    const requests = [];
    return {
        requests,
        request: jest.fn(async (request) => {
            requests.push(request);
            return response;
        })
    };
}

function endpointCalls(api) {
    return {
        createBill: () => api.createBill(sampleBill()),
        updateBill: () => api.updateBill(sampleBill()),
        deleteBill: () => api.deleteBill('123 456 789'),
        getPaymentStatus: () => api.getPaymentStatus('123 456 789'),
        getBillByReference: () => api.getBillByReference('javascript/unit/1'),
        getBillByPaymentCode: () => api.getBillByPaymentCode('123 456 789'),
        getBills: () => api.getBills(-1, exampleCursor, 10),
        getPayments: () => api.getPayments(exampleCursor, 10),
        getSupportedBanks: () => api.getSupportedBanks(),
        getStat: () => api.getStat('2025-01-01', '2025-01-02')
    };
}

const endpoints = [
    ['createBill', 'post', 'einvoice/api/bill', {}],
    ['updateBill', 'put', 'einvoice/api/bill', {}],
    ['deleteBill', 'delete', 'einvoice/api/bill', { wbc_code: '123 456 789' }],
    ['getPaymentStatus', 'get', 'einvoice/api/paymentStatus', { wbc_code: '123 456 789' }],
    ['getBillByReference', 'get', 'einvoice/api/bill', { bill_reference: 'javascript/unit/1' }],
    ['getBillByPaymentCode', 'get', 'einvoice/api/bill', { wbc_code: '123 456 789' }],
    ['getBills', 'get', 'einvoice/api/bills', { payment_status: '-1', last_timestamp: exampleCursor, limit: '10' }],
    ['getPayments', 'get', 'einvoice/api/payments', { last_timestamp: exampleCursor, limit: '10' }],
    ['getSupportedBanks', 'get', 'einvoice/api/banks', {}],
    ['getStat', 'get', 'merchant/stat', { date_from: '2025-01-01', date_to: '2025-01-02' }]
];

test('preferred constructor sets bill merchant id before sending', async () => {
    const httpClient = mockHttpClient();
    const api = new webirr.WeBirrClient('merchant-from-client', 'api-key', true, httpClient);
    const bill = sampleBill();

    await api.createBill(bill);

    expect(httpClient.requests[0].data.merchantID).toBe('merchant-from-client');
});

test('legacy constructor does not overwrite existing bill merchant id with empty client merchant id', async () => {
    const httpClient = mockHttpClient();
    const api = new webirr.WeBirrClient('api-key', true, httpClient);
    const bill = sampleBill();
    bill.merchantID = 'merchant-on-bill';

    await api.createBill(bill);

    expect(httpClient.requests[0].data.merchantID).toBe('merchant-on-bill');
});

test('constructor can use injected axios client for requests', async () => {
    const httpClient = mockHttpClient({ status: 200, data: { error: null, res: 'OK', errorCode: null } });
    const api = new webirr.WeBirrClient('merchant-from-client', 'api-key', true, httpClient);

    const response = await api.deleteBill('123 456 789');

    expect(response.res).toBe('OK');
    expect(httpClient.request).toHaveBeenCalledTimes(1);
    expect(httpClient.requests[0].url).toContain('merchant_id=merchant-from-client');
});

test.each(endpoints)('%s includes merchant_id when configured', async (endpoint, method, path, expectedQuery) => {
    const httpClient = mockHttpClient();
    const api = new webirr.WeBirrClient('merchant-from-client', 'api-key', true, httpClient);

    await endpointCalls(api)[endpoint]();

    const request = httpClient.requests[0];
    const url = new URL(request.url);
    expect(request.method).toBe(method);
    expect(request.headers.Accept).toBe('application/json');
    expect(request.headers['Content-Type']).toBe('application/json');
    expect(request.url).toContain(`/${path}?`);
    expect(url.searchParams.get('api_key')).toBe('api-key');
    expect(url.searchParams.get('merchant_id')).toBe('merchant-from-client');

    Object.keys(expectedQuery).forEach((key) => {
        expect(url.searchParams.get(key)).toBe(expectedQuery[key]);
    });
});

test.each(endpoints)('%s omits merchant_id when client merchant id is empty', async (endpoint) => {
    const httpClient = mockHttpClient();
    const api = new webirr.WeBirrClient('api-key', true, httpClient);

    await endpointCalls(api)[endpoint]();

    const url = new URL(httpClient.requests[0].url);
    expect(url.searchParams.has('merchant_id')).toBe(false);
});

test('bill defaults customerPhone and extras before sending', async () => {
    const httpClient = mockHttpClient();
    const api = new webirr.WeBirrClient('merchant-from-client', 'api-key', true, httpClient);
    const bill = sampleBill();
    delete bill.customerPhone;
    delete bill.extras;

    await api.createBill(bill);

    expect(httpClient.requests[0].data.customerPhone).toBe('');
    expect(httpClient.requests[0].data.extras).toEqual({});
});

test('bill keeps populated extras as an object before sending', async () => {
    const httpClient = mockHttpClient();
    const api = new webirr.WeBirrClient('merchant-from-client', 'api-key', true, httpClient);
    const bill = sampleBill();
    bill.extras = { invoiceNo: 'INV-001', branch: 'main' };

    await api.createBill(bill);

    expect(httpClient.requests[0].data.extras).toEqual({ invoiceNo: 'INV-001', branch: 'main' });
});

test('paymentDate is preferred while legacy time alias remains available in raw payment data', async () => {
    const payment = {
        paymentDate: '2025-01-01 10:00:00',
        time: '2025-01-01 10:00:00'
    };

    expect(payment.paymentDate).toBe('2025-01-01 10:00:00');
    expect(payment.time).toBe(payment.paymentDate);
});

test('createBill should get error from WebService on invalid api key - TestEnv', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.createBill(sampleBill());

    expect(res.error.length > 0).toBe(true);
});

test('createBill should get error from WebService on invalid api key - ProdEnv', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', false);
    var res = await api.createBill(sampleBill());

    expect(res.error.length > 0).toBe(true);
});

test('updateBill should get error from WebService on invalid api key', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.updateBill(sampleBill());

    expect(res.error.length > 0).toBe(true);
});

test('deleteBill should get error from WebService on invalid api key', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.deleteBill('xxxx');

    expect(res.error.length > 0).toBe(true);
});

test('getPaymentStatus should get error from WebService on invalid api key', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.getPaymentStatus('xxxx');

    expect(res.error.length > 0).toBe(true);
});

test('getBillByReference should get error from WebService on invalid api key', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.getBillByReference('missing-reference');

    expect(res.error.length > 0).toBe(true);
});

test('getBillByPaymentCode should get error from WebService on invalid api key', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.getBillByPaymentCode('xxxx');

    expect(res.error.length > 0).toBe(true);
});

test('getBills should get error from WebService on invalid api key', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.getBills(-1, exampleCursor, 10);

    expect(res.error.length > 0).toBe(true);
});

test('getPayments should get error from WebService on invalid api key', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.getPayments(exampleCursor, 10);

    expect(res.error.length > 0).toBe(true);
});

test('getSupportedBanks should get error from WebService on invalid api key', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.getSupportedBanks();

    expect(res.error.length > 0).toBe(true);
});

test('getSupportedBanks maps supported bank response fields', async () => {
    const httpClient = mockHttpClient({
        status: 200,
        data: {
            error: null,
            res: [
                { bankID: 'cbe_mobile', name: 'CBE Mobile Banking' }
            ],
            errorCode: null
        }
    });
    const api = new webirr.WeBirrClient('merchant-from-client', 'api-key', true, httpClient);

    const res = await api.getSupportedBanks();

    expect(res.error).toBeNull();
    expect(res.res[0].bankID).toBe('cbe_mobile');
    expect(res.res[0].name).toBe('CBE Mobile Banking');
});

test('getStat should get error from WebService on invalid api key', async () => {
    var api = new webirr.WeBirrClient('invalid-merchant', 'x', true);
    var res = await api.getStat('2025-01-01', '2025-01-02');

    expect(res.error.length > 0).toBe(true);
});
