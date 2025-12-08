# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection (Required)
MONGODB_URI=mongodb://localhost:27017/pre-delivery-inspection

# AWS S3 Configuration (Required for photo uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=pre-delivery-inspections

# Email Configuration (Required for emailing PDF reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Quick Setup Options:

**For Development/Testing (Minimal Setup):**
- **MongoDB**: Use MongoDB Atlas (free tier) or local MongoDB
- **AWS S3**: Can be skipped for testing (photos won't upload, but app will run)
- **Email**: Can use Gmail with App Password, or skip for testing

**Minimum Required:**
- `MONGODB_URI` - Required for the app to function

## Step 3: Start MongoDB (if using local)

If you're using a local MongoDB instance:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Step 4: Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 5: Access the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Click "New Inspection" to create your first inspection
3. Click "View Inspections" to see all inspections

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check your `MONGODB_URI` is correct
- For MongoDB Atlas, ensure your IP is whitelisted

### Photo Upload Issues
- If AWS S3 is not configured, photo uploads will fail
- For testing, you can comment out photo upload functionality temporarily

### Email Not Sending
- Check SMTP credentials
- For Gmail, use an App Password (not your regular password)
- Ensure 2-factor authentication is enabled on Gmail

### Barcode Scanner Not Working
- Ensure you're accessing via HTTPS or localhost (required for camera access)
- Grant camera permissions when prompted

## Production Build

To create a production build:

```bash
npm run build
npm start
```

