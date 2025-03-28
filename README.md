# Decentralized Image-Sharing Platform

A full-stack, blockchain-powered social media platform built for the Kaleido Developer Challenge. This DApp empowers users to upload, share, and interact with images while ensuring credit and attribution for original artists using smart contracts, perceptual hashing, and on-chain metadata.

---

## What is a DApp?

- [Ethereum Foundation](https://ethereum.org/en/developers/docs/dapps/)  
  Background of how DApps have evolved in the wild, and why
- [DApps Build on Ethereum](https://ethereum.org/en/dapps/)  
  All that's been built in the wonderful world of public Ethereum
- [FireFly docs](https://docs.kaleido.io/kaleido-platform/full-stack/dapps/)  
  DApps in an Enterprise context

---

## 🚀 Tech Stack

**Frontend**
- React + TypeScript
- Material UI
- Axios + JWT-based auth
- Socket.IO (for real-time updates)

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Hyperledger FireFly SDK
- IPFS for image storage
- Redis (for pHash caching & deduplication)
- WebSockets for live likes/comments

**Blockchain**
- Ethereum (via Kaleido/FireFly stack)
- Solidity Smart Contracts (`ImageRegistry`, `LikeRegistry`)
- On-chain metadata, deduplication & royalties

---

## 📦 Features

### 🖼️ Image Uploads
- Upload images with captions and artist metadata
- Choose to enforce royalties for derivative works
- Images are uploaded to IPFS via FireFly
- Image metadata registered on-chain (SHA-256, pHash, royalty flag, etc.)

### 🧠 Duplicate Detection
- Uses SHA-256 and perceptual hashing (pHash)
- Detects both exact and visually similar images
- Stores pHash in Redis for fast deduplication
- Supports derived posts with attribution

### 💸 Royalty Enforcement
- If royalty is required, duplicates must pay a simulated fee before being posted
- Smart contract enforces royalty logic via `ImageRegistry`

### 🗾️ Derived Posts
- Derived images are linked to the original post
- Likes/comments on derived posts redirect to the original
- Displays attribution: original artist & organization

### ❤️ Likes System
- Like posts (original or derived)
- One like per user enforced on-chain
- Tracked using `LikeRegistry` contract
- Emits `PostLiked` events for real-time sync
- Stored in MongoDB & broadcast to frontend via WebSocket

### 🔐 Auth & Identity
- User registration/login using JWT
- Each user has a unique Ethereum signing key (FireFly Identity)
- Keys used to sign on-chain transactions securely

---

## Setting up your FireFly on your machine

1. Install the [FireFly CLI here](https://github.com/hyperledger/firefly-cli?tab=readme-ov-file#install-the-cli)
2. Create a FireFly stack with two organizations and a block period of 2 seconds:
   ```bash
   ff init devChallenge --block-period 2 --orgs 2
   ```
3. Start the FireFly stack:
   ```bash
   ff start dev
   ```
4. This will launch FireFly with all required microservices including a private blockchain.

> **Note:** If you are on Windows or Linux, please make sure to read the [hints and tips](https://hyperledger.github.io/firefly/latest/gettingstarted/firefly_cli/) for compatibility.

**Helpful Resources:**
- [FireFly Getting Started Guide](https://hyperledger.github.io/firefly/latest/gettingstarted/firefly_cli/)
- [FireFly CLI README](https://github.com/hyperledger/firefly-cli)
- Ask questions in the team WhatsApp group!

---

## Getting this repo up and running

This repo has three directories:

- `solidity`: Contains two Solidity contracts. Use Hardhat to deploy.
- `backend`: Node.js + TypeScript app using FireFly SDK.
- `frontend`: React + TypeScript UI interacting with backend APIs.

### ⚡ Setup Instructions

1. **Deploy the Smart Contracts**
   ```bash
   cd solidity
   npx hardhat run scripts/deployImageRegistry.ts --network firefly
   npx hardhat run scripts/deployLikeRegistry.ts --network firefly
   ```
2. **Update the Backend Configuration**
   - Copy the deployed contract addresses
   - Paste them into `backend/config.json`
   - Also change the org name and Database URI according to your needs.
   - Also make sure to change the port number where you want your backend to run and Host where your firefly node is running. 

3. **Run the Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   > Make sure `config.json` is properly configured before starting

4. **Configure and Run the Frontend**
   ```bash
   cd frontend
   # Update `vite.config.js`
   # - Update proxy target to match backend URL (e.g., http://localhost:3000)
   # - Update WebSocket URI if needed (e.g., ws://localhost:3000)
   npm install
   npm run dev
   ```

5. ✨ **Voila!** Your decentralized image-sharing DApp is live on `http://localhost:5173
