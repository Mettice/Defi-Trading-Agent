import { evaluateRisk } from './riskManagementAgent.js';
import { checkCompliance } from './complianceAgent.js';
import { checkLiquidity } from '../utils/fetchPrices.js';  // Assuming this fetches liquidity info

export async function executeTradeWithCrewAI(tokenAddress, amount, currentPrice, expectedPrice, gasCost) {
    try {
        // Fetch liquidity for the token
        const liquidity = await checkLiquidity(tokenAddress);
        
        // Evaluate risk (e.g., slippage, volatility)
        const isRiskOkay = await evaluateRisk(tokenAddress, currentPrice, expectedPrice);
        
        // Check compliance (e.g., gas fees, trade size limits)
        const isComplianceOkay = await checkCompliance(amount, liquidity, gasCost);

        // If both risk and compliance checks pass, proceed with the trade
        if (isRiskOkay && isComplianceOkay) {
            console.log('Trade can proceed');
            return true;
        } else {
            console.log('Trade halted by CrewAI agents');
            return false;
        }
    } catch (error) {
        // Error handling to prevent crashes
        console.error('Error in CrewAI coordination:', error);
        return false;
    }
}
