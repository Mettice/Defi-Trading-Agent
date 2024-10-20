import 'dotenv/config';
import { checkBalance } from './src/utils/walletUtils.js';
import { startTrading } from './src/agents/tradingAgent.js';

async function init() {
    try {
        const ethBalance = await checkBalance();

        if (parseFloat(ethBalance) < 0.01) {
            console.log("Insufficient balance to perform trades.");
            return;
        }

        await startTrading();
    } catch (error) {
        console.error("Error in init function:", error);
    }
}

init().catch(console.error);