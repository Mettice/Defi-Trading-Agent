import { getHistoricalPrices } from '../utils/fetchPrices.js';
import { analyzeSentiment } from './sentimentAgent.js';  // Import the sentiment analysis function

// Helper function to calculate Simple Moving Average (SMA)
function calculateSMA(prices, period) {
    if (prices.length < period) {
        console.error("Not enough data to calculate SMA");
        return null;
    }
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
}

// Helper function to calculate Relative Strength Index (RSI)
function calculateRSI(prices, period) {
    if (prices.length < period) return null;
    let gains = 0;
    let losses = 0;
    for (let i = 1; i < prices.length; i++) {
        const difference = prices[i] - prices[i - 1];
        if (difference >= 0) {
            gains += difference;
        } else {
            losses -= difference;
        }
    }
    const averageGain = gains / period;
    const averageLoss = losses / period;
    const relativeStrength = averageGain / averageLoss;
    return 100 - (100 / (1 + relativeStrength));
}

// Helper function to calculate Exponential Moving Average (EMA)
function calculateEMA(prices, period) {
    const k = 2 / (period + 1);  // Smoothing factor
    let ema = [prices[0]];  // Initialize EMA with the first price
    for (let i = 1; i < prices.length; i++) {
        ema.push(prices[i] * k + ema[i - 1] * (1 - k));  // EMA formula
    }
    return ema;
}

// Helper function to calculate MACD (Moving Average Convergence Divergence)
function calculateMACD(prices) {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macd = ema12.map((value, index) => value - ema26[index]);  // MACD Line

    const signal = calculateEMA(macd, 9);  // Signal Line
    const histogram = macd.map((value, index) => value - signal[index]);  // MACD Histogram

    return { macd: macd[macd.length - 1], signal: signal[signal.length - 1], histogram: histogram[histogram.length - 1] };
}

export async function predictMarketMovement(currentPrice, tokenId = 'chainlink') {
    console.log("Analyzing market data...");
    
    const numericPrice = Number(currentPrice);
    if (isNaN(numericPrice)) {
        console.error("Invalid price data");
        return "hold";
    }

    // Fetch historical prices (last 14 days)
    const historicalPrices = await getHistoricalPrices(14);

    if (historicalPrices.length < 14) {
        console.warn("Not enough historical data. Holding position as a safeguard.");
        return "hold";  // Fallback if not enough data
    }

    // Fetch sentiment score
    const sentimentScore = await analyzeSentiment(tokenId);  // Sentiment analysis based on the tokenId
    console.log(`Sentiment Score: ${sentimentScore}`);

    // Calculate simple moving averages (SMA)
    const sma7 = calculateSMA(historicalPrices, 7);
    const sma14 = calculateSMA(historicalPrices, 14);

    // Calculate Relative Strength Index (RSI)
    const rsi = calculateRSI(historicalPrices, 14);

    // Calculate MACD
    const macd = calculateMACD(historicalPrices);

    console.log(`Current price: ${numericPrice}`);
    console.log(`7-day SMA: ${sma7}`);
    console.log(`14-day SMA: ${sma14}`);
    console.log(`14-day RSI: ${rsi}`);
    console.log(`MACD: ${macd.macd}, Signal: ${macd.signal}, Histogram: ${macd.histogram}`);

    // Circuit Breaker: Stop trading if price moves by > 20% in either direction
    const priceChange = Math.abs((numericPrice - sma7) / sma7);
    if (priceChange > 0.20) {
        console.warn("Price movement exceeds 20%. Circuit breaker triggered. Holding position.");
        return "hold";
    }

    // Adjust buy/sell thresholds based on market volatility
    let volatilityMultiplier = 1;
    if (rsi > 70 || rsi < 30) {
        volatilityMultiplier = 1.5;  // Increase thresholds during volatile times
    }

    // **Incorporate Sentiment into the Decision**:
    // If sentiment is strongly positive or negative, it can influence the decision.
    if (sentimentScore > 3 && numericPrice > sma7 * 1.02 * volatilityMultiplier && rsi > 60) {
        console.log("Positive sentiment and price above SMA suggest potential overbought - AI suggests selling");
        return "sell";
    } else if (sentimentScore < -3 && numericPrice < sma7 * 0.98 * volatilityMultiplier && rsi < 40) {
        console.log("Negative sentiment and price below SMA suggest potential oversold - AI suggests buying");
        return "buy";
    }

    // If the specific condition isn't met, proceed with the multi-indicator approach
    let buySignals = 0;
    let sellSignals = 0;

    // SMA Cross
    if (sma7 > sma14) buySignals++;
    else if (sma7 < sma14) sellSignals++;

    // Price vs SMA
    if (numericPrice > sma7 * 1.01) sellSignals++;
    else if (numericPrice < sma7 * 0.99) buySignals++;

    // RSI
    if (rsi > 70) sellSignals++;
    else if (rsi < 30) buySignals++;

    // MACD
    if (macd.histogram > 0 && macd.macd > macd.signal) buySignals++;
    else if (macd.histogram < 0 && macd.macd < macd.signal) sellSignals++;

    console.log(`Buy signals: ${buySignals}, Sell signals: ${sellSignals}`);

    if (buySignals >= 3) {
        console.log("Multiple indicators suggest buying");
        return "buy";
    } else if (sellSignals >= 3) {
        console.log("Multiple indicators suggest selling");
        return "sell";
    } else {
        console.log("Indicators are mixed - AI suggests holding");
        return "hold";
    }
}
