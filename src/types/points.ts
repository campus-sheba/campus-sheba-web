export interface CoinBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export type CoinTransactionType = "EARN" | "SPEND";

export type CoinTransactionReason =
  | "REFERRAL_SIGNUP"
  | "REFERRAL_FIRST_ORDER"
  | "FIRST_ORDER_BONUS"
  | "ADMIN_ADJUSTMENT"
  | "WALLET_REDEEM";

export interface CoinTransaction {
  type: CoinTransactionType;
  amount: number;
  reason: CoinTransactionReason;
  balanceBefore: number;
  balanceAfter: number;
  notes: string | null;
  createdAt: string;
}

export interface CoinTransactionListResult {
  transactions: CoinTransaction[];
  page: number;
  limit: number;
  total: number;
}

export interface CoinConfig {
  isEnabled: boolean;
  signupBonusCoins: number;
  referrerFirstOrderCoins: number;
  refereeFirstOrderCoins: number;
  coinsPerBDT: number;
  minRedeemCoins: number;
  maxRedeemCoinsPerDay: number;
}

export interface RedeemCoinsResult {
  message: string;
  coinsSpent: number;
  bdtCredited: number;
  newBalance: number;
}
