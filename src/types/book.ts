/** API-aligned book marketplace types — Campus Sheba Book Module. */

export type BookType =
  | "Selling"
  | "Lending"
  | "Donation"
  | "Swap"
  | "Library Only"
  | "Request Based";

export type BookStatus = "Pending" | "Approved" | "Rejected" | "Suspended" | "Flagged";
export type BookShelfStatus = "on_shelf" | "promoted" | "sold_out";
export type BrowseSegment =
  | "marketplace"
  | "showcase"
  | "selling"
  | "lending"
  | "donation"
  | "swap";
export type BookSwapStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";
export type LibraryBadge =
  | "first_shelf_book"
  | "ten_books_shared"
  | "top_reviewer"
  | "popular_library";
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
  shelfStatus?: BookShelfStatus | string;
  sellerType?: string;
  department?: BookDeptRef | string;
  owner?: BookOwnerRef | string;
  /** Legacy contact fields (populated when owner is not a User ref) */
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  quality?: BookQuality | string;
  price?: number;
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
  /** API field name */
  comment?: string;
  body?: string;
  isVerifiedBorrower?: boolean;
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

export type LibraryProfileOwnerRef =
  | string
  | {
      _id: string;
      name?: string;
      photo?: string | { url?: string };
    };

/** Resolve owner id whether API returns a string or populated owner object. */
export function resolveLibraryOwnerId(
  owner: LibraryProfileOwnerRef | undefined,
): string | undefined {
  if (!owner) return undefined;
  if (typeof owner === "string") return owner;
  return owner._id;
}

export type ReadingListByStatus = {
  reading: ReadingListEntry[];
  completed: ReadingListEntry[];
  wishlist: ReadingListEntry[];
};

export type UserLibraryProfile = {
  _id: string;
  owner: LibraryProfileOwnerRef;
  university: string | { _id: string; name?: string };
  displayName: string;
  bio?: string;
  visibility: LibraryVisibility;
  readingList: ReadingListEntry[];
  readingListByStatus?: ReadingListByStatus;
  recommendations?: BookListing[];
  following: string[];
  followers: string[];
  followersCount?: number;
  followingCount?: number;
  badges?: LibraryBadge[];
  reputationScore: number;
  totalBooksShared: number;
  createdAt: string;
};

export type LibraryHubShelves = {
  showcase: BookListing[];
  promoted: BookListing[];
  soldOut: BookListing[];
};

export type LibraryHubData = {
  profile: UserLibraryProfile;
  shelves: LibraryHubShelves;
  readingListByStatus: ReadingListByStatus;
};

export type BookshelfDiscoverCard = {
  _id: string;
  displayName: string;
  bio?: string;
  reputationScore: number;
  followersCount: number;
  owner: BookOwnerRef & { profileImage?: string };
};

export type BluebookFeedSection = {
  featured?: BookListing[];
  recent?: BookListing[];
  topRated?: BookListing[];
};

export type BluebookHomeFeed = {
  marketplace: BluebookFeedSection;
  showcase: Pick<BluebookFeedSection, "recent">;
  borrow: Pick<BluebookFeedSection, "recent">;
  swap: Pick<BluebookFeedSection, "recent">;
  bookshelves: BookshelfDiscoverCard[];
  following: BookListing[];
};

export type BookBrowsePaginatedResponse = BookPaginatedResponse & {
  segment?: BrowseSegment;
};

export type LibraryFollowEntry = {
  _id: string;
  displayName: string;
  bio?: string;
  owner?: LibraryProfileOwnerRef;
  reputationScore?: number;
};

export type LibraryFollowListResponse = {
  page: number;
  limit: number;
  total: number;
  data: LibraryFollowEntry[];
};

export type LibraryLeaderboardEntry = {
  _id: string;
  displayName: string;
  bio?: string;
  reputationScore: number;
  followersCount: number;
  totalBooksShared?: number;
  owner?: LibraryProfileOwnerRef;
};

export type LibraryLeaderboardResponse = {
  page: number;
  limit: number;
  total: number;
  data: LibraryLeaderboardEntry[];
};

export type BookSwapRecord = {
  _id: string;
  proposer: string | BookOwnerRef;
  owner: string | BookOwnerRef;
  targetBook: BookListing | string;
  offeredBook: BookListing | string;
  status: BookSwapStatus;
  message?: string;
  createdAt: string;
};

export type BookSwapPaginatedResponse = {
  page: number;
  limit: number;
  total: number;
  data: BookSwapRecord[];
};

export type CreateBookSwapPayload = {
  targetBookId: string;
  offeredBookId: string;
  message?: string;
};

export type LibraryProfileReview = {
  _id: string;
  libraryProfileId: string;
  reviewer: BookOwnerRef;
  rating: number;
  body: string;
  createdAt: string;
};

export type LibraryProfileReviewsResponse = {
  page: number;
  limit: number;
  total: number;
  data: LibraryProfileReview[];
};

export type SubmitLibraryProfileReviewPayload = {
  libraryProfileId: string;
  rating: number;
  body: string;
};

export type ReportLibraryProfilePayload = {
  libraryProfileId: string;
  reason: string;
};

export type ReorderRecommendationsPayload = {
  bookIds: string[];
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
  /** Sent to API as `comment` */
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

// ── Shelf (showcase) & promote ──────────────────────────────────────────────

/** Slim payload for POST /creator/books/shelf — server forces type/price/qty. */
export type CreateShelfBookPayload = {
  title: string;
  photos: BookPhotoPayload[];
  category: string;
  department: string;
  buyingYear: string;
  description: string;
  quality: BookQuality;
  author?: string;
  edition?: string;
  publisher?: string;
  subject?: string;
  semester?: string;
  courseCode?: string;
  language?: string;
  notes?: BookNote[];
};

/** Promotable lanes for a Library Only book. */
export type PromoteBookType = "Selling" | "Lending" | "Donation" | "Swap";

/** Payload for POST /creator/books/:id/promote — fields vary by target type. */
export type PromoteBookPayload = {
  type: PromoteBookType;
  addressId: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  price?: number;
  discountPrice?: number;
  quantity?: number;
  borrowDuration?: number;
  maxExtensionDuration?: number;
  allowsExtension?: boolean;
  safekeepingCharge?: number;
};

export type LibrarySortBy = "reputation" | "recent" | "followers";

export type LibraryProfileListParams = {
  search?: string;
  university?: string;
  sortBy?: LibrarySortBy;
  page?: number;
  limit?: number;
};

/** Lightweight card returned by GET /user/library (discovery). */
export type LibraryProfileCard = {
  _id: string;
  owner: LibraryProfileOwnerRef;
  university?: { _id: string; name?: string } | string;
  displayName: string;
  bio?: string;
  visibility: LibraryVisibility;
  reputationScore: number;
  totalBooksShared: number;
  followersCount: number;
  createdAt: string;
};

export type LibraryProfileListResponse = {
  page: number;
  limit: number;
  total: number;
  data: LibraryProfileCard[];
};
