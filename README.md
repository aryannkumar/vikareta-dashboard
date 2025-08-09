# Vikareta Dashboard

The business dashboard for the Vikareta B2B marketplace, accessible at `dashboard.vikareta.com`.

## Overview

This is a separate Next.js application that handles all dashboard-related functionality for business users, including:

- Business metrics and analytics
- Product and service management
- Order tracking and management
- RFQ (Request for Quote) handling
- Wallet and payment management
- Advertisement campaigns
- User profile and settings

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to the Vikareta API backend

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

### Running the Application

For development:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3001`

For production:
```bash
npm run build
npm start
```

## Subdomain Configuration

### Development

In development, the main web application (`vikareta-web`) redirects dashboard routes to `http://localhost:3001`.

### Production

In production, the dashboard is served from `dashboard.vikareta.com`. Configure your DNS and load balancer to route:

- `vikareta.com` → Main web application
- `dashboard.vikareta.com` → Dashboard application

### Nginx Configuration Example

```nginx
# Main website
server {
    listen 80;
    server_name vikareta.com www.vikareta.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Dashboard subdomain
server {
    listen 80;
    server_name dashboard.vikareta.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Architecture

### Authentication

The dashboard uses the same authentication system as the main web application. Users are redirected to the dashboard after successful login.

### API Integration

All API calls are made to the same backend as the main web application, using the shared API client configuration.

### State Management

- **Zustand** for global state management
- **React Query** for server state and caching
- **React Hook Form** for form state

### Routing

The dashboard uses a role-based routing system that shows different navigation options based on user type:

- **Buyers**: Orders, RFQs, Following, Wallet
- **Sellers**: Products, Orders, RFQs, Advertisements, Analytics, Wallet  
- **Both**: All features available

## Key Features

### Dashboard Overview
- Business metrics and KPIs
- Recent activity feed
- Quick action shortcuts
- Account status and verification

### Product Management
- Add/edit products and services
- Inventory management
- Category organization
- Performance analytics

### Order Management
- Order tracking and fulfillment
- Order history and details
- Status updates and communication

### RFQ System
- Create and manage RFQs
- Respond to received RFQs
- Quote management
- Deal negotiation

### Advertisement Campaigns
- Create and manage ad campaigns
- Performance analytics
- Budget tracking
- Audience insights

### Wallet & Payments
- Wallet balance and transactions
- Payment history
- Subscription management
- Money management

## Deployment

### Docker

Build the Docker image:
```bash
docker build -t vikareta-dashboard .
```

Run the container:
```bash
docker run -p 3001:3000 vikareta-dashboard
```

### Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_API_URL=https://api.vikareta.com/api
NEXT_PUBLIC_APP_URL=https://dashboard.vikareta.com
NODE_ENV=production
```

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Follow the component organization in `/components`
4. Add proper error handling and loading states
5. Test your changes thoroughly

## Support

For technical support or questions about the dashboard, contact the development team.
## 
CI/CD Pipeline Status
- ✅ Centralized Helm Chart Integration
- ✅ ArgoCD Image Updater Support
- ✅ Automatic Deployment Pipeline

<!-- Build trigger: Sat Aug  9 22:54:00 IST 2025 -->