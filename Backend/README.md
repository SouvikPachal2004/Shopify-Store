# Backend Setup (Shopify Store Configuration Manual)

This folder contains sample backend configuration data for the pet store.

## 1) Store Setup
- File: `store-config.json`
- Contains store name, timezone, currency, contact email, and password protection.
- Use these values in Shopify admin under Settings > Store details and Password protection.

## 2) Product Management
- File: `products.json`
- Contains product metadata (title, price, compare price, inventory, SKU, tags, images, collection).
- Add these products manually in Shopify Admin > Products.

## 3) Collections
- File: `collections.json`
- Defines collections for categories.
- Create collections in Shopify Admin > Products > Collections.

## 4) Navigation
- File: `menus.json`
- Defines main and footer menu items.
- Configure navigation in Shopify Admin > Online Store > Navigation.

## 5) Pages and Policies (Manual)
Create pages in Shopify Admin > Online Store > Pages:
- About Us
- Contact
- FAQ
- Shipping Policy
- Returns Policy
- Privacy Policy

Then link them in Footer menu.

## 6) Apps (Recommended)
Install recommended apps in Shopify App Store:
- Judge.me (reviews)
- Search & Discovery (filters)
- Labeler (sale badges)

## 7) Customer Flow Test
1. Open homepage (`Frontend/index.html` or deployed store URL).
2. Click product and confirm product page loads.
3. Add to cart and check cart count.
4. Go to checkout.

This backend folder is a static reference for the store configuration and manual setup in Shopify.
