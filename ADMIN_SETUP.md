# AUTOHIVE Admin Panel Setup

## Admin Credentials

Email: `info@mk-emotorsdornach.ch`
Password: `Blevh4np1@@`

## Accessing the Admin Panel

1. Navigate to `http://localhost:3000/sign-in` (or your deployed URL)
2. Enter the admin credentials above
3. You'll be redirected to `/admin` dashboard

## Admin Panel Features

### Dashboard (`/admin`)
- Overview of all content
- Quick stats on products, features, and FAQ items
- Navigation to all management sections

### Products (`/admin/products`)
- Create, edit, and delete bike products
- Manage product titles, prices, specs, and descriptions
- Add/remove products from inventory
- Handle emoji representations for products

### Hero Section (`/admin/hero`)
- Edit the main landing page hero content
- Update product title, subtitle, and description
- Modify performance stats (speed, horsepower, acceleration)
- Real-time preview of changes

### Statistics (`/admin/stats`)
- Manage the statistics section on homepage
- Add/edit/delete stat items
- Set labels, values, and suffixes
- Visual preview of stat display

### Features (`/admin/features`)
- Manage feature cards
- Coming soon: Full CRUD operations

### FAQ (`/admin/faq`)
- Manage FAQ questions and answers
- Coming soon: Full CRUD operations

### Settings (`/admin/settings`)
- Site-wide configuration
- Coming soon: Advanced settings

## Database Integration

The admin panel is integrated with Neon PostgreSQL database with the following tables:

- `user` - Admin user accounts
- `session` - User sessions  
- `account` - OAuth/provider accounts
- `verification` - Email verification
- `products` - Bike inventory
- `hero_content` - Hero section content
- `features` - Feature cards
- `stats` - Statistics data
- `faq` - FAQ items

## Authentication

- Built with Better Auth
- Email + password authentication
- Session-based with 7-day expiration
- Secure cookie handling for cross-site iframe scenarios

## Deployment

When deploying to production:

1. Ensure `BETTER_AUTH_SECRET` is set in environment variables
2. Database URL should point to production Neon database
3. `VERCEL_PROJECT_PRODUCTION_URL` should be configured for proper auth redirects

## Support

For issues with admin panel authentication or content management, check:
- Environment variables are properly set
- Database connection is active
- Better Auth secret is configured
