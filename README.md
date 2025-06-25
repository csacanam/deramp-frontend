# Crypto Stablecoins Checkout Page

A modern web application for processing payments with stable cryptocurrencies (stablecoins) developed with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern and responsive interface** with dark theme design
- **Support for multiple tokens** (USDC, USDT, cCOP, cREAL)
- **Multiple blockchain networks** (Base, Polygon, Celo)
- **Order status** (pending, paid, expired)
- **Smart token grouping** by symbol
- **Dynamic network selection** based on chosen token
- **Error handling** for non-existent orders
- **Mock data** for development and testing

## 🛠️ Technologies

- **React 18** with TypeScript
- **Vite** as bundler and dev server
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Lucide React** for icons
- **ESLint** for linting

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd crypto-checkout
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🎯 Usage

### Available test URLs:

- **Pending order**: `/checkout/invoice-abc123`
- **Paid order**: `/checkout/invoice-paid123`
- **Expired order**: `/checkout/invoice-expired123`
- **Non-existent order**: `/checkout/any-other-id`

### User flow:

1. **Access a checkout URL** with an invoice ID
2. **View order information** (amount, status, merchant)
3. **Select payment token** (USDC, USDT, cCOP, cREAL)
4. **Choose blockchain network** available for the token
5. **Connect wallet** (functionality pending implementation)

## 🏗️ Project structure

```
src/
├── components/          # React components
│   ├── CheckoutPage.tsx    # Main checkout page
│   ├── TokenDropdown.tsx   # Token selector
│   ├── NetworkDropdown.tsx # Network selector
│   ├── StatusBadge.tsx     # Status badge
│   ├── LoadingSpinner.tsx  # Loading spinner
│   └── ErrorMessage.tsx    # Error message
├── hooks/               # Custom hooks
│   ├── useInvoice.ts       # Hook for loading invoices
│   └── useCopyToClipboard.ts # Hook for copying to clipboard
├── services/            # Services and APIs
│   └── invoiceService.ts   # Invoice service (mock)
├── types/               # Type definitions
│   └── invoice.ts          # Invoice and token types
├── utils/               # Utilities
│   └── tokenUtils.ts       # Utilities for token grouping
├── App.tsx              # Main component
└── main.tsx             # Entry point
```

## 🧪 Testing

### Available tokens in mock:

- **USDC**: Base, Polygon
- **USDT**: Polygon
- **cCOP**: Celo
- **cREAL**: Celo

### Order statuses:

- `pending`: Active order waiting for payment
- `paid`: Successfully completed order
- `expired`: Expired order, cannot be paid

## 📝 Available scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Build for production

# Linting
npm run lint         # Run ESLint

# Preview
npm run preview      # Preview production build
```

## 🔧 Configuration

### Environment variables

Currently no environment variables are required as it uses mock data.

### Customization

To modify mock data, edit the file `src/services/invoiceService.ts`:

```typescript
const mockInvoices: Record<string, InvoiceResponse> = {
  "your-invoice-id": {
    id: "your-invoice-id",
    commerce_id: "your-merchant",
    amount_fiat: 100000,
    fiat_currency: "COP",
    status: "pending",
    tokens: [
      // Your tokens here
    ],
  },
};
```

## 🚀 Deployment

1. **Build for production**

   ```bash
   npm run build
   ```

2. **Static files are generated in** `dist/`

3. **Deploy** to your preferred platform (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-functionality`)
3. Commit your changes (`git commit -m 'Add new functionality'`)
4. Push to the branch (`git push origin feature/new-functionality`)
5. Open a Pull Request

## 📄 License

This project is under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check [existing issues](../../issues)
2. Create a [new issue](../../issues/new) if necessary
3. Provide details about the problem and steps to reproduce it

---

Developed with ❤️ using React + TypeScript + Tailwind CSS
