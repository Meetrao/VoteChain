# 🗳️ VoteChain – A Decentralized E-Voting DApp

## 📌 Overview  
VoteChain is a **blockchain-based electronic voting system** designed to provide a secure, transparent, and tamper-proof platform for conducting elections.  
It leverages **smart contracts** to ensure votes are immutable, verifiable, and accessible to all stakeholders without compromising voter privacy.  

This project demonstrates how **decentralized technologies** can modernize traditional voting by eliminating single points of failure and fostering trust in electoral processes.

---

## 🚀 Features  
- **Decentralized Voting** – Every vote is recorded on the blockchain, ensuring transparency.  
- **Voter Authentication** – OTP/biometric verification to prevent fake or duplicate voting.  
- **Candidate Registration** – Admin can register candidates before the election begins.  
- **One Voter, One Vote** – Enforced by smart contracts to prevent double voting.  
- **Immutable Records** – Once cast, votes cannot be modified or deleted.  
- **Results Transparency** – Election results are publicly verifiable on-chain.  
- **Frontend DApp** – User-friendly interface for voters to register, authenticate, and cast votes.  

---

## 🏗️ Tech Stack  
**Frontend:** React.js, TailwindCSS  
**Backend / APIs:** Node.js, Express.js  
**Blockchain:** Solidity, Hardhat (or Truffle)  
**Database (if any):** MongoDB (for user metadata, not for votes)  
**Authentication:** Twilio OTP / Biometric verification  
**Deployment:** Vercel (Frontend), Render (Backend), Ethereum Sepolia Testnet  

---

## 📂 Project Structure  
```
VoteChain/
│── frontend/          # React DApp
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│── backend/           # Node.js + Express + APIs
│   ├── routes/
│   ├── controllers/
│   └── models/
│── contracts/         # Solidity Smart Contracts
│── migrations/        # Deployment scripts
│── test/              # Smart contract test cases
│── .env               # Environment variables
│── package.json
│── README.md
```

---

## ⚙️ Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/your-username/VoteChain.git
cd VoteChain
```

### 2️⃣ Install Dependencies  
**Frontend**  
```bash
cd frontend
npm install
```

**Backend**  
```bash
cd backend
npm install
```

### 3️⃣ Configure Environment Variables  

#### 📌 Backend `.env`
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_EXPIRY=1d
JWT_ACCESS_TOKEN=your_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_SERVICE_SID=your_twilio_service_sid
THRESHOLD=0.4
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECERT=your_cloudinary_secret

SEPOLIA_RPC_URL=your_alchemy_sepolia_rpc_url
SEPOLIA_PRIVATE_KEY=your_private_key
VITE_VOTING_CONTRACT_ADDRESS=your_deployed_contract_address
ADMIN_WALLET=your_admin_wallet_address
CORS_ORIGIN=http://localhost:5173
```

#### 📌 Frontend `.env`
```
VITE_ADMIN_WALLET=your_admin_wallet_address
VITE_API_URL=https://votechain-backend-api.onrender.com/
```

#### 📌 Contracts `.env`
```
SEPOLIA_RPC_URL=your_alchemy_sepolia_rpc_url
SEPOLIA_PRIVATE_KEY=your_private_key
```

---

## 🔐 Security Considerations  
⚠️ **Important:** Never commit `.env` files to GitHub.  
- Use `.gitignore` to exclude `.env` files.  
- Rotate credentials (MongoDB, Twilio, Cloudinary, Alchemy) if they were accidentally pushed.  
- Use environment secrets in deployment platforms (Render, Vercel, etc.).  

---

## 📊 Workflow  

1. **Admin registers candidates** via the smart contract.  
2. **Voter registers** → gets verified via OTP/biometric.  
3. **Voter connects wallet** → casts vote securely.  
4. **Smart contract records vote** immutably on blockchain.  
5. **Results are visible** to all, ensuring transparency.  

---

## 🧪 Testing Smart Contracts  
Run unit tests with Hardhat:  
```bash
npx hardhat test
```

---

## 🌍 Deployment  
- **Frontend:** [Vercel](https://vercel.com/)  
- **Backend:** [Render](https://render.com/)  
- **Smart Contracts:** [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)  

---

## 📜 License  
This project is licensed under the **MIT License** – free to use, modify, and distribute. 
---

