# Email Configuration Guide

## Setting Up Email Service

To enable email functionality for sending PDF reports, you need to configure SMTP settings in your `.env.local` file.

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Hazard Inspect App"
   - Copy the generated 16-character password

3. **Add to `.env.local`**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM=your_email@gmail.com
```

### Option 2: Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
SMTP_FROM=your_email@outlook.com
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@yahoo.com
```

#### Custom SMTP Server
```env
SMTP_HOST=your.smtp.server.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM=noreply@yourdomain.com
```

### Testing Email Configuration

After configuring, restart your development server and try sending an email report. If you encounter errors:

1. **ECONNREFUSED**: Check SMTP_HOST and SMTP_PORT
2. **EAUTH**: Check SMTP_USER and SMTP_PASS
3. **Connection timeout**: Check firewall/network settings

### Security Notes

- Never commit `.env.local` to version control
- Use App Passwords instead of your main account password
- For production, use environment variables on your hosting platform

### Troubleshooting

**Gmail "Less secure app" error:**
- Gmail no longer supports "less secure apps"
- You MUST use an App Password (see Option 1 above)

**Port 587 vs 465:**
- Port 587: Uses STARTTLS (recommended)
- Port 465: Uses SSL/TLS directly
- The app automatically detects which to use based on the port

**Firewall/Network Issues:**
- Ensure port 587 (or 465) is not blocked
- Some corporate networks block SMTP ports
- Try using a different network or VPN

