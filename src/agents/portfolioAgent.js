import { buyToken, sellToken } from '../utils/uniswapTrader.js';  // Import buy/sell functions

export async function rebalancePortfolio(ethBalance, linkBalance) {
    const TARGET_ETH_PERCENTAGE = 70;  // Target allocation: 70% ETH, 30% LINK
    const targetEthBalance = (ethBalance + linkBalance) * (TARGET_ETH_PERCENTAGE / 100);
    const MIN_TRADE_AMOUNT = 0.001;  // Minimum trade amount to justify rebalancing
    const acceptableGasLimit = 0.002;  // Define acceptable gas limit (in ETH)

    console.log(`Rebalancing portfolio: ETH balance: ${ethBalance}, LINK balance: ${linkBalance}`);

    // If ETH balance is higher than the target, sell ETH for LINK
    if (ethBalance - targetEthBalance > MIN_TRADE_AMOUNT) {
        console.log('Rebalancing: Selling excess ETH for LINK');
        const amountToSell = ethBalance - targetEthBalance;

        // Estimate gas cost
        const estimatedGasCost = await estimateGasForSwap(amountToSell);
        if (estimatedGasCost > acceptableGasLimit) {
            console.log('Skipping rebalancing due to high gas costs.');
            return;
        }
        
        // Execute ETH -> LINK swap using the buyToken function (since we're buying LINK)
        await buyToken('0x779877A7B0D9E8603169DdbD7836e478b4624789', amountToSell);  // Replace with actual LINK token address
    } 
    // If LINK balance is higher than the target, sell LINK for ETH
    else if (linkBalance - targetEthBalance > MIN_TRADE_AMOUNT) {
        console.log('Rebalancing: Selling excess LINK for ETH');
        const amountToSell = linkBalance - targetEthBalance;

        // Estimate gas cost
        const estimatedGasCost = await estimateGasForSwap(amountToSell);
        if (estimatedGasCost > acceptableGasLimit) {
            console.log('Skipping rebalancing due to high gas costs.');
            return;
        }

        // Execute LINK -> ETH swap using the sellToken function (since we're selling LINK for ETH)
        await sellToken('0x779877A7B0D9E8603169DdbD7836e478b4624789', amountToSell);  // Replace with actual LINK token address
    } 
    else {
        console.log('Portfolio is balanced, no rebalancing needed.');
    }
}

// Placeholder function for gas estimation
async function estimateGasForSwap(amountToSell) {
    // Simulate or fetch the gas estimation logic (e.g., via Uniswap or another DEX)
    const estimatedGas = 0.0005;  // Example gas cost
    return estimatedGas;
}
