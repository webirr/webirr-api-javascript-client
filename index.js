const axios = require('axios').default;

/** 
 * A WeBirrClient instance object can be used to
 * Create, Update or Delete a Bill at WeBirr Servers and also to
 * Get the Payment Status of a bill.
 * It is a wrapper for the REST Web Service API.
 */ 
class WeBirrClient {
    /**
     * Creates an instance of WeBirrClient object to interact with remote WebService API.
     * @param {string} apiKey 
     * @param {boolean} isTestEnv 
     */
    constructor(apiKey, isTestEnv = true)
    {
        this._apiKey = apiKey;
        this._baseAddress = isTestEnv? 'https://api.webirr.com' : 'https://api.webirr.com:8080';
    }

/** 
 * Create a new bill at WeBirr Servers.
 * @param {object} bill represents an invoice or bill for a customer. see sample for structure of the Bill
 * @returns {object} see sample for structure of the returned ApiResponse Object 
 * Check if(ApiResponse.error == null) to see if there are errors.
 * ApiResponse.res will have the value of the returned PaymentCode on success.
 */
async createBill(bill) {
      var resp = await axios({
          method: 'post',
          url: `${this._baseAddress}/einvoice/api/postbill?api_key=${this._apiKey}`,
          headers: {"Content-Type": "application/json"},
          data: JSON.stringify(bill) } );

          if (resp.status == 200) 
            return resp.data;
          else 
            return { error: `http error ${resp.status} ${resp.statusText}` };
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

    var resp = await axios({
        method: 'put',
        url: `${this._baseAddress}/einvoice/api/postbill?api_key=${this._apiKey}`,
        headers: {"Content-Type": "application/json"},
        data: JSON.stringify(bill) } );

        if (resp.status == 200) 
          return resp.data;
        else 
          return { error: `http error ${resp.status} ${resp.statusText}` }; 

  } 

  /** 
   * Delete an existing bill at WeBirr Servers, if the bill is not paid yet.
   * @param {string} paymentCode is the number that WeBirr Payment Gateway returns on createBill.
   * @returns {object} see sample for structure of the returned ApiResponse Object 
   * Check if(ApiResponse.error == null) to see if there are errors.
   * ApiResponse.res will have the value of "OK" on success.
   */
async deleteBill(paymentCode) {
      var resp = await axios({
        method: 'put',
        url: `${this._baseAddress}/einvoice/api/deletebill?api_key=${this._apiKey}&wbc_code=${paymentCode}`} );

        if (resp.status == 200) 
          return resp.data;
        else 
          return { error: `http error ${resp.status} ${resp.statusText}` }; 

  }  
  
/**
 * Get Payment Status of a bill from WeBirr Servers
 * @param {string} paymentCode is the number that WeBirr Payment Gateway returns on createBill.
 * @returns {object} see sample for structure of the returned ApiResponse Object  
 * Check if(returnedResult.error == null) to see if there are errors.
 * returnedResult.res will have `Payment` object on success (will be null otherwise!)
 * returnedResult.res?.isPaid ?? false -> will return true if the bill is paid (payment completed)
 * returnedResult.res?.data ?? null -> will have `PaymentDetail` object
 */
async getPaymentStatus(paymentCode) { 
        var resp = await axios(
            `${this._baseAddress}/einvoice/api/getPaymentStatus?api_key=${this._apiKey}&wbc_code=${paymentCode}`);
        if (resp.status == 200) 
          return resp.data;
        else 
          return { error: `http error ${resp.status} ${resp.statusText}` };
      }

}

module.exports.WeBirrClient =  WeBirrClient;