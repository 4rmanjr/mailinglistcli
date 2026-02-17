# Mailing List CLI - Web App

Modern web application untuk mengelola mailing list dan surat penyegelan.

## Tech Stack

### Frontend
- **React 19** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Navigation
- **Lucide React** - Icons
- **Recharts** - Charts & visualization

### Backend
- **PHP 8+** - API server
- **SQLite** - Database

## Features

- ✅ Modern, responsive dashboard
- ✅ Sidebar navigation
- ✅ Customer management (CRUD)
- ✅ Statistics dashboard
- ✅ Search functionality
- ✅ Modal forms
- ✅ Clean UI with CSS variables

## Getting Started

### Prerequisites

- Node.js 18+
- PHP 8+
- npm

### Installation

1. Install dependencies:

```bash
cd web
npm install
```

2. Start the PHP API server (in one terminal):

```bash
./start-api.sh
# or
cd api && php -S localhost:8080
```

3. Start the development server (in another terminal):

```bash
cd web
npm run dev
```

4. Open http://localhost:3000

## Project Structure

```
mailinglistcli/
├── web/                    # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   ├── App.css        # Styles
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── api/
│   ├── index.php          # API endpoints
│   └── database.sqlite    # SQLite database
└── start-api.sh           # API server script
```

## API Endpoints

### Stats
- `GET /api/stats` - Get dashboard statistics

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Letters
- `GET /api/letters` - Get all letters
- `GET /api/letters/:id` - Get letter by ID
- `POST /api/letters` - Create letter
- `DELETE /api/letters/:id` - Delete letter

## Pages

- **Dashboard** - Overview with statistics
- **Pelanggan** - Customer management
- **Surat** - Letter management
- **Mailing** - Mailing list management
- **Pengaturan** - Settings

## Development

### Build for production

```bash
cd web
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## UI Components

The app uses a custom design system with CSS variables:

- Primary color: `#6366f1` (Indigo)
- Success: `#22c55e` (Green)
- Danger: `#ef4444` (Red)
- Warning: `#f59e0b` (Amber)

## Responsive Design

- Desktop: Full sidebar + content
- Tablet: Collapsible sidebar
- Mobile: Hidden sidebar with toggle

## License

MIT
