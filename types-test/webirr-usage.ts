import {
  ApiResponse,
  Bill,
  BillResponse,
  HttpClient,
  PaymentResponse,
  PaymentStatus,
  Stat,
  SupportedBank,
  TransientErrors,
  WeBirrClient
} from "webirr";

const httpClient: HttpClient = {
  async request(request) {
    return {
      status: 200,
      statusText: "OK",
      data: { error: null, res: request.method === "get" ? null : "OK", errorCode: null }
    };
  }
};

const preferredClient = new WeBirrClient("merchant-id", "api-key", true, httpClient);

const bill: Bill = {
  amount: "270.90",
  customerCode: "cc01",
  customerName: "Test Customer",
  customerPhone: "0911000000",
  time: "2026-06-18 10:00",
  description: "Test bill",
  billReference: "typescript/example/1",
  extras: {
    source: "types-test"
  }
};

async function runTypeUsage(): Promise<void> {
  const created: ApiResponse<string> = await preferredClient.createBill(bill);
  const paymentCode: string = created.res || "000000000";

  const updated: ApiResponse<string> = await preferredClient.updateBill(bill);
  const deleted: ApiResponse<string> = await preferredClient.deleteBill(paymentCode);
  const status: ApiResponse<PaymentStatus> = await preferredClient.getPaymentStatus(paymentCode);
  const byReference: ApiResponse<BillResponse> = await preferredClient.getBillByReference(bill.billReference);
  const byCode: ApiResponse<BillResponse> = await preferredClient.getBillByPaymentCode(paymentCode);
  const bills: ApiResponse<BillResponse[]> = await preferredClient.getBills(-1, "20251231", 10);
  const payments: ApiResponse<PaymentResponse[]> = await preferredClient.getPayments("20251231", 10);
  const supportedBanks: ApiResponse<SupportedBank[]> = await preferredClient.getSupportedBanks();
  const stat: ApiResponse<Stat> = await preferredClient.getStat("2025-01-01", "2030-01-31");
  const retryable: boolean = TransientErrors.isTransient(new Error("connection refused"));

  void updated;
  void deleted;
  void status;
  void byReference;
  void byCode;
  void bills;
  void payments;
  void supportedBanks;
  void stat;
  void retryable;
}

void runTypeUsage();
