import { getTokenPrice, getTokenBalance } from '../utils/fetchPrices.js';
import { checkBalance } from '../utils/walletUtils.js';
import { predictMarketMovement } from '../ai/predict.js';
import { buyToken, sellToken, executeSwap } from '../utils/uniswapTrader.js';
import { logTrade, calculatePerformance } from '../utils/performanceTracker.js';
import { openPosition, closePosition, getPositions } from '../utils/positionManager.js';
import { rebalancePortfolio } from './portfolioAgent.js';  // Portfolio management
import { executeTradeWithCrewAI } from './crewAI.js';  // CrewAI logic for risk and compliance checks

const TOKEN_ADDRESS = '0x779877A7B0D9E8603169DdbD7836e478b4624789';  // LINK token address
const MAX_DAILY_TRADES = 5;
const MAX_TRADE_AMOUNT = 0.01;  // Max amount of ETH per trade
const PROFIT_THRESHOLD = 0.05;  // Profit threshold (5%)
const LOSS_THRESHOLD = -0.03;   // Loss threshold (-3%)
const MAX_POSITION_DURATION = 24 * 60 * 60 * 1000;  // 24 hours in milliseconds
const GAS_BUFFER = 0.005;  // Gas buffer (minimum ETH required for gas fees)

let dailyTradeCount = 0;  // Tracks the number of trades made in a day

export async function startTrading() {
    try {
        console.log("Starting trading process...");

        // Step 1: Get the current ETH and token balance, and the current token price
        const ethBalance = await checkBalance();
        const tokenBalance = await getTokenBalance(TOKEN_ADDRESS);
        const currentPrice = await getTokenPrice(TOKEN_ADDRESS);

        console.log(`Current ETH balance: ${ethBalance} ETH`);
        console.log(`Current token balance: ${tokenBalance} LINK`);
        console.log(`Current token price: ${currentPrice} ETH`);

        // Step 2: Ensure ETH balance is enough for gas buffer
        if (parseFloat(ethBalance) < GAS_BUFFER) {
            console.log(`Insufficient ETH for gas buffer. Available ETH: ${ethBalance} ETH`);
            return;  // Skip trading if not enough ETH to cover gas fees
        }

        // Step 3: Check if any open positions need to be closed based on profit/loss thresholds or time limits
        await checkAndClosePositions(currentPrice);

        let openPositions = [];
        try {
            openPositions = await getPositions();  // Fetch current open positions
        } catch (error) {
            console.log("No open positions found. Starting fresh.");
        }

        if (openPositions.length > 0) {
            console.log("There's an open position. Holding.");  // Skip further actions if there are open positions
            return;
        }

        // Step 4: Predict the market movement using AI indicators (SMA, RSI, MACD, etc.)
        const decision = await predictMarketMovement(currentPrice);

        // Step 5: Limit the number of trades to avoid over-trading
        if (dailyTradeCount >= MAX_DAILY_TRADES) {
            console.log("Maximum daily trade limit reached. Holding position.");
            return;
        }

        // Step 6: Use CrewAI to check risk, compliance, and other trade checks
        const canProceedWithTrade = await executeTradeWithCrewAI(TOKEN_ADDRESS, decision, ethBalance, currentPrice);
        if (!canProceedWithTrade) {
            console.log("Trade halted by CrewAI agents due to risk or compliance check failure.");
            return;  // Exit if CrewAI stops the trade
        }

        // Step 7: If trade is approved by CrewAI, execute buy or hold based on AI decision
        if (decision === 'buy') {
            const availableEth = parseFloat(ethBalance) - GAS_BUFFER;  // Adjust ETH balance to account for gas buffer
            if (availableEth < 0.01) {
                console.log("Insufficient ETH balance to buy after considering gas buffer.");
                return;
            }
            console.log("AI suggests buying token...");
            try {
                const buyAmount = Math.min(MAX_TRADE_AMOUNT, availableEth * 0.1);
                const txHash = await executeSwap(buyAmount.toString(), TOKEN_ADDRESS);  // Execute buy order
                console.log(`Buy order executed. Transaction hash: ${txHash}`);
                await logTrade('buy', currentPrice, buyAmount, txHash);  // Log the trade
                await openPosition(currentPrice, buyAmount / currentPrice);  // Open a position
                dailyTradeCount++;  // Increment the daily trade count
            } catch (error) {
                console.error('Failed to execute buy order:', error);
            }
        } else if (decision === 'sell') {
            console.log("AI suggests holding as there's no open position to sell.");  // Hold if no open position exists
        } else {
            console.log("AI suggests holding position...");
        }

        // Step 8: Rebalance the portfolio after trade execution to maintain the target ETH/LINK ratio
        await rebalancePortfolio(ethBalance, tokenBalance);

        // Step 9: Calculate performance after the trade and log the result
        const performance = await calculatePerformance();
        if (performance) {
            console.log('Bot Performance:', performance);
        } else {
            console.log('No performance data available yet.');
        }

    } catch (error) {
        console.error("Error in trading process:", error);  // Handle any errors that occur during the trading process
    }
}

// Function to check if positions need to be closed based on thresholds or time duration
async function checkAndClosePositions(currentPrice) {
    let positions = [];
    try {
        positions = await getPositions();  // Fetch open positions
    } catch (error) {
        console.log("No open positions found to close.");
        return;
    }

    if (positions.length === 0) return;  // If no positions, return

    const position = positions[0];  // Assume managing one position at a time
    const priceChange = (currentPrice - position.openPrice) / position.openPrice;  // Calculate price change
    const duration = Date.now() - position.openTimestamp;  // Calculate position duration

    // Close the position if it meets the profit/loss threshold or duration limit
    if (priceChange >= PROFIT_THRESHOLD || priceChange <= LOSS_THRESHOLD || duration >= MAX_POSITION_DURATION) {
        console.log("Closing position based on profit/loss or duration...");
        try {
            const sellAmount = position.amount.toString();  // Get the sell amount
            const txHash = await sellToken(TOKEN_ADDRESS, sellAmount);  // Execute sell order
            console.log(`Sell order executed. Transaction hash: ${txHash}`);
            const closedPosition = await closePosition(currentPrice);  // Close the position
            await logTrade('sell', currentPrice, sellAmount, txHash);  // Log the sell trade
            console.log('Closed position:', closedPosition);
            dailyTradeCount++;  // Increment the daily trade count
        } catch (error) {
            console.error('Failed to close position:', error);
        }
    }
}
