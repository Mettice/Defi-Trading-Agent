import fs from 'fs/promises';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'trading_log.json');

export async function logTrade(action, price, amount, transactionHash) {
    const trade = {
        timestamp: new Date().toISOString(),
        action,
        price,
        amount,
        transactionHash
    };

    let trades = [];
    try {
        const data = await fs.readFile(LOG_FILE, 'utf8');
        trades = JSON.parse(data);
    } catch (error) {
        // File doesn't exist or is empty, start with an empty array
        if (error.code !== 'ENOENT') {
            console.error('Error reading trading log:', error);
        }
    }

    trades.push(trade);
    await fs.writeFile(LOG_FILE, JSON.stringify(trades, null, 2));
}

export async function calculatePerformance() {
    try {
        let trades = [];
        try {
            const data = await fs.readFile(LOG_FILE, 'utf8');
            trades = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('No trading history found. Starting fresh.');
                return null;
            }
            throw error;
        }

        let totalBought = 0;
        let totalSold = 0;
        let buyVolume = 0;
        let sellVolume = 0;

        trades.forEach(trade => {
            if (trade.action === 'buy') {
                totalBought += trade.amount;
                buyVolume += trade.amount * trade.price;
            } else if (trade.action === 'sell') {
                totalSold += trade.amount;
                sellVolume += trade.amount * trade.price;
            }
        });

        const profitLoss = sellVolume - buyVolume;
        const numTrades = trades.length;

        return {
            profitLoss,
            numTrades,
            totalBought,
            totalSold
        };
    } catch (error) {
        console.error('Error calculating performance:', error);
        return null;
    }
}