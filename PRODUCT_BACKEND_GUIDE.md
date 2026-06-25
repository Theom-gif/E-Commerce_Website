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
