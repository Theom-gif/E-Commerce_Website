/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Book {
  id: string;
  productId?: string | number;
  title: string;
  subtitle?: string;
  author: string;
  category: string;
  price: number;
  publishDate: string;
  coverImage: string;
  isbn: string;
  pages: number;
  binding: string;
  publisher: string;
  dimensions: string;
  description: string;
  authorBio: string;
  rating: number;
  featured: boolean;
  curatedCollection?: string;
  bgAccent?: string;
  insidePages?: string[]; // strings or quotes representing page spread contents
  specifications: Record<string, string>;
  reviews: Review[];
}

export interface CartItem {
  id?: string;
  cartId?: string;
  productId?: string | number;
  book: Book;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentDetails {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  discountApplied?: {
    code: string;
    amount: number;
  };
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  shippingAddress: ShippingAddress;
}

export interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  membershipTier: "Standard" | "Patron" | "Archivist";
  joinedDate: string;
  shippingAddress: ShippingAddress;
}
