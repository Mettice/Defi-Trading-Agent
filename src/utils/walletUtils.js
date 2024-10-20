import { ethers } from 'ethers';
import 'dotenv/config';

// Set up Ethereum provider using Alchemy
const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);

console.log(wallet);  // Just to confirm the wallet object is correctly initialized

// Function to check the wallet balance
export async function checkBalance() {
    try {
        const balance = await provider.getBalance(wallet.address);
        const formattedBalance = ethers.utils.formatEther(balance);
        console.log("Wallet balance:", formattedBalance, "ETH");
        return formattedBalance;
    } catch (error) {
        console.error('Error fetching balance:', error);
        throw error;
    }
}