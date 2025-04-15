# TourHub Admin Dashboard

The TourHub Admin Dashboard is a dedicated administration system for the TourHub application. It connects to the same backend as the main TourHub application but provides specialized tools for moderators to manage reported content.

## Features

- **Authentication System**: Secure login for administrators only
- **Reported Messages Management**: View, filter, and take action on reported messages
- **Admin Actions**: Delete messages, mute users, mark reports as reviewed
- **Dashboard Statistics**: Quick overview of platform activity including pending reports, total users, etc.
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Theme support for different preferences and environments

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pos313/tourhub_admin.git
cd tourhub_admin
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example` and configure your backend API endpoints.

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to [http://localhost:3001](http://localhost:3001)

## API Integration

This admin dashboard integrates with the TourHub backend API. The following endpoints are used:

- `/api/admin/reports` - Get all reports and filter by status
- `/api/admin/reports/<report_id>` - Update report status
- `/api/admin/blocked-users` - List all blocked users
- `/api/admin/block-user` - Create blocks between users
- `/api/admin/unblock-user/<block_id>` - Remove blocks
- `/api/admin/message/<message_type>/<message_id>` - Get message details
- `/api/admin/message/<message_type>/<message_id>` - Delete messages
- `/api/admin/dashboard-stats` - Get admin dashboard statistics

## Admin Workflow

1. Login with admin credentials
2. View pending reports on the dashboard
3. Click on a reported message to view details
4. Take appropriate action:
   - Clear: Mark reports as reviewed
   - Mute User: Block a problematic user
   - Delete: Remove the message from the system

## Build for Production

```bash
npm run build
# or
yarn build
```

The production build will be available in the `dist` directory.

## Security Considerations

- This admin panel should be deployed on a secure domain with HTTPS
- Access should be restricted to authorized administrators only
- The backend should validate that the user has administrative privileges for each request

## License

This project is part of the TourHub application ecosystem. All rights reserved.

## Related Projects

- [TourHub Frontend](https://github.com/pos313/PWA-APP)
- [TourHub Backend](https://github.com/anjunabeats/tourhub_backend)
