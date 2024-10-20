import fs from 'fs/promises';
import path from 'path';

const POSITIONS_FILE = path.join(process.cwd(), 'open_positions.json');

export async function openPosition(price, amount) {
    const position = {
        openPrice: price,
        amount: amount,
        openTimestamp: Date.now()
    };

    let positions = await getPositions();
    positions.push(position);
    await savePositions(positions);
}

export async function closePosition(currentPrice) {
    let positions = await getPositions();
    if (positions.length === 0) {
        console.log("No open positions to close.");
        return null;
    }

    const position = positions.shift(); // Get the oldest position
    const profitLoss = (currentPrice - position.openPrice) * position.amount;
    const percentageChange = ((currentPrice - position.openPrice) / position.openPrice) * 100;

    await savePositions(positions);

    return {
        openPrice: position.openPrice,
        closePrice: currentPrice,
        amount: position.amount,
        profitLoss: profitLoss,
        percentageChange: percentageChange,
        duration: (Date.now() - position.openTimestamp) / (1000 * 60 * 60) // duration in hours
    };
}

export async function getPositions() {
    try {
        const data = await fs.readFile(POSITIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function savePositions(positions) {
    await fs.writeFile(POSITIONS_FILE, JSON.stringify(positions, null, 2));
}