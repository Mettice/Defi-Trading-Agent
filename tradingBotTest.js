// Import the necessary functions for testing
import { predictMarketMovement } from './src/ai/predict.js';
import { rebalancePortfolio } from './src/agents/portfolioAgent.js';
import { executeTradeWithCrewAI } from './src/agents/crewAI.js';

// Mock historical prices for CoinGecko API
const mockHistoricalPrices = [100, 101, 102, 103, 104, 105, 106, 107];

// Mock the getHistoricalPrices function
export async function getHistoricalPrices(days) {
    console.log(`Mocking CoinGecko API for ${days} days`);
    return mockHistoricalPrices;
}

// Mock Uniswap buyToken function
export async function buyToken(tokenAddress, amountInEth) {
    console.log(`Mocking buyToken for token address: ${tokenAddress}, amount: ${amountInEth} ETH`);
    return 'mock_tx_hash_buy';
}

// Mock Uniswap sellToken function
export async function sellToken(tokenAddress, amountInTokens) {
    console.log(`Mocking sellToken for token address: ${tokenAddress}, amount: ${amountInTokens} tokens`);
    return 'mock_tx_hash_sell';
}

// Mock the checkLiquidity function for CrewAI
export async function checkLiquidity(tokenAddress) {
    console.log(`Mocking liquidity check for token: ${tokenAddress}`);
    return 50000;  // Mock liquidity value
}

// Mock the evaluateRisk function for CrewAI
export async function evaluateRisk(tokenAddress, currentPrice, expectedPrice) {
    console.log(`Mocking risk evaluation for token: ${tokenAddress}, currentPrice: ${currentPrice}, expectedPrice: ${expectedPrice}`);
    return true;  // Always approve the trade in this mock
}

// Mock the checkCompliance function for CrewAI
export async function checkCompliance(amount, liquidity, gasCost) {
    console.log(`Mocking compliance check for amount: ${amount}, liquidity: ${liquidity}, gasCost: ${gasCost}`);
    return true;  // Always pass compliance in this mock
}

// Test for predictMarketMovement
async function testPrediction() {
    const currentPrice = 120;
    const decision = await predictMarketMovement(currentPrice);
    console.log(`Prediction result for current price ${currentPrice}: ${decision}`);
}

// Test for PortfolioAgent rebalancing
async function testRebalancePortfolio() {
    const ethBalance = 1.5;  // Example ETH balance
    const linkBalance = 0.5;  // Example LINK balance
    console.log('Testing Portfolio Rebalance...');
    await rebalancePortfolio(ethBalance, linkBalance);  // Run portfolio rebalancing logic
}

// Test for CrewAI trade coordination
async function testCrewAI() {
    const tokenAddress = '0x1234567890abcdef1234567890abcdef12345678';  // Example token address
    const amount = 0.1;
    const currentPrice = 100;
    const expectedPrice = 105;
    const gasCost = 0.0005;

    console.log('Testing CrewAI trade coordination...');
    const canTrade = await executeTradeWithCrewAI(tokenAddress, amount, currentPrice, expectedPrice, gasCost);
    console.log(`CrewAI trade result: ${canTrade ? 'Approved' : 'Rejected'}`);
}

// Run all tests
async function runTests() {
    await testPrediction();  // Test market prediction
    const prices = await getHistoricalPrices(14);  // Test fetching historical prices
    console.log("Fetched Historical Prices:", prices);
    
    const buyHash = await buyToken('0x1234567890abcdef1234567890abcdef12345678', 0.1);  // Test buyToken
    console.log("Buy transaction hash:", buyHash);
    
    const sellHash = await sellToken('0x1234567890abcdef1234567890abcdef12345678', 100);  // Test sellToken
    console.log("Sell transaction hash:", sellHash);

    await testRebalancePortfolio();  // Test portfolio rebalancing
    await testCrewAI();  // Test CrewAI trade coordination
}

// Execute all tests
runTests();
