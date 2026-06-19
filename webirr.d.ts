export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type BillExtras = Record<string, JsonValue>;

export interface ApiResponse<T = unknown> {
  error?: string | null;
  errorCode?: string | number | null;
  res?: T | null;
  [key: string]: unknown;
}

export interface Bill {
  amount: string | number;
  customerCode: string;
  customerName: string;
  time: string;
  description: string;
  billReference: string;
  customerPhone?: string;
  merchantID?: string;
  extras?: BillExtras;
  [key: string]: unknown;
}

export interface BillResponse extends Partial<Bill> {
  id?: string | number;
  wbcCode?: string;
  wbc_code?: string;
  paymentStatus?: number;
  updateTimeStamp?: string;
  createdTime?: string;
  updatedTime?: string;
  [key: string]: unknown;
}

export interface PaymentDetail {
  id?: string | number;
  paymentReference?: string;
  paymentDate?: string;
  time?: string;
  confirmed?: boolean;
  confirmedTime?: string;
  bankID?: string;
  amount?: string | number;
  wbcCode?: string;
  wbc_code?: string;
  updateTimeStamp?: string;
  [key: string]: unknown;
}

export interface PaymentStatus {
  status: number;
  isPaid?: boolean;
  data?: PaymentDetail | null;
  [key: string]: unknown;
}

export interface PaymentResponse extends PaymentDetail {
  status?: number;
}

export interface Stat {
  nBills?: string | number;
  nBillsPaid?: string | number;
  nBillsUnpaid?: string | number;
  amountBills?: string | number;
  amountPaid?: string | number;
  amountUnpaid?: string | number;
  [key: string]: unknown;
}

export interface SupportedBank {
  bankID: string;
  name: string;
  [key: string]: unknown;
}

export interface HttpRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: unknown;
  [key: string]: unknown;
}

export interface HttpResponse<T = unknown> {
  status: number;
  statusText?: string;
  data: T;
  [key: string]: unknown;
}

export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResponse>;
}

export class WeBirrClient {
  constructor(apiKey: string, isTestEnv?: boolean, httpClient?: HttpClient | null);
  constructor(merchantId: string, apiKey: string, isTestEnv?: boolean, httpClient?: HttpClient | null);

  createBill(bill: Bill): Promise<ApiResponse<string>>;
  updateBill(bill: Bill): Promise<ApiResponse<string>>;
  deleteBill(paymentCode: string): Promise<ApiResponse<string>>;
  getPaymentStatus(paymentCode: string): Promise<ApiResponse<PaymentStatus>>;
  getBillByReference(billReference: string): Promise<ApiResponse<BillResponse>>;
  getBillByPaymentCode(paymentCode: string): Promise<ApiResponse<BillResponse>>;
  getBills(paymentStatus?: number, lastTimeStamp?: string, limit?: number): Promise<ApiResponse<BillResponse[]>>;
  getPayments(lastTimeStamp?: string, limit?: number): Promise<ApiResponse<PaymentResponse[]>>;
  getSupportedBanks(): Promise<ApiResponse<SupportedBank[]>>;
  getStat(dateFrom: string, dateTo: string): Promise<ApiResponse<Stat>>;
}
