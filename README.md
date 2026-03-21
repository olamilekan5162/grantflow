# GrantFlow 🌐

> **Transparent, Milestone-Based Grant Management on Hedera**

GrantFlow is a decentralized grant management platform built on the Hedera network that automates the entire funding lifecycle — from application to milestone-based disbursement — using smart contracts and an immutable on-chain ledger, eliminating trust gaps between funders and recipients.

---

## 🏆 Hackathon Submission

| Field | Details |
|---|---|
| **Track** | DeFi / Public Goods & Social Impact |
| **Demo Video** | *(Insert YouTube link)* |
| **Live Demo** | *(Insert deployment URL)* |

---

## 📋 Project Description

GrantFlow is a trustless grant management platform that puts milestone-based disbursements on-chain. Funders lock HBAR in a Hedera Smart Contract escrow at creation. Recipients apply, submit milestone proofs, and funds are released automatically by the contract upon funder approval. Every event — application, approval, disbursement — is recorded immutably on the Hedera Consensus Service (HCS), giving all parties a verifiable, real-time audit trail.

*(≈ 80 words)*

---

## 🛠️ Tech Stack

### Hedera Network Services
| Service | Usage |
|---|---|
| **Hedera Consensus Service (HCS)** | Immutable on-chain log of all grant events (creation, applications, approvals, payments) |
| **Hedera Smart Contract Service** | Escrow contract (`GrantEscrow.sol`) for locking and releasing funds milestone-by-milestone |
| **Hedera Mirror Node** | Real-time querying of HCS messages to build the UI data layer |

### Ecosystem & Infrastructure
| Technology | Usage |
|---|---|
| **WalletConnect (Hedera Wallet Connect SDK)** | Non-custodial wallet authentication for all user roles |
| **Pinata / IPFS** | Decentralized storage for grant metadata, proposals, and milestone proofs |
| **Next.js 14 (App Router)** | Full-stack React framework powering the frontend |
| **Solidity** | Smart contract language for the on-chain escrow logic |
| **Hiero Ledger SDK** | Interacting with Hedera services from the backend |
| **Vercel** | Hosting and deployment |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- `pnpm` (recommended) or `npm`
- A Hedera Testnet account (via [HashPack](https://www.hashpack.app/) or [Kabila](https://www.kabila.app/))
- A [WalletConnect Cloud](https://cloud.walletconnect.com/) Project ID
- A [Pinata](https://pinata.cloud/) account for IPFS storage

### 1. Clone the Repository

```bash
git clone https://github.com/olamilekan5162/grantflow.git
cd grantflow
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root of the project:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# App URL (use localhost for local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Hedera HCS Topic ID (create one using the Hedera Portal or SDK)
NEXT_PUBLIC_REGISTRY_TOPIC_ID=0.0.XXXXXXX

# Hedera Smart Contract Escrow ID (deploy GrantEscrow.sol)
NEXT_PUBLIC_ESCROW_CONTRACT_ID=0.0.XXXXXXX

# Pinata (IPFS)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway_url
```

### 4. Deploy the Smart Contract

The escrow contract is located at `src/contracts/GrantEscrow.sol`.

You can deploy it using:
- **Hedera Portal / Hedera Playground** (https://portal.hedera.com) — Recommended for testnet
- Or any Solidity-compatible tooling (Hardhat, Remix)

Once deployed, copy the **Contract ID** into your `.env.local` as `NEXT_PUBLIC_ESCROW_CONTRACT_ID`.

### 5. Create an HCS Topic

You'll need a Hedera Consensus Service topic for the application registry. Create one via the Hedera Portal or use the SDK. Once created, set the **Topic ID** in your `.env.local` as `NEXT_PUBLIC_REGISTRY_TOPIC_ID`.

### 6. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Application Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── page.js               # Public landing page
│   ├── explore/              # Public grant explorer
│   ├── funder/               # Funder dashboard & grant management
│   └── recipient/            # Recipient dashboard & application flow
├── components/               # Reusable UI components
├── context/
│   └── AppContext.js         # Global wallet & account state
├── contracts/
│   └── GrantEscrow.sol       # On-chain escrow smart contract
├── hooks/
│   └── useGrantFlow.js       # Data-fetching hook wrapping all helpers
├── lib/
│   ├── utils.js              # IPFS upload/download helpers
│   └── walletConnect.js      # WalletConnect DApp connector setup
└── utils/
    ├── grantFlowHelpers.js   # Core HCS message fetching & parsing
    ├── funderHelpers.js      # Funder-specific data queries
    ├── recipientHelpers.js   # Recipient-specific data queries
    └── submissionHelpers.js  # On-chain transaction submission helpers
```

---

## ✨ Key Features

- **Escrow-Protected Funding** — Grant budgets are locked in a smart contract at creation; no funds can be released without milestone verification.
- **Milestone-Gated Payments** — Recipients submit proof for each milestone; funds release only upon funder approval.
- **Immutable Audit Trail** — Every action is recorded on the Hedera Consensus Service, providing a transparent, tamper-proof history.
- **Multi-Role Platform** — Separate dashboards for Funders, Recipients, and public Explorers.
- **Real-Time Updates** — The UI polls the Hedera Mirror Node every 30 seconds for fresh on-chain data.
- **Persistent Wallet Sessions** — WalletConnect sessions persist across page reloads; no need to reconnect on every visit.

---

## 🧪 Testing Instructions

1. **Connect Wallet** — Click "Connect Wallet" and connect a Hedera Testnet wallet (HashPack recommended).
2. **Create a Grant (Funder Role)** — Navigate to `/funder/grants/create`, fill in the details, define milestones (must total 100%), and deposit HBAR into the escrow.
3. **Apply for a Grant (Recipient Role)** — Switch to a second wallet, go to `/recipient/grants`, find the grant, and submit an application.
4. **Approve Application (Funder)** — Return to the funder wallet, go to `/funder/grants/[id]` → Applications tab, and approve the recipient.
5. **Submit Milestone Proof (Recipient)** — As the recipient, navigate to the grant and submit proof for Milestone 1.
6. **Approve Milestone & Trigger Payment (Funder)** — Review the proof in the Pending Reviews section of the dashboard and approve it. The smart contract will automatically release the milestone funds.
7. **Verify Timeline** — On the public grant page (`/explore/grants/[id]`), confirm the disbursement progress and transaction timeline have updated.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
