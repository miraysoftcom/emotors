# MK-eMotors - Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Admin user created with secure password
- [ ] SSL certificates ready
- [ ] CDN configured (optional)
- [ ] Backup strategy in place
- [ ] Monitoring setup complete

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mk-emotors

# Admin Authentication
ADMIN_PASSWORD_HASH=<generated-hash>

# Optional: Payment Integration
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# Optional: Email Service
SENDGRID_API_KEY=

# Optional: Analytics
GA_TRACKING_ID=
```

## Database Setup

1. Create PostgreSQL database:
```bash
createdb mk-emotors
```

2. Run migrations (if using Drizzle):
```bash
pnpm db:push
```

3. Seed initial data:
```bash
pnpm db:seed
```

## Building for Production

```bash
# Install dependencies
pnpm install

# Build the application
pnpm run build

# Test production build locally
pnpm start
```

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Connect repository
vercel link

# Deploy
vercel --prod
```

### Option 2: Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t mk-emotors:latest .
docker run -p 3000:3000 -e DATABASE_URL="..." mk-emotors:latest
```

### Option 3: Traditional Server
```bash
# SSH into server
ssh user@server.com

# Clone repository
git clone <repo-url>
cd mk-emotors

# Install and build
pnpm install
pnpm run build

# Use PM2 for process management
pnpm add -g pm2
pm2 start "pnpm start" --name "mk-emotors"
pm2 save
```

## Post-Deployment Verification

1. **Health Check:**
   ```bash
   curl https://your-domain.com/
   ```

2. **Admin Access:**
   - Navigate to `/admin/login`
   - Login with credentials
   - Verify dashboard loads

3. **Frontend Pages:**
   - Homepage loads with sections
   - Product pages display correctly
   - Modals open and respond to interaction

4. **Database:**
   - Verify data is persisting
   - Check admin operations work

## Monitoring & Maintenance

### Recommended Monitoring Tools
- Vercel Analytics (if using Vercel)
- Sentry for error tracking
- LogRocket for session replay
- Datadog or New Relic for infrastructure

### Regular Maintenance Tasks
- Weekly: Review error logs
- Monthly: Database maintenance and backups
- Quarterly: Security updates
- Annually: Full security audit

## Scaling Considerations

1. **Database:** Use connection pooling (PgBouncer)
2. **Static Assets:** CDN for images and media
3. **API Caching:** Redis for frequently accessed data
4. **Load Balancing:** Multiple instances behind load balancer

## Troubleshooting

### Application won't start
- Check environment variables
- Verify database connection
- Check Node.js version compatibility

### Database errors
- Verify DATABASE_URL format
- Check network connectivity
- Review migration status

### Performance issues
- Enable Next.js analytics
- Check database query performance
- Review bundle size

## Support

For issues or questions:
1. Check logs: `pnpm logs`
2. Review error messages in Sentry
3. Check database connectivity
4. Consult deployment platform documentation

## Rollback Procedure

If issues occur after deployment:

```bash
# Using Vercel
vercel --prod --token <token> # Deploy previous build

# Using Docker
docker run -p 3000:3000 mk-emotors:previous
```

## Security Hardening

1. **HTTPS:** Enable automatic redirects
2. **Headers:** Add security headers (CSP, HSTS, X-Frame-Options)
3. **Rate Limiting:** Configure API rate limits
4. **Admin Access:** Restrict admin routes by IP (optional)
5. **Regular Updates:** Keep dependencies updated

## Backup Strategy

```bash
# Daily automated backups
0 2 * * * pg_dump mk-emotors | gzip > /backup/db-$(date +%Y%m%d).sql.gz

# Retain for 30 days
find /backup -name "db-*.sql.gz" -mtime +30 -delete
```

## Contact & Support

- Project Lead: [Contact]
- Technical Support: [Email/Slack]
- Emergency Hotline: [Phone]

---

**Last Updated:** 2025-07-12
**Version:** 1.0 Production Ready
