export interface ReferralCode {
  referralCode: string;
  totalReferrals: number;
  rewardedReferrals: number;
  pendingReferrals: number;
}

export interface ReferralValidation {
  valid: boolean;
  referrerName?: string;
}

export type ReferralStatus = "PENDING" | "REWARDED";

export interface ReferralReferee {
  name: string;
  phone: string;
  photo: string | null;
}

export interface ReferralEntry {
  referee: ReferralReferee;
  status: ReferralStatus;
  refereeSignupCoins: number;
  refereeFirstOrderCoins: number;
  referrerRewardCoins: number;
  createdAt: string;
  rewardedAt: string | null;
}

export interface ReferralListResult {
  referrals: ReferralEntry[];
  page: number;
  limit: number;
  total: number;
}

export interface LeaderboardReferrer {
  name: string;
  photo: string | null;
}

export interface LeaderboardEntry {
  referrer: LeaderboardReferrer;
  totalReferrals: number;
  rewardedReferrals: number;
}

export interface LeaderboardResult {
  data: LeaderboardEntry[];
}
