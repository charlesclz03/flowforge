# Tutorial: Configuring Stripe for Multi-Currency (EUR & Regional)

This guide explains how to set up Stripe so your application operates primarily in **Euros (EUR)** while providing seamless currency conversion for international users (e.g., showing **Pounds (GBP)** to UK users).

## 1. Stripe Dashboard Configuration

### A. Update the Base Product
By default, your Product and Prices in Stripe are likely set to USD. To switch to EUR:
1. Go to the **Products** section in your [Stripe Dashboard](https://dashboard.stripe.com/products).
2. Select your "Pro Subscription" product.
3. Under **Prices**, click "Add another price".
4. Set the currency to **EUR** and the amount (e.g., `4.99`).

### B. Enable Multi-Currency (Adaptive Pricing)
Stripe can automatically convert your EUR price to the user's local currency based on their location.
1. Go to **Settings > Checkout and Payment Links**.
2. Look for **Adaptive Pricing**.
3. Enable it. Stripe will now use its mid-market exchange rates to present the price in the user's local currency (GBP, USD, etc.) during checkout.

> [!TIP]
> **Manual multi-currency pricing** is also an option if you want "psychological pricing" (e.g., charging exactly £4.99 even if the exchange rate is different). You can do this by adding "regional overrides" to your EUR price ID in the Stripe Dashboard.

---

## 2. Application Code Updates

To reflect these changes in your app, you need to update your configuration.

### A. Update `.env`
Update your environment variables with the new EUR Price IDs:
```env
STRIPE_PRICE_ID_MONTHLY=price_XYZ_EUR_MONTHLY
STRIPE_PRICE_ID_YEARLY=price_XYZ_EUR_YEARLY
```

### B. Update `lib/stripe.ts`
Update the `PLANS` object to reflect that the base currency is now EUR.

```typescript
// lib/stripe.ts
export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY!,
    price: 4.99, // This is now interpreted as EUR
    currency: 'EUR',
    interval: 'month' as const,
  },
  // ...
}
```

### C. Update UI Formatting
In components like `PremiumModal.tsx`, ensure the currency formatting uses the new locale:

```tsx
// Example formatting for EUR
{PLANS.monthly.price.toLocaleString('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})}
```

---

## 3. How Currency Conversion Works (User Flow)

1. **In-App Display**: The user sees the price in **EUR** (your primary currency).
2. **Checkout Redirection**: When the user clicks "Get Pro", they are sent to Stripe Checkout.
3. **Adaptive Pricing (Regional)**:
   - If Stripe detects the user is in the **UK**, it will automatically show the total in **GBP** (e.g., `~£4.20`) based on the current exchange rate.
   - If they are in the **USA**, it will show **USD**.
4. **Payment**: The user pays in their local currency, and Stripe handles the conversion to EUR before depositing it into your account.

---

## 4. Verification & Testing

Before going live, test the conversion in **Stripe Test Mode**:
1. Open your app and trigger the checkout.
2. At the top of the Stripe Checkout page, you can simulate different countries to see how the currency flips from **€** to **£** or **$**.
3. Use [Stripe Test Cards](https://stripe.com/docs/testing) specifically tied to international regions.
