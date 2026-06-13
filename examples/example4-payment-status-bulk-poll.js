const { client, printError } = require('./example-support');

class BulkPaymentPollingConsumer {
    constructor()
    {
        this.api = client();
        this.lastTimeStamp = '20251231'; // use a saved cursor; time precision can be like "20251231235959"
    }

    async run()
    {
        await this.fetchAndProcessPayments();
    }

    async fetchAndProcessPayments()
    {
        const limit = 100;

        console.log('Getting Payments...');
        const response = await this.api.getPayments(this.lastTimeStamp, limit);

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
            printError(response);
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

new BulkPaymentPollingConsumer().run();
