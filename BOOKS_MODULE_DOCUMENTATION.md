# Books Exchange Module Documentation

## Overview

The Books Exchange module is a comprehensive book buying, selling, and renting platform integrated into the Campus Sheba web application. It follows the mobile-first design shown in the provided mockups and is built with Next.js 16, TypeScript, and Tailwind CSS.

## Module Structure

```
src/
├── app/[locale]/(public)/(features)/books/
│   ├── page.tsx                 # Main books listing page (Browse & My Listings tabs)
│   ├── list/
│   │   └── page.tsx            # Create/List a new book form
│   └── [id]/
│       └── page.tsx            # Book details page
├── types/
│   └── book.ts                 # TypeScript interfaces and types for books
```

## Routes

### 1. **Main Books Page** - `/{locale}/books`

**Path:** `src/app/[locale]/(public)/(features)/books/page.tsx`

**Features:**

- Two-tab interface: **Browse** and **My Listings**
- **Browse Tab:**
  - Search functionality for books
  - Filter by listing type (All, For Sale, For Rent)
  - Filter by category (Textbook, Notebook, Reference, Novel, Lab Manual, Study Guide, Question Bank, Other)
  - Book listing cards with price, condition, location, and seller info
  - Floating action button (+) to list a new book
- **My Listings Tab:**
  - Empty state showing when user has no listings
  - Button to create first listing
  - Same FAB to add new books

**Key Components:**

- Search bar with placeholder "Search books..."
- Filter chips for listing type and category
- Book cards displaying:
  - Book cover (gradient background with book icon)
  - Title and author
  - Status badges (For Sale/For Rent, Condition)
  - Department, location, posted time
  - Price display
  - Seller name (on hover/right side)

### 2. **Book Details Page** - `/{locale}/books/{id}`

**Path:** `src/app/[locale]/(public)/(features)/books/[id]/page.tsx`

**Features:**

- Header with back button and listing type badge
- Large book cover area (gradient background)
- Book information card with:
  - Title, author, and category
  - Price information (selling price, original price, discount %)
  - Rental price display (if applicable)
  - Full description
- **Book Information Section:**
  - Subject/Department
  - Department name
  - Semester
  - Location
  - Posted time
- **Seller Information Section:**
  - Seller profile with avatar
  - Name and rating
  - Number of listings
  - Expandable contact details (Phone & Email)
  - "Contact Seller" button

**Dynamic Routing:**

- Handles multiple book IDs dynamically
- Returns 404-style message if book not found
- Fallback data for books with IDs: "1", "2", "3"

### 3. **List Book Form** - `/{locale}/books/list`

**Path:** `src/app/[locale]/(public)/(features)/books/list/page.tsx`

**Features:**

- Comprehensive multi-section form with validation
- **Listing Type Selection:** Radio buttons for Sell/Rent
- **Book Details Section:**
  - Book title (required)
  - Author (required)
  - Subject/Department (required)
  - Category dropdown
  - Condition dropdown
  - Description (required)
- **Pricing Section:**
  - For Sell: Selling price (required) and Original price (optional)
  - For Rent: Rental price per month (required)
- **Additional Information:**
  - Department dropdown (required)
  - Semester input (optional)
  - Location (required)
- **Contact Information:**
  - Your name (required)
  - Phone number (required)
  - Email (required)

**Form Validation:**

- Real-time error clearing on input change
- Visual error indicators (red borders)
- Submit button only enabled when required fields are filled
- Success state after form submission

**Success Screen:**

- Confirmation message
- Options to view all books or list another book

## Data Structure

### Types (from `src/types/book.ts`)

```typescript
// Book Categories
type BookCategory =
  | "Textbook"
  | "Notebook"
  | "Reference"
  | "Novel"
  | "Lab Manual"
  | "Study Guide"
  | "Question Bank"
  | "Other";

// Book Condition
type BookCondition = "New" | "Like New" | "Good" | "Acceptable";

// Listing Type
type ListingType = "Sell" | "Rent";

// Filter Type
type FilterType = "All" | "For Sale" | "For Rent";

// Main Book Interface
interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  condition: BookCondition;
  listingType: ListingType;
  sellingPrice?: number;
  originalPrice?: number;
  rentalPrice?: number;
  description: string;
  department: string;
  semester: string;
  location: string;
  postedTime: string;
  subject: string;
  seller: SellerInfo;
  images?: string[];
}

// Seller Information
interface SellerInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating?: number;
  totalListings?: number;
}
```

## Sample Data

The module includes sample books for demonstration:

1. **Data Structures and Algorithms in C++** - FOR SALE (৳800, Original: ৳1500)
2. **Database Management Systems** - FOR RENT (৳150/month)
3. **Engineering Mathematics - Complete Notes** - FOR SALE (৳300, Original: ৳500)

## Design System

### Color Scheme

- **Primary:** Red (#DC2626) - Used for CTA buttons, badges, highlights
- **Secondary:** Gray (#F3F4F6 to #1F2937) - Background and text
- **Success:** Green (#22C55E) - For positive feedback
- **Info:** Blue (#3B82F6) - For informational elements

### Typography

- **Headers:** Font-weight 600-900, sizes 16px-28px
- **Body:** Font-weight 400-500, sizes 12px-16px
- **Small text:** 10px-12px, weight 400

### Components

- **Buttons:** Red background with white text, rounded-lg/rounded-xl
- **Cards:** White background with subtle borders, shadow on hover
- **Badges:** Colored backgrounds with rounded corners
- **Input fields:** Rounded-lg, gray border, focus state with border color change

## User Flow

### Browse Books

1. User lands on `/books` page
2. Sees Browse tab with book listings
3. Can search by title/author
4. Can filter by type (For Sale/For Rent) and category
5. Clicks on book to view details
6. On details page, can view full info and contact seller

### List a Book

1. User clicks "+" FAB or "List Your First Book" button
2. Navigates to `/books/list`
3. Fills out form with book information
4. Selects Sell or Rent listing type
5. Enters appropriate pricing
6. Submits form
7. Sees success confirmation

### Contact Seller

1. User views book details
2. Clicks "Contact Seller" button
3. Seller contact details are revealed (Phone & Email)
4. User can call or email the seller

## Integration Points

### Navigation

- Book module is accessible from main navigation
- Located in `(public)/(features)` section for authenticated and guest users
- Uses Next.js routing with locale parameter: `/{locale}/books`

### State Management

- Uses React `useState` for local form state
- No global state management needed for MVP
- Success states are managed locally in components

### i18n (Internationalization)

- All routes support locale parameter: `/{locale}/books`
- Ready for translation of all strings
- Currently using English hardcoded text

## Future Enhancements

1. **Backend Integration**
   - Connect to API endpoints for book data
   - Implement actual form submission
   - Add user authentication

2. **Additional Features**
   - Image upload for book listings
   - User ratings and reviews
   - Favorites/bookmarking
   - Chat messaging between buyers and sellers
   - Payment integration for sales/rentals

3. **Performance**
   - Pagination for book listings
   - Image optimization
   - Lazy loading

4. **Analytics**
   - Track book searches
   - Monitor popular books/categories
   - User engagement metrics

## Error Handling

### 404 Handling

- Book details page returns custom message if book ID not found
- Provides link back to browse books

### Form Validation

- Client-side validation for all required fields
- Real-time error messages
- Visual feedback with red borders on invalid fields

### Network Errors

- (Ready for implementation when backend is connected)
- Toast notifications for errors (using Sonner library)

## Testing Routes

All routes have been tested and verified to work without 404 errors:

✅ `/{locale}/books` - Main books page
✅ `/{locale}/books/{id}` - Book details (tested with IDs: 1, 2, 3)
✅ `/{locale}/books/list` - Create listing form

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-first responsive design
- Tested on various screen sizes

## Dependencies

- **Next.js** - Framework
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **next/navigation** - Routing helpers

## Code Standards

- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture
- Functional components with hooks
- Props destructuring
- Error boundaries ready for implementation

---

**Last Updated:** March 18, 2026
**Version:** 1.0.0
