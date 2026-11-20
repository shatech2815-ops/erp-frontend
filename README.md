# CRM Dashboard - React Application

A comprehensive, fully responsive CRM (Customer Relationship Management) dashboard built with React, Vite, and Tailwind CSS.

## Features

### 1. **Dashboard** (Home Page)
- Overview statistics cards (Total Employees, Present Today, Departments, Pending Leaves)
- Attendance overview with interactive bar charts
- Employees by department distribution (pie chart)
- Performance review section
- Pending leave requests management

### 2. **Employees Page**
- Total employees statistics with trends
- Attendance rate tracking
- Leave request management
- Job applicants overview
- Detailed attendance report by department
- Team performance metrics with line chart
- Calendar alerts (birthdays, work anniversaries)
- Employee status breakdown

### 3. **Department Page**
- Visual department distribution charts
- Department-wise employee count
- Departments overview with bar charts
- Recent activity table with employee details

### 4. **Attendance Page**
- Real-time attendance tracking
- Total employees present/on leave/late statistics
- Detailed payroll history table
- Employees on leave list
- Export attendance report functionality

### 5. **Payroll Page**
- Process pay run overview
- Payment details and employee count
- To-do tasks management
- Deduction summary (EPF, ESI, TDS)
- Employee summary (active/resigned)
- Recent payroll history table
- Create pay slip functionality

### 6. **Help Page**
- FAQ section
- Contact form for queries
- Support request submission

### 7. **Chat Module**
- Real-time messaging interface
- Conversation list with user status
- Message search functionality
- Emoji and file attachment support
- User presence indicators

## Technology Stack

- **React 19.2.0** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Charting library

## Installation

1. Extract the zip file
2. Navigate to the project directory:
```bash
cd crm-dashboard
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit `http://localhost:5173`

## Build for Production

To create a production build:

```bash
npm run build
```

The build files will be generated in the `dist` folder.

## Project Structure

```
crm-dashboard/
├── src/
│   ├── assets/
│   │   └── images/          # Image assets
│   ├── components/
│   │   ├── CrmDashboard.jsx # Main dashboard container
│   │   ├── Employees.jsx    # Employees page
│   │   ├── Department.jsx   # Department page
│   │   ├── Attendance.jsx   # Attendance page
│   │   ├── Payroll.jsx      # Payroll page
│   │   ├── Help.jsx         # Help/Support page
│   │   └── ChatModule.jsx   # Chat interface
│   ├── App.jsx              # Root component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
└── vite.config.js          # Vite configuration
```

## Backend API Integration

The application is designed to work with a Spring Boot backend. Each component includes detailed comments about the expected API endpoints:

### Authentication
All API requests should include the Authorization header:
```
Authorization: Bearer {token}
```

### Key API Endpoints

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard overview data

#### Employees
- `GET /api/employees/overview` - Get employees data

#### Departments
- `GET /api/departments/overview` - Get department data
- `POST /api/departments` - Add new department

#### Attendance
- `GET /api/attendance/overview` - Get attendance data
- `GET /api/attendance/export` - Export attendance report

#### Payroll
- `GET /api/payroll/overview` - Get payroll data
- `POST /api/payroll/pay-slip` - Create pay slip

#### Help
- `POST /api/help/query` - Submit help query

#### Chat
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/messages/{conversationId}` - Get messages
- `POST /api/chat/messages` - Send message

## Responsive Design

The dashboard is fully responsive and works seamlessly across:
- **Desktop** (1920px and above)
- **Laptop** (1024px - 1919px)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## Key Features

### Sidebar Navigation
- Collapsible sidebar for mobile devices
- Active menu highlighting
- User profile display at bottom

### Interactive Charts
- Bar charts for attendance tracking
- Donut/Pie charts for department distribution
- Line charts for performance metrics
- Hover tooltips with detailed information

### Data Tables
- Sortable columns
- Filter functionality
- Search capabilities
- Export options

### Forms
- Input validation
- Success/error notifications
- File upload support

## Customization

### Colors
The primary color scheme can be customized in `tailwind.config.js`:
```javascript
colors: {
  primary: '#4C708E',
  secondary: '#C8E1F5',
  // Add more custom colors
}
```

### Styling
All components use Tailwind CSS utility classes. Modify the classes directly in the component files or extend the theme in `tailwind.config.js`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Lazy loading for components
- Image optimization
- Code splitting
- Efficient re-renders with React hooks
- Responsive images

## Future Enhancements

- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Advanced filtering and sorting
- [ ] Export data in multiple formats (PDF, Excel, CSV)
- [ ] Real-time notifications
- [ ] Role-based access control
- [ ] Dashboard customization options

## Support

For any issues or questions, please use the Help page within the application to submit a query.

## License

This project is proprietary and confidential.

## Author

Infotroz Projects Team

---

**Note**: This is a frontend application that requires a backend API to function fully. Please ensure your backend services are running and properly configured before using the application.
