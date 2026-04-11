/** Mirrors GET /wallet response `data`. */
export type UserWallet = {
  _id: string;
  user: string;
  balance: number;
  escrowBalance?: number;
  totalEarnings?: number;
  totalWithdrawn?: number;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type WalletTransactionType = "Credit" | "Debit" | string;

export type WalletTransactionReason =
  | "Order Payment"
  | "Order Payment Deduction"
  | "Topup"
  | "Refund Deduction"
  | "Withdrawal"
  | "Withdrawal Refund"
  | "Admin Adjustment"
  | "Platform Fee Refund"
  | "Escrow Release"
  | "Escrow Hold"
  | string;

/** Mirrors GET /wallet/transactions items. */
export type WalletTransaction = {
  _id: string;
  wallet: string;
  type: WalletTransactionType;
  amount: number;
  reason: WalletTransactionReason;
  order?: string;
  withdrawal?: string;
  balanceBefore: number;
  balanceAfter: number;
  escrowBalanceBefore?: number;
  escrowBalanceAfter?: number;
  notes?: string;
  createdAt?: string;
};

/** POST /wallet/topup/initiate response `data`. */
export type WalletTopupInitiateResult = {
  topupId: string;
  amount: number;
  url: string;
};

export type WalletTopupRecord = {
  _id: string;
  user: string;
  amount: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WalletTopupListResult = {
  page: number;
  limit: number;
  total: number;
  data: WalletTopupRecord[];
};

/** Aligns with RequestWithdrawalDto (user-facing). */
export const WithdrawalMethod = {
  MOBILE_BANKING: "Mobile Banking",
  BANK_TRANSFER: "Bank Transfer",
} as const;

export type WithdrawalMethodValue = (typeof WithdrawalMethod)[keyof typeof WithdrawalMethod];

export type RequestWithdrawalPayload = {
  amount: number;
  method: WithdrawalMethodValue | string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  mobileNumber?: string;
};

export type WithdrawalAccountDetails = {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  mobileNumber?: string;
};

export type WalletWithdrawalRequest = {
  _id: string;
  user: string;
  wallet: string;
  amount: number;
  method: string;
  status: string;
  accountDetails?: WithdrawalAccountDetails;
  requestedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WalletWithdrawalListResult = {
  page: number;
  limit: number;
  total: number;
  data: WalletWithdrawalRequest[];
};
