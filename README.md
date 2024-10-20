DeFi Trading Agent
Overview
DeFi Trading Agent is an automated trading bot designed to trade cryptocurrencies on decentralized exchanges (DEXes) like Uniswap. It leverages technical analysis indicators such as SMA (Simple Moving Averages), RSI (Relative Strength Index), and MACD (Moving Average Convergence Divergence) to predict market movements. Additionally, the bot integrates with CrewAI for risk and compliance management, making trading decisions more secure and informed.

The agent also includes portfolio rebalancing logic and supports multiple trading pairs, starting with LINK/ETH. The system can be expanded to trade meme coins and other tokens, offering a flexible, modular architecture.

Key Features
AI-Driven Market Predictions: Uses indicators like SMA, RSI, and MACD to make informed trading decisions.
Risk and Compliance Management: CrewAI integration ensures each trade adheres to risk and compliance thresholds (e.g., liquidity checks, slippage, gas costs).
Stop-Loss & Take-Profit: Automatically closes positions based on predefined profit or loss thresholds.
Portfolio Rebalancing: Ensures the portfolio maintains a target ETH/token ratio.
Supports Multiple Tokens: Initially programmed for LINK/ETH trading but can be adapted for other token pairs (including meme coins).
Gas Buffer Management: Automatically adjusts trades to account for gas fees, preventing insufficient funds errors.
Trade Execution on DEX: Interacts with Uniswap V2 on Sepolia for buy/sell transactions.
Setup & Installation
Prerequisites
Node.js installed (v14+)
Alchemy API key (or another Ethereum provider key)
Ethereum wallet with test funds (for Sepolia network)
Git installed
Installation Steps
Clone the repo:

bash
Copy code
git clone https://github.com/Mettice/Defi-Trading-Agent.git
cd Defi-Trading-Agent
Install the required dependencies:

bash
Copy code
npm install
Set up environment variables:

Create a .env file in the project’s root directory.
Add your Ethereum private key and Alchemy API key:
bash
Copy code
ETHEREUM_PRIVATE_KEY=<your_private_key>
ALCHEMY_API_KEY=<your_alchemy_api_key>
Configure token addresses and trading parameters:

The token addresses, profit/loss thresholds, and other configuration variables are stored in tradingAgent.js.
Run the bot:

bash
Copy code
node tradingAgent.js
Configuration
Token Address: Modify the TOKEN_ADDRESS variable in tradingAgent.js to trade other tokens.
Gas Buffer: Adjust the GAS_BUFFER to account for potential network congestion.
Stop-Loss and Take-Profit: Set PROFIT_THRESHOLD and LOSS_THRESHOLD to your desired percentages.
CrewAI Integration: CrewAI manages risk and compliance checks before every trade.
Expanding for Multiple Tokens
To enable trading multiple token pairs:

Modify the tradingAgent.js file to loop over multiple token addresses.
Ensure CrewAI handles risk management for each token.
Set up stop-loss and take-profit thresholds for each token.
Testing
You can test the bot using the Sepolia testnet and test funds. Run tradingBotTest.js to simulate trading scenarios without using real funds.

bash
Copy code
node tradingBotTest.js
Future Enhancements
Advanced AI Models: Integrate more sophisticated prediction models like reinforcement learning.
Custom Indicators: Add additional market indicators or sentiment analysis.
Cross-Chain Trading: Expand trading to multiple blockchains beyond Ethereum (e.g., Solana, BSC).
License
MIT License.

Contributing
Feel free to contribute by submitting pull requests, opening issues, or suggesting improvements!