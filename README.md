# Pre-Delivery Inspection Web App

A comprehensive pre-delivery inspection management system built with Next.js, React, and Supabase (PostgreSQL). This application enables inspectors to conduct thorough inspections with photo collection, barcode scanning, GPS location tracking, and automated PDF report generation.

## Features

### ✅ Core Functionality

1. **Data Collection/Recording**
   - Comprehensive inspection checklist with customizable categories
   - Per-item status tracking (Pass/Fail/N/A)
   - Notes and comments for each checklist item
   - Inspector and vehicle information capture

2. **Photo Collection**
   - Multiple photo uploads per inspection
   - Cloud storage integration (AWS S3)
   - Photo association with checklist items
   - Image preview and management

3. **Barcode Scanning**
   - Real-time barcode/QR code scanning using device camera
   - Support for multiple barcode formats
   - Automatic association with inspection records

4. **GPS Location Pinning**
   - Automatic GPS location capture
   - Reverse geocoding for address lookup
   - Location display on Google Maps
   - Manual location update capability

5. **Email Digital PDF Reports**
   - Automated PDF report generation
   - Email delivery to multiple recipients
   - Professional formatted reports with all inspection data
   - Includes photos, checklist, and metadata

6. **Cloud Storage**
   - AWS S3 integration for photo storage
   - Secure file upload and retrieval
   - Signed URLs for secure access

7. **Data and Privacy Compliance**
   - GDPR-compliant data handling
   - Privacy consent tracking
   - Configurable data retention policies
   - Data export and deletion capabilities
   - Privacy policy and compliance documentation

8. **Search and Export**
   - Advanced search functionality
   - Filter by date range, status, inspector
   - Export individual or bulk inspections
   - Historical report viewing and management

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Cloud Storage**: AWS S3
- **PDF Generation**: jsPDF with autoTable
- **Email**: Resend
- **Barcode Scanning**: html5-qrcode
- **Form Management**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase project (database and API keys)
- Resend account (for PDF email delivery)
- Optional: AWS account with S3 bucket (for photo storage)

### Installation

1. Clone the repository:
```bash
cd "Pre Delivery App"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration (see `.env.local.example`):
```env
# Supabase (from project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (for email reports and password reset)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=your-verified@yourdomain.com

# JWT secret for auth (change in production)
JWT_SECRET=your-secret-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Then run the initial database schema in Supabase (Dashboard > SQL Editor): see `supabase/migrations/001_initial_schema.sql`.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Pre Delivery App/
├── app/
│   ├── api/
│   │   ├── inspections/          # Inspection CRUD endpoints
│   │   ├── upload/               # File upload endpoint
│   │   ├── export/               # PDF export endpoint
│   │   └── compliance/           # Data retention/compliance
│   ├── inspection/
│   │   └── new/                  # New inspection page
│   ├── inspections/              # Inspection list and detail pages
│   ├── privacy/                  # Privacy policy page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── InspectionForm.tsx        # Main inspection form
│   ├── PhotoUpload.tsx           # Photo upload component
│   ├── BarcodeScanner.tsx        # Barcode scanning component
│   └── GPSLocation.tsx           # GPS location component
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── db-users.ts               # User DB helpers
│   ├── s3.ts                     # AWS S3 utilities
│   ├── email.ts                  # Resend email utilities
│   ├── pdfGenerator.ts          # PDF generation
│   └── compliance.ts             # Privacy/compliance utilities
├── types/
│   └── db.ts                     # DB types and mappers
├── supabase/
│   └── migrations/               # SQL schema
└── package.json
```

## Usage

### Creating a New Inspection

1. Navigate to "New Inspection" from the home page
2. Fill in inspector information
3. Allow GPS location access or manually update location
4. Scan barcode if applicable
5. Enter vehicle information
6. Upload photos as needed
7. Complete the inspection checklist
8. Provide privacy consent
9. Save the inspection

### Viewing and Searching Inspections

1. Navigate to "View Inspections"
2. Use the search bar to find inspections by:
   - Inspection number
   - Inspector name
   - Barcode
   - VIN
   - License plate
3. Filter by status or date range
4. Click "View" to see details or "Export" to download PDF

### Sending Reports via Email

1. Open an inspection detail page
2. Click "Email Report"
3. Enter recipient email addresses (comma-separated)
4. The PDF report will be sent automatically

## Data Model

The inspection data model includes:
- Inspector information (name, email)
- Inspection metadata (number, date, status)
- Location data (GPS coordinates, address)
- Vehicle information (make, model, year, VIN, license plate)
- Barcode data
- Checklist with categories and items
- Photos (stored in S3)
- Privacy consent and retention settings

## Privacy & Compliance

- **GDPR Compliance**: Full support for data subject rights
- **Data Retention**: Configurable retention periods (default: 365 days)
- **Privacy Consent**: Explicit consent tracking
- **Data Export**: GDPR-compliant data export functionality
- **Secure Storage**: Encrypted data storage and transmission

## API Endpoints

- `GET /api/inspections` - List inspections (with search/filter)
- `POST /api/inspections` - Create new inspection
- `GET /api/inspections/[id]` - Get inspection details
- `PUT /api/inspections/[id]` - Update inspection
- `DELETE /api/inspections/[id]` - Delete inspection
- `POST /api/inspections/[id]/email` - Email PDF report
- `POST /api/upload` - Upload file to S3
- `GET /api/export?id=[id]` - Export inspection as PDF
- `POST /api/compliance/retention` - Run data retention cleanup

## Customization

### Checklist Items

Edit the `defaultChecklist` in `components/InspectionForm.tsx` to customize inspection categories and items.

### Data Retention

Modify retention policies in `lib/compliance.ts` and the Inspection model.

### Styling

Customize the Tailwind theme in `tailwind.config.js`.

## Production Deployment

1. Create a production Supabase project and run the migration SQL
2. Configure Resend (verify domain, set RESEND_FROM_EMAIL)
3. Optional: Configure AWS S3 for photo storage
4. Set JWT_SECRET and all env vars in your host (e.g. Vercel)
5. Build the application:
```bash
npm run build
npm start
```

## Security Considerations

- Never commit `.env.local` to version control
- Use strong AWS credentials with minimal required permissions
- Enable HTTPS in production
- Regularly update dependencies
- Implement rate limiting for API endpoints
- Set up proper CORS policies

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, please contact the development team.


