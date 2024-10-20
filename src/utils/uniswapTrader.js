import { ethers } from 'ethers';
import 'dotenv/config';

const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);

// Uniswap V2 Router address on Sepolia
const UNISWAP_ROUTER_ADDRESS = '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008';
const WETH_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'; // WETH address on Sepolia

// Simplified ABI for the swapExactETHForTokens and swapExactTokensForETH functions
const UNISWAP_ROUTER_ABI = [
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

// Helper function to estimate gas fees
async function estimateGasForSwap(amountIn, path, isBuy) {
    const routerContract = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, wallet);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;  // 20 minutes from now

    try {
        const gasEstimate = isBuy
            ? await routerContract.estimateGas.swapExactETHForTokens(0, path, wallet.address, deadline, { value: amountIn })
            : await routerContract.estimateGas.swapExactTokensForETH(amountIn, 0, path, wallet.address, deadline);
        return gasEstimate;
    } catch (error) {
        console.error("Error estimating gas:", error);
        throw error;
    }
}

// Buy tokens with estimated gas
export async function buyToken(tokenAddress, amountInEth) {
    const routerContract = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, wallet);
    const amountInWei = ethers.utils.parseEther(amountInEth.toString());
    const path = [WETH_ADDRESS, tokenAddress];  // WETH -> Token path

    try {
        console.log(`Buying ${amountInEth} ETH worth of tokens at ${tokenAddress}`);

        // Estimate gas fees for the swap
        const gasEstimate = await estimateGasForSwap(amountInWei, path, true);
        console.log(`Estimated gas for buy: ${gasEstimate}`);

        const tx = await routerContract.swapExactETHForTokens(
            0,  // Accept any amount of tokens
            path,
            wallet.address,
            Math.floor(Date.now() / 1000) + 60 * 20,  // 20 minutes from now
            { value: amountInWei, gasLimit: gasEstimate }
        );
        console.log('Transaction sent: ', tx.hash);
        await tx.wait();
        console.log('Transaction confirmed: ', tx.hash);
        return tx.hash;
    } catch (error) {
        console.error('Error executing buy order:', error);
        throw error;
    }
}

// Sell tokens with estimated gas
export async function sellToken(tokenAddress, amountInTokens) {
    const routerContract = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, wallet);
    const tokenContract = new ethers.Contract(tokenAddress, ['function approve(address spender, uint256 amount) public returns (bool)'], wallet);
    const amountIn = ethers.utils.parseEther(amountInTokens.toString());
    const path = [tokenAddress, WETH_ADDRESS];  // Token -> WETH path

    try {
        console.log(`Approving ${amountInTokens} tokens for sale`);
        const approveTx = await tokenContract.approve(UNISWAP_ROUTER_ADDRESS, amountIn);
        await approveTx.wait();
        console.log('Approval confirmed');

        // Estimate gas fees for the swap
        const gasEstimate = await estimateGasForSwap(amountIn, path, false);
        console.log(`Estimated gas for sell: ${gasEstimate}`);

        console.log(`Selling ${amountInTokens} tokens for ETH`);
        const tx = await routerContract.swapExactTokensForETH(
            amountIn,
            0,  // Accept any amount of ETH
            path,
            wallet.address,
            Math.floor(Date.now() / 1000) + 60 * 20,  // 20 minutes from now
            { gasLimit: gasEstimate }
        );
        console.log('Transaction sent: ', tx.hash);
        await tx.wait();
        console.log('Transaction confirmed: ', tx.hash);
        return tx.hash;
    } catch (error) {
        console.error('Error executing sell order:', error);
        throw error;
    }
}
