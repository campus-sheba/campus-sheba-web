/** API-aligned book marketplace types — Campus Sheba Book Module. */

export type BookType =
  | "Selling"
  | "Lending"
  | "Donation"
  | "Swap"
  | "Library Only"
  | "Request Based";

export type BookStatus = "Pending" | "Approved" | "Rejected" | "Suspended" | "Flagged";
export type BookQuality = "New" | "Like New" | "Good" | "Acceptable";
export type BookAvailability = "Available" | "Borrowed" | "Reserved";
export type BookBorrowingStatus =
  | "Pending"
  | "Approved"
  | "Active"
  | "Returned"
  | "Overdue"
  | "Cancelled"
  | "Rejected";
export type DepositStatus = "Held" | "Refunded" | "Forfeited" | "Partially Refunded";
export type BookCondition = "Excellent" | "Good" | "Fair" | "Damaged" | "Lost";
export type ReadingStatus = "reading" | "completed" | "wishlist";
export type LibraryVisibility = "public" | "private";
export type DonationStatus = "available" | "requested" | "fulfilled" | "cancelled";
export type ExtendRequestStatus = "Pending" | "Approved" | "Rejected";

export type BookOwnerRef = {
  _id: string;
  name: string;
  phone?: string;
  profilePhoto?: string;
};

export type BookDeptRef = {
  _id: string;
  name?: string;
  code?: string;
};

export type BookUniversityRef = {
  _id: string;
  name: string;
};

export type BookCategoryRef = {
  _id: string;
  type?: string;
  title: string;
  icon?: string;
  description?: string;
};

export type BookPhoto = {
  url: string;
  key?: string;
  size?: number;
  type?: string;
  _id?: string;
};

export type BookNote = {
  url?: string;
  key?: string;
  size?: number;
  type?: string;
  content?: string;
};

export type BookListing = {
  _id: string;
  title: string;
  author?: string;
  edition?: string;
  publisher?: string;
  slug?: string;
  isbn?: string;
  photos: BookPhoto[];
  notes?: BookNote[];
  category?: BookCategoryRef | string;
  subject?: string;
  courseCode?: string;
  semester?: string;
  language?: string;
  university?: BookUniversityRef | string | unknown;
  address?: string | { _id: string; building?: string; roomNumber?: string; address?: string; type?: string };
  buyingYear?: string;
  description?: string;
  type: BookType;
  status?: BookStatus | string;
  sellerType?: string;
  department?: BookDeptRef | string;
  owner?: BookOwnerRef | string;
  /** Legacy contact fields (populated when owner is not a User ref) */
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  quality?: BookQuality | string;
  price: number;
  discountPrice?: number;
  originalPrice?: number;
  quantity?: number;
  /** Required security deposit for lending (shown to borrower as safekeeping charge) */
  safekeepingCharge?: number;
  availabilityStatus?: BookAvailability | string;
  borrowDuration?: number;
  maxExtensionDuration?: number;
  allowsExtension?: boolean;
  isFeatured?: boolean;
  featuredUntil?: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

// ── Reviews ──────────────────────────────────────────────────────────────────

export type BookReview = {
  _id: string;
  book: string;
  reviewer: BookOwnerRef;
  rating: number;
  body: string;
  isVerifiedBorrower: boolean;
  createdAt: string;
};

export type BookReviewsResponse = {
  page: number;
  limit: number;
  total: number;
  data: BookReview[];
};

// ── Borrowing ─────────────────────────────────────────────────────────────────

export type ExtendRequest = {
  _id: string;
  requestedReturnDate: string;
  status: ExtendRequestStatus;
  reason?: string;
  responseReason?: string;
  responseDate?: string;
};

export type BookBorrowRecord = {
  _id: string;
  book: BookListing | string;
  borrower: BookOwnerRef | string;
  owner: BookOwnerRef | string;
  status: BookBorrowingStatus;
  dueDate: string;
  actualReturnDate?: string;
  requestMessage?: string;
  responseMessage?: string;
  securityDeposit: number;
  depositStatus: DepositStatus;
  depositHeldAt?: string;
  returnCondition?: BookCondition | string;
  damageCharge?: number;
  lateFee?: number;
  overdueDays?: number;
  extendRequests?: ExtendRequest[];
  createdAt: string;
};

export type BorrowRefundInfo = {
  securityDeposit: number;
  damageCharge: number;
  lateFee: number;
  refundedAmount: number;
  depositStatus: DepositStatus;
};

// ── Donations ─────────────────────────────────────────────────────────────────

export type DonationQueueEntry = {
  _id: string;
  requester: BookOwnerRef | string;
  message?: string;
  status: DonationStatus;
  requestedAt: string;
  fulfilledAt?: string;
};

export type BookDonation = {
  _id: string;
  book: BookListing | string;
  donor: BookOwnerRef | string;
  status: DonationStatus;
  donorMessage?: string;
  queue: DonationQueueEntry[];
  createdAt: string;
};

// ── Library Profile ───────────────────────────────────────────────────────────

export type ReadingListEntry = {
  book: BookListing;
  status: ReadingStatus;
  addedAt: string;
};

export type UserLibraryProfile = {
  _id: string;
  owner: string;
  university: string;
  displayName: string;
  bio?: string;
  visibility: LibraryVisibility;
  readingList: ReadingListEntry[];
  recommendations?: BookListing[];
  following: string[];
  followers: string[];
  reputationScore: number;
  totalBooksShared: number;
  createdAt: string;
};

// ── Paginated responses ───────────────────────────────────────────────────────

export type BookPaginatedResponse = {
  page: number;
  limit: number;
  total: number;
  data: BookListing[];
};

// ── Payloads ──────────────────────────────────────────────────────────────────

export type BookPhotoPayload = {
  url: string;
  key: string;
  size: number;
  type?: string;
};

export type CreateBookPayload = {
  title: string;
  author?: string;
  addressId?: string;
  edition?: string;
  publisher?: string;
  photos?: BookPhotoPayload[];
  notes?: BookNote[];
  category?: string;
  subject?: string;
  courseCode?: string;
  semester?: string;
  language?: string;
  buyingYear?: string;
  description?: string;
  /** Informational — server overrides this based on the endpoint used (sell/lend/donate/swap). */
  type?: BookType;
  sellerType?: string;
  department?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  quality: BookQuality;
  price?: number;
  discountPrice?: number;
  originalPrice?: number;
  safekeepingCharge?: number;
  quantity?: number;
  borrowDuration?: number;
  maxExtensionDuration?: number;
  allowsExtension?: boolean;
};

export type UpdateBookPayload = Partial<Omit<CreateBookPayload, "photos">> & {
  photos?: BookPhotoPayload[];
};

export type BookBorrowRequestPayload = {
  bookId: string;
  requestedDueDate: string;
  requestMessage?: string;
  securityDeposit?: number;
};

export type BookBorrowPaginatedResponse = {
  page: number;
  limit: number;
  total: number;
  data: BookBorrowRecord[];
};

export type BorrowRespondPayload = {
  status: "Approved" | "Rejected";
  responseMessage?: string;
};

export type BorrowReturnPayload = {
  returnCondition: BookCondition | string;
  damageDescription?: string;
  damageCharge?: number;
  damagePhotos?: BookPhotoPayload[];
};

export type BorrowExtendPayload = {
  requestedDueDate: string;
  reason?: string;
};

export type ExtendRespondPayload = {
  status: "Approved" | "Rejected";
  responseReason?: string;
};

export type SubmitBookReviewPayload = {
  bookId: string;
  rating: number;
  body: string;
};

export type CreateLibraryProfilePayload = {
  displayName: string;
  bio?: string;
  visibility: LibraryVisibility;
};

export type UpdateLibraryProfilePayload = Partial<CreateLibraryProfilePayload>;

export type AddReadingListPayload = {
  bookId: string;
  status: ReadingStatus;
};

export type UpdateReadingListPayload = {
  status: ReadingStatus;
};
