import axios from 'axios';
import { ethers } from 'ethers';
import 'dotenv/config';

const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);

// ERC20 ABI for the functions we need
const ERC20_ABI = [
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address, address) view returns (uint256)",
    "function approve(address, uint256) returns (bool)"
];

// Function to fetch real-time price from CoinGecko
async function getRealPrice(tokenId = 'chainlink', retries = 3) {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=eth`);
        return response.data[tokenId].eth;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Retrying price fetch... Attempts left: ${retries}`);
            return getRealPrice(tokenId, retries - 1);
        } else {
            console.error("Failed to fetch real-time price after retries:", error);
            throw error;
        }
    }
}

// Function to fetch historical prices for a token
export async function getHistoricalPrices(days = 14) {
    try {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/chainlink/market_chart?vs_currency=eth&days=${days}`
        );
        return response.data.prices.map(price => price[1]);
    } catch (error) {
        console.error('Error fetching historical prices:', error);
        throw error;
    }
}

// Function to fetch the token price from the blockchain
export async function getTokenPrice(tokenAddress) {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        
        const largeHolderAddress = '0x779877A7B0D9E8603169DdbD7836e478b4624789';
        const balance = await tokenContract.balanceOf(largeHolderAddress);
        
        console.log(`Symbol: ${symbol}`);
        console.log(`Decimals: ${decimals}`);
        console.log(`Balance of large holder: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
        
        const realPrice = await getRealPrice();
        console.log(`Real-time price of ${symbol}: ${realPrice} ETH`);
        
        return realPrice;
    } catch (error) {
        console.error("Error fetching token info:", error);
        throw error;
    }
}

// Function to fetch the wallet's token balance
export async function getTokenBalance(tokenAddress) {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        
        const balance = await tokenContract.balanceOf(wallet.address);
        const decimals = await tokenContract.decimals();
        const symbol = await tokenContract.symbol();
        
        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        console.log(`Your balance of ${symbol}: ${formattedBalance}`);
        
        return formattedBalance;
    } catch (error) {
        console.error("Error fetching token balance:", error);
        throw error;
    }
}

// New Function to Check Liquidity
export async function checkLiquidity(tokenAddress) {
    try {
        // Mock API or replace with an actual liquidity source (e.g., Uniswap's API)
        const response = await axios.get(`https://api.example.com/liquidity?token=${tokenAddress}`);
        const liquidity = response.data.liquidity;
        console.log(`Liquidity for token ${tokenAddress}: ${liquidity}`);
        return liquidity;
    } catch (error) {
        console.error(`Error fetching liquidity for token ${tokenAddress}:`, error);
        return 0;  // Return 0 liquidity if there's an error
    }
}
