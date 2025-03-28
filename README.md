# Decentralized Image-Sharing Platform

A full-stack, blockchain-powered social media platform built for the Kaleido Developer Challenge. This DApp empowers users to upload, share, and interact with images while ensuring credit and attribution for original artists using smart contracts, perceptual hashing, and on-chain metadata.

---
## What is a DApp?

- [Ethereum Foundation](https://ethereum.org/en/developers/docs/dapps/)
  - Background of how DApps have evolved in the wild, and why
- [DApps Build on Ethereum](https://ethereum.org/en/dapps/)
  - All that's been built in the wonderful world of public Ethereum
- [FireFly docs](https://docs.kaleido.io/kaleido-platform/full-stack/dapps/)
  - DApps in an Enterprise context

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

### 🧾 Derived Posts
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
2. Create a FireFly stack by running:
   ```bash
   ff init devChallenge --block-period 2 # Please set this. We expect you to use 2 second block period for this project (as real world blockchains are not instantaneous)
   ```
3. Start the FireFly stack by running:
   ```bash
   ff start dev
   ```
4. When you're done, you will have FireFly and all its microservices, including your very own private blockchain, running on your machine.

> If you are on Windows or Linux, please **make sure you read the** the hints and tips on [this page](https://hyperledger.github.io/firefly/latest/gettingstarted/firefly_cli/)

If you run into issues, use the following resources to help:

1. [FireFly Getting Started Guide](https://hyperledger.github.io/firefly/latest/gettingstarted/firefly_cli/)
2. [FireFly CLI README](https://github.com/hyperledger/firefly-cli)
3. Ask the team in Whatsapp!

## Getting this repo up and running

This repo has three directories in it:

- `solidity`: Two example solidity contracts that can be compiled, tested, and deployed with Hardhat. [Go to the Readme](./solidity/)
- `backend`: A very simple TypeScript Node.js app that uses the FireFly SDK to interact with a custom smart contract. [Go to the Readme](./backen/)
- `frontend`: A TypeScript React UI that calls the API in the backend. [Go to the Readme](./frontend/)

You will need to first deploy the example smart contracts with Hardhat to FireFly. Once the backend/frontend are started, the buttons on the Web UI will call the backend API endpoints to interact with the contracts through FireFly.

