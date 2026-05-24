export type SupportTicketCategory =
  | "account"
  | "payment"
  | "order"
  | "delivery"
  | "wallet"
  | "coins_referral"
  | "bus_share_appeal"
  | "shop"
  | "book"
  | "buy_sell"
  | "parcel"
  | "other";

export type SupportTicketPriority = "low" | "normal" | "high" | "urgent";

export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "waiting_user"
  | "resolved"
  | "closed";

export type SupportAttachment = {
  url: string;
  key?: string;
  name?: string;
  size?: number;
  mime?: string;
};

export type SupportTicketRow = {
  _id: string;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  lastMessageAt?: string;
  createdAt: string;
};

export type SupportTicketMessage = {
  _id: string;
  senderRole: "user" | "admin";
  body: string;
  attachments?: SupportAttachment[];
  createdAt: string;
};

export type SupportTicketDetail = {
  _id: string;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  assignedTo?: { _id: string; name: string } | null;
  messages: SupportTicketMessage[];
  relatedId?: string;
  relatedModel?: string;
  createdAt: string;
};

export type CreateSupportTicketPayload = {
  subject: string;
  category: SupportTicketCategory;
  priority?: SupportTicketPriority;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  attachments?: SupportAttachment[];
};

export type SupportTicketReplyPayload = {
  body: string;
  attachments?: SupportAttachment[];
};

export type SupportTicketsListParams = {
  status?: SupportTicketStatus | "";
  category?: SupportTicketCategory | "";
  priority?: SupportTicketPriority | "";
  page?: number;
  limit?: number;
};

export type SupportTicketsListResponse = {
  data: SupportTicketRow[];
  pagination: { total: number; page: number; limit: number };
};
