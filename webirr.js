const axiosModule = require('axios');
const axios = axiosModule.default || axiosModule;

const TEST_BASE_ADDRESS = 'https://api.webirr.dev';
const PROD_BASE_ADDRESS = 'https://api.webirr.net:8080';

function resolveBaseAddress(isTestEnv) {
    if (!isTestEnv) {
        return PROD_BASE_ADDRESS;
    }

    const gatewayUrl = typeof process !== 'undefined' && process.env
        ? (process.env.GATEWAY_URL || '').trim()
        : '';

    return gatewayUrl ? gatewayUrl.replace(/\/+$/, '') : TEST_BASE_ADDRESS;
}

/** 
 * A WeBirrClient instance object can be used to
 * Create, Update or Delete a Bill at WeBirr Servers, retrieve
 * Bill/Payment information, and get basic merchant statistics.
 * It is a wrapper for the REST Web Service API.
 */ 
class WeBirrClient {
    /**
     * Creates an instance of WeBirrClient object to interact with remote WebService API.
     * @param {string} merchantId
     * @param {string} apiKey
     * @param {boolean} isTestEnv
     * @param {object|null} httpClient Optional configured axios client for connection reuse/custom handlers.
     */
    constructor(merchantId, apiKey, isTestEnv = true, httpClient = null)
    {
        if (typeof apiKey !== 'string') {
            throw new TypeError('merchantId is required. Use new WeBirrClient(merchantId, apiKey, isTestEnv, httpClient).');
        }

        this._merchantId = merchantId || '';
        this._apiKey = apiKey || '';
        this._baseAddress = resolveBaseAddress(isTestEnv);
        this._client = httpClient || axios.create();
    }

    _query(params = {}) {
        const query = new URLSearchParams();
        query.append('api_key', this._apiKey);

        if (this._merchantId) {
            query.append('merchant_id', this._merchantId);
        }

        Object.keys(params || {}).forEach((key) => {
            const value = params[key] == null ? '' : params[key];
            query.append(key, value.toString());
        });

        return query.toString();
    }

    _buildUrl(path, params = {}) {
        return `${this._baseAddress}/${path}?${this._query(params)}`;
    }

    _prepareBill(bill) {
        if (!bill) {
            return bill;
        }

        if (this._merchantId) {
            bill.merchantID = this._merchantId;
        }

        if (bill.customerPhone === undefined || bill.customerPhone === null) {
            bill.customerPhone = '';
        }

        if (bill.extras === undefined || bill.extras === null) {
            bill.extras = {};
        }

        return bill;
    }

    async _send(method, path, params = {}, data = undefined) {
        const request = {
            method,
            url: this._buildUrl(path, params),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        };

        if (data !== undefined) {
            request.data = data;
        }

        try {
            const resp = await this._client.request(request);

            if (resp.status == 200) {
                return resp.data;
            }

            return { error: `http error ${resp.status} ${resp.statusText || ''}`.trim() };
        } catch (error) {
            if (error.response) {
                if (error.response.data && typeof error.response.data === 'object') {
                    return error.response.data;
                }

                return { error: `http error ${error.response.status} ${error.response.statusText || ''}`.trim() };
            }

            return { error: error.message || String(error) };
        }
    }

    /** 
     * Create a new bill at WeBirr Servers.
     * @param {object} bill represents an invoice or bill for a customer. see sample for structure of the Bill
     * @returns {object} see sample for structure of the returned ApiResponse Object 
     * Check if(ApiResponse.error == null) to see if there are errors.
     * ApiResponse.res will have the value of the returned PaymentCode on success.
     */
    async createBill(bill) {
        return await this._send('post', 'einvoice/api/bill', {}, this._prepareBill(bill));
    }   
      
    /**  
     * Update an existing bill at WeBirr Servers, if the bill is not paid yet.
     * The billReference has to be the same as the original bill created.
     * @param {object} bill represents an invoice or bill for a customer. see sample for structure of the Bill
     * @returns {object} see sample for structure of the returned ApiResponse Object 
     * Check if(ApiResponse.error == null) to see if there are errors.
     * ApiResponse.res will have the value of "OK" on success.
     */
    async updateBill(bill) {
        return await this._send('put', 'einvoice/api/bill', {}, this._prepareBill(bill));
    } 

    /** 
     * Delete an existing bill at WeBirr Servers, if the bill is not paid yet.
     * @param {string} paymentCode is the number that WeBirr Payment Gateway returns on createBill.
     * @returns {object} see sample for structure of the returned ApiResponse Object 
     * Check if(ApiResponse.error == null) to see if there are errors.
     * ApiResponse.res will have the value of "OK" on success.
     */
    async deleteBill(paymentCode) {
        return await this._send('delete', 'einvoice/api/bill', { wbc_code: paymentCode }, {});
    }  
      
    /**
     * Get Payment Status of a Bill from WeBirr Servers
     * @param {string} paymentCode is the number that WeBirr Payment Gateway returns on createBill.
     * @returns {object} see sample for structure of the returned ApiResponse Object  
     * Check if(returnedResult.error == null) to see if there are errors.
     * returnedResult.res will have `Payment` object on success (will be null otherwise!)
     * returnedResult.res?.isPaid ?? false -> will return true if the bill is paid (payment completed)
     * returnedResult.res?.data ?? null -> will have `PaymentDetail` object
     */
    async getPaymentStatus(paymentCode) { 
        return await this._send('get', 'einvoice/api/paymentStatus', { wbc_code: paymentCode });
    }

    /**
     * Get one bill by the merchant bill reference.
     * @param {string} billReference The merchant's unique bill reference.
     * @returns {object} ApiResponse.res will contain the bill details on success.
     */
    async getBillByReference(billReference) {
        return await this._send('get', 'einvoice/api/bill', { bill_reference: billReference });
    }

    /**
     * Get one bill by WeBirr payment code / WBC code.
     * @param {string} paymentCode The payment code returned by createBill.
     * @returns {object} ApiResponse.res will contain the bill details on success.
     */
    async getBillByPaymentCode(paymentCode) {
        return await this._send('get', 'einvoice/api/bill', { wbc_code: paymentCode });
    }

    /**
     * Get list of bills updated after the last processed timestamp.
     * @param {number} paymentStatus -1 for all, 0 pending, 1 unconfirmed payment, 2 paid.
     * @param {string} lastTimeStamp Timestamp cursor. Prefer a saved or recent cursor such as "20251231"; include time when needed, for example "20251231235959". Empty string means from the beginning.
     * @param {number} limit The number of bills returned per request.
     * @returns {object} ApiResponse.res will contain an array of bills on success.
     */
    async getBills(paymentStatus = -1, lastTimeStamp = '', limit = 100) {
        return await this._send('get', 'einvoice/api/bills', {
            payment_status: paymentStatus,
            last_timestamp: lastTimeStamp,
            limit
        });
    }

    /**
     * Get list of Payments from WeBirr Servers received after the last processed timestamp ( for bulk polling )
     * @param {string} lastTimeStamp The updateTimeStamp field value of the last payment record in the array retrieved before.
     * @param {number} limit The number of records returned per request based on the caller's processing capacity.
     * @returns {object} ApiResponse.res will contain an array of payment records on success.
     */
    async getPayments(lastTimeStamp = '', limit = 100) {
        return await this._send('get', 'einvoice/api/payments', {
            last_timestamp: lastTimeStamp,
            limit
        });
    }

    /**
     * Get banks and wallets configured for this merchant.
     * @returns {object} ApiResponse.res will contain an array of { bankID, name } items on success.
     */
    async getSupportedBanks() {
        return await this._send('get', 'einvoice/api/banks');
    }

    /**
     * Retrieves basic statistics about bills created and payments received over a date range.
     * @param {string} dateFrom The start date of range (format: YYYY-MM-DD).
     * @param {string} dateTo The end date of range (format: YYYY-MM-DD).
     * @returns {object} The response object containing statistics or an error message.
     */
    async getStat(dateFrom, dateTo) {
        return await this._send('get', 'merchant/stat', {
            date_from: dateFrom,
            date_to: dateTo
        });
    }

}

module.exports.WeBirrClient =  WeBirrClient;
