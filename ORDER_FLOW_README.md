# Order Checkout Flow Architecture

This document explains the technical flow of how an order placed on the Vue frontend website is communicated to the Laravel backend.

## 1. Frontend Checkout Trigger (`CheckoutView.vue` & `App.vue`)

When a user clicks "Place Order" in the checkout view:
1. The `processOrderPlacement` function is called in `src/components/CheckoutView.vue`.
2. This function triggers the `onPlaceOrder` prop, which corresponds to the `handlePlaceOrder` function in `src/App.vue`.
3. If the user is authenticated, `handlePlaceOrder` calls the `checkoutCart()` API function.

## 2. API Client Request (`src/api/store.ts`)

The `checkoutCart()` function makes a POST request to the backend API:

```javascript
export async function checkout() {
  return api.post('/checkout')
}
```

Notice that the frontend **does not send the cart items or total price** in the request body. Instead, it relies on the backend to already know what is in the user's cart because cart additions and updates were previously synced to the backend via the `/cart` API endpoints.

## 3. Backend Processing (`OrderController.php`)

When the Laravel backend receives the `POST /checkout` request, it is handled by the `checkout` method in `App\Http\Controllers\Api\OrderController`.

Here is the exact sequence of how the backend "knows" and processes the order data:

1. **Identify the User:** It uses the authentication token from the request to get the current user:
   ```php
   $user = $request->user();
   ```

2. **Retrieve Cart Data:** Instead of trusting prices or quantities sent from the frontend, the backend securely fetches the user's current cart items directly from the database:
   ```php
   $cartItems = $user->cart()->with('product')->get();
   ```

3. **Database Transaction:** To ensure data integrity (so an order isn't partially created if an error occurs), the backend wraps the order creation in a database transaction:
   - **Calculate Total:** It iterates over the fetched cart items and calculates the grand total based on the *actual database prices* of the products.
   - **Create Order Record:** An `Order` record is created with the calculated total and a `pending` status.
   - **Create Order Items:** For each cart item, it creates a corresponding record in the `order_items` table, linking the product, quantity, and historical price to the new order.
   - **Clear Cart:** Finally, it empties the user's cart since the items have now been converted into an order:
     ```php
     $user->cart()->delete();
     ```

4. **Return Response:** The backend responds with a success message and the newly created order object, which the frontend then uses to display the "Order Confirmed" success screen.

## Summary

In short, the frontend simply tells the backend **"the user is ready to checkout."** The backend securely looks up the user's saved cart, calculates the total price based on the actual database records, creates the order, and then empties the cart. This prevents malicious users from tampering with prices or quantities during the checkout request.
