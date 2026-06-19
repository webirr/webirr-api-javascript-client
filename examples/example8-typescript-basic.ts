import { ApiResponse, Bill, PaymentStatus, SupportedBank, WeBirrClient } from "webirr";

async function main(): Promise<void> {
  const apiKey = process.env.WEBIRR_TEST_ENV_API_KEY || "YOUR_API_KEY";
  const merchantId = process.env.WEBIRR_TEST_ENV_MERCHANT_ID || "YOUR_MERCHANT_ID";

  const api = new WeBirrClient(merchantId, apiKey, true);

  const bill: Bill = {
    amount: "270.90",
    customerCode: "cc01",
    customerName: "Test Customer",
    customerPhone: "0911000000",
    time: "2026-06-18 10:00",
    description: "TypeScript example bill",
    billReference: `typescript/example/${Date.now()}`,
    extras: {}
  };

  const created: ApiResponse<string> = await api.createBill(bill);
  if (created.error) {
    console.log(`error: ${created.error}`);
    console.log(`errorCode: ${created.errorCode}`);
    return;
  }

  const paymentCode = created.res || "";
  console.log(`Payment Code = ${paymentCode}`);

  const status: ApiResponse<PaymentStatus> = await api.getPaymentStatus(paymentCode);
  if (!status.error && status.res?.status === 2) {
    console.log("bill is paid");
  } else if (!status.error) {
    console.log("bill is pending payment");
  }

  const banks: ApiResponse<SupportedBank[]> = await api.getSupportedBanks();
  if (!banks.error) {
    for (const bank of banks.res || []) {
      console.log(`${bank.bankID} - ${bank.name}`);
    }
  }
}

void main();
