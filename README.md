# Soneium Workshop: AI Agent NFT Gifting with Chainlink Functions ⚡️

A guide to building and deploying a hybrid Web2/Web3 application where an AI agent, interacting via Twitter or terminal, validates gift codes using off-chain data (Supabase) fetched via Chainlink Functions, and triggers an on-chain NFT mint on the **Soneium Minato** testnet.


> 📝 **Note:**
> This workshop guide is based on materials from [Soneium Workshop - Youtube](https://www.youtube.com/watch?v=kqNDZS9xWVE) and Frank's [Guide](https://cll-devrel.gitbook.io/soneium-workshop-elizaos+functions+twit/4.-prepare-don-hosted-secrets) with only minor changes & Korean translation.
>
> * [Original English Version](https://woogieboogie-jl.gitbook.io/functions-agent-twitter-with-soneium-workshop)
> * [Korean Version](https://woogieboogie-jl.gitbook.io/functions-agent-twitter-with-soneium-workshop/kor)

-----

## 🎯 Workshop Goal

Understand and implement a system where an AI agent processes user requests, interacts with a Supabase DB via Chainlink Functions, and mints NFTs on Soneium Minato.

-----

## 🏗️ Architecture Overview

1.  **User Input (Twitter/Terminal)**: User sends a request (wallet address, gift code) to the AI agent.
2.  **AI Agent (Eliza Framework)**: Parses the request and triggers a blockchain transaction.
3.  **Smart Contract (`GetGift.sol` on Soneium Minato)**: Receives the transaction and initiates a Chainlink Functions request.
4.  **Chainlink Functions DON**: Securely fetches the Supabase API key (DON-hosted secret) and executes provided JavaScript code to query Supabase.
5.  **Supabase DB**: Stores and validates gift codes.
6.  **Chainlink Functions DON (Callback)**: Returns the validation result to `GetGift.sol`.
7.  **Smart Contract**: If valid, mints an NFT to the user's address.
8.  **(Optional) AI Agent**: Provides feedback to the user.

-----

## 🛠️ Setup & Deployment Steps

### 1\. Supabase: Off-Chain Database Setup 📊

  * Go to [Supabase](https://supabase.com), create a new project.
  * **Create Table**:
      * Name: `Gifts` (case-sensitive). Enable Row Level Security (RLS).
      * Columns:
          * `id`: `int8` (Primary Key, auto-generated)
          * `gift_name`: `varchar`
          * `gift_code`: `varchar`
  * **Insert Records**:
    | gift\_name       | gift\_code    |
    | :--------------- | :------------ |
    | '1-month premium' | 'Ce9OdVGMFdyr' |
    | '50 discount'    | 'Nbbut8vlkKe9' |
    | '100 discount'   | 'hTXcVopv1Wov' |
    
    *These values must match the logic in `GetGift.sol`.*
  * **RLS Policy**: For the `Gifts` table, create a new policy using the "Enable Read Access For All Users" template (a `SELECT` policy).
  * **API Info**: Navigate to `Project Settings` \> `API`. Note your **Project URL** and **`anon` `public` API Key**.

-----

### 2\. Smart Contract: `GetGift.sol` on Soneium Minato 📜

  * Open [Remix IDE](https://www.google.com/search?q=https://remix.ethereum.org/).
  * Create `GetGift.sol` and paste the contract code (inherits `ERC721URIStorage`, `FunctionsClient`).
  * **Crucial Update**: In the `GetGift.sol` code, find the `SOURCE` variable (JavaScript code). Update the Supabase URL within this string with your Supabase Project ID:
    ```javascript
    // Example: const SOURCE = "..." + "const supabaseUrl = 'https://<YOUR_PROJECT_ID>.supabase.co/rest/v1/Gifts?select=gift_name,gift_code';" + "...";
    // Ensure 'Gifts' table name is correct and case-sensitive.
    ```
  * **Compile** the contract.
  * **Deploy**:
      * Connect MetaMask to **Soneium Minato** (Chain ID: `1946`).
      * In Remix \> `Deploy & run transactions` tab:
          * Environment: `Injected Provider - MetaMask`.
          * Contract: `GetGift.sol`.
      * Deploy. Confirm in MetaMask.
      * Save the deployed **contract address**.

-----

### 3\. Chainlink Functions: Subscription & Secrets 🔗

  * Go to [functions.chain.link](https://functions.chain.link/).
  * Connect wallet (Soneium Minato network).
  * **Create Subscription**: Fund with LINK (e.g., 10 LINK for Soneium Minato).
  * **Add Consumer**: Add your deployed `GetGift.sol` contract address to the subscription.
  * Note your **Subscription ID**.
  * **DON Hosted Secrets (Supabase API Key)**:
      * Clone the repository:
        ```bash
        git clone https://github.com/woogieboogie-jl/Eliza-Twitter-Chainlink-Functions-Soneium.git
        cd Eliza-Twitter-Chainlink-Functions-Soneium
        pnpm install
        ```
      * Configure `.env` (copy from `.env.example`):
        ```env
        ETHEREUM_PROVIDER_SONEIUMMINATO="<YOUR_SONEIUM_MINATO_RPC_URL>"
        PRIVATE_KEY="<YOUR_WALLET_PRIVATE_KEY_FOR_SCRIPT_ONLY>" # Caution!
        SUPABASE_API_KEY="<YOUR_SUPABASE_ANON_PUBLIC_KEY>"
        ```
      * Upload secrets:
        ```bash
        node ./scripts/uploadToDON.js
        ```
      * Note the `donHostedSecretsVersion` and `slotId` (usually `0`) from the output (saved in `donSecretsInfo.txt`). *Secrets expire, typically in 24 hours.*

-----

### 4\. Eliza AI Agent: Setup & Configuration 🤖

  * In the `Eliza-Twitter-Chainlink-Functions-Soneium` project directory.
  * Ensure Node.js v23+ is installed.
  * Update/verify `.env` with:
    ```env
    GEMINI_API_KEY="<YOUR_GOOGLE_GEMINI_API_KEY>"
    EVM_PRIVATE_KEY="<YOUR_WALLET_PRIVATE_KEY_FOR_AGENT>" # Used by agent for transactions
    ETHEREUM_PROVIDER_SONEIUMMINATO="<YOUR_SONEIUM_MINATO_RPC_URL>"
    # If using Twitter:
    # TWITTER_USERNAME="<YOUR_TWITTER_BOT_USERNAME>"
    # TWITTER_PASSWORD="<YOUR_TWITTER_BOT_PASSWORD>"
    # TWITTER_EMAIL="<YOUR_TWITTER_BOT_EMAIL_IF_NEEDED>"
    # TWITTER_DRY_RUN="false"
    ```
  * Configure `src/custom-plugins/actions/getGift.ts`:
      * `contractAddress`: Your deployed `GetGift.sol` address.
      * `donHostedSecretsSlotID`: Your slot ID (e.g., `0`).
      * `donHostedSecretsVersion`: Version from `uploadToDON.js`.
      * `clSubId`: Your Chainlink Functions Subscription ID.
  * **Start Agent**:
    ```bash
    pnpm start
    ```
  * **(Optional) Twitter Client**:
      * Edit `src/character.ts`: change `clients` array to `[Clients.TWITTER]`.
      * Ensure Twitter credentials are in `.env`. Restart agent.

-----

### 5\. Interact & Verify ✅

  * **Terminal Interaction**:
    ```
    please send the gift to: <YOUR_WALLET_ADDRESS> My gift code is: <A_VALID_GIFT_CODE>
    ```
  * **Twitter Interaction** (if enabled):
      * Post a **new tweet** (not a reply in agent's thread) tagging the agent's Twitter username.
      * Include your wallet address and a valid gift code in natural language.
  * **Check Results**:
      * **Chainlink Functions UI**: Monitor your subscription for request status.
      * **NFT Marketplace (Testnets)**: Check for the minted NFT on Soneium Minato (e.g., OpenSea Testnets) by searching for the recipient's address or the `GetGift.sol` contract address.
      * *Remember, each gift code can only be redeemed once.*

-----


