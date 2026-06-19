const { client, printError } = require('./example-support');

async function main()
{
    const api = client();

    console.log('Getting supported banks...');
    const response = await api.getSupportedBanks();

    if (!response.error) {
        for (const bank of response.res || []) {
            console.log(`${bank.bankID} - ${bank.name}`);
        }
        console.log('Use this merchant-specific list to render checkout instructions.');
    } else {
        printError(response);
    }
}

main();
