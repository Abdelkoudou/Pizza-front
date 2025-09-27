# NEXO PIZZA Admin Dashboard

A modern React-based admin dashboard for NEXO PIZZA restaurant management system.

## Features

- **Menu Management**: Complete menu management system with categories and menu items
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Modern UI**: Clean and intuitive design with orange accent colors
- **TypeScript**: Full TypeScript support for better development experience

## Current Pages

- **Menu Management**: Manage pizza menu items with different sizes and prices
  - Category filtering (Pizza, Soft Drinks, Hot Drinks, Desserts, etc.)
  - Menu item cards with sizes and pricing
  - Add new items functionality
  - Search and filter capabilities

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # Main layout wrapper
│   ├── Sidebar.tsx         # Left navigation sidebar
│   └── Header.tsx          # Top header with search and user profile
├── pages/
│   └── MenuManagement.tsx  # Menu management page
├── App.tsx                 # Main application component
├── App.css                 # Global styles
└── index.tsx               # Application entry point
```

## Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Lucide React**: Beautiful icons
- **CSS3**: Modern styling with flexbox and grid
- **Create React App**: Development and build tooling

## Design Features

- **Sidebar Navigation**: Easy access to different sections
- **Search Functionality**: Quick search through menu items
- **Category Filtering**: Filter menu items by category
- **Responsive Grid**: Menu items displayed in a responsive grid
- **Modern Cards**: Clean card design for menu items
- **Orange Theme**: Consistent orange accent color throughout

## Future Enhancements

- Dashboard page (currently in design phase)
- Ingredients management
- Staff management
- Settings page
- User authentication
- Data persistence
- Real-time updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.