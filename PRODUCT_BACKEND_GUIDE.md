# Product Integration Guide (Backend to Frontend)

This guide explains how the backend should format product data (specifically when creating or listing products) so that the Vue frontend correctly displays the new product, including its image and details.

## The Normalizer

The frontend uses a smart normalizer (`src/api/normalizers.ts`) that maps your backend JSON response into the internal `Book` (Product) model. It supports multiple common field names, so you don't necessarily have to change your database column names.

### Expected JSON Structure

When you return a product object (e.g., in `GET /products` or after a product is created), you should ideally include the following fields:

```json
{
  "id": 123,
  "title": "The Great Novel",          // OR: "name"
  "price": 29.99,                      // OR: "sale_price", "unit_price"
  "category": "Fiction",               // OR: "category_name", or an object {"name": "Fiction"}
  "author": "John Doe",                // OR: "brand", "creator"
  "description": "A great story...",   // OR: "long_description"
  "cover_image": "images/novel.jpg",   // OR: "image_url", "image", "thumbnail"
  "featured": true,                    // OR: "is_featured"
  "created_at": "2026-06-25T00:00:00Z" // OR: "publish_date", "published_at"
}
```

### Handling Images (Crucial)

To ensure the product image displays correctly on the frontend, you have two options for the `cover_image` field:

1. **Absolute URL (Recommended if using S3/Cloud storage):**
   If you return a string starting with `http://` or `https://`, the frontend will use it exactly as provided.
   ```json
   "cover_image": "https://your-bucket.s3.amazonaws.com/products/image.jpg"
   ```

2. **Relative Path (Recommended for local storage):**
   If you return a relative path, the frontend will automatically prepend your server's domain to it.
   For example, if your API is `http://localhost:8000/api`, and you return:
   ```json
   "cover_image": "storage/products/image.jpg"
   ```
   The frontend will strip the `/api` and resolve the image as:
   `http://localhost:8000/storage/products/image.jpg`

   **Note:** To make this work in Laravel, ensure you have run `php artisan storage:link` and that you are saving the uploaded files to the `public` disk, returning the relative path like `storage/...` in the API response.

### Optional Advanced Fields

If you want to populate the deeper product details page, you can also return:
- `subtitle` (or `short_description`)
- `isbn` (or `sku`)
- `pages` (integer)
- `binding` (or `format`) - e.g., "Hardcover"
- `publisher` (or `vendor`)
- `rating` (or `average_rating`)
- `stock` (or `quantity`) - mapped into specifications

## Summary Workflow for Backend Uploads

1. Receive the multipart form data (including the image file).
2. Save the image to your `public` disk in Laravel.
3. Save the product to the database, storing the relative path (e.g., `storage/products/image.jpg`) in the `cover_image` or `image` column.
4. Return the saved product as JSON in the API response using the field names mapped above.
5. The frontend's `normalizeBook()` function will intercept this, format the URL properly, and immediately display the beautiful new product!

## Order Management (Completing Orders)

When a user receives their purchased products or wants to mark an order as "Complete" (changing the status from "pending" or "shipped" to "completed"), the frontend should make an API call to the backend.

### Expected API Call

To mark a specific order as completed, make the following request:

**Endpoint:** `PATCH /api/orders/{order_id}/complete`
**Auth:** Requires a valid Sanctum bearer token in the `Authorization` header.

**Request Details:**
- **Method**: `PATCH`
- **Path Parameter**: `{order_id}` - The ID of the order to complete.

### Example Fetch Call from Frontend

```javascript
// Example: Complete an order when the user clicks the "Mark as Complete" or "Tick" button
async function markOrderAsComplete(orderId) {
  try {
    const response = await fetch(`http://localhost:8000/api/orders/${orderId}/complete`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Assuming you store the token in localStorage
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to complete the order');
    }

    const data = await response.json();
    console.log('Success:', data.message); // "Order marked as completed"
    
    // The updated order object is returned in `data.order`
    // You can update the local state in the Vue frontend to reflect the new "completed" status!
    return data.order;
  } catch (error) {
    console.error('Error completing order:', error);
  }
}
```

### Backend Response
On a successful request, the backend will update the order status in the database to `"completed"` and return:

```json
{
  "message": "Order marked as completed",
  "order": {
    "id": 2,
    "user_id": 1,
    "total": "18.99",
    "status": "completed",
    "created_at": "2026-06-26T00:32:00.000000Z",
    "updated_at": "2026-06-26T02:45:00.000000Z"
  }
}
```

### Note for Frontend Developers:
Once the response is received successfully, update the `status` of that order in your frontend state array to `'completed'` to reflect the change visually in the UI instantly.
