# RedBird

## Suggested FILE Structure

SOCS_Project/
│
├── index.php # Main entry point (landing page)
├── .htaccess # For URL routing or other server configuration (optional)
│
├── assets/ # Static assets like CSS, JS, and images
│ ├── css/
│ │ ├── styles.css # Main stylesheet
│ ├── js/
│ │ ├── main.js # Main JavaScript file
│ ├── images/ # Images for branding and UI
│
├── includes/ # Reusable PHP files
│ ├── header.php # Common header HTML
│ ├── footer.php # Common footer HTML
│ ├── db.php # Database connection logic
│ ├── auth.php # User authentication (login, session)
│
├── pages/ # Main feature pages
│ ├── login.php # Login/Register page
│ ├── dashboard.php # Dashboard (private user page)
│ ├── create_booking.php # Create booking page
│ ├── booking_url.php # Book using URL page
│ ├── user_settings.php # User settings page
│
├── config/ # Configuration files
│ ├── config.php # General settings (database, site URL)
│
├── sql/ # Database-related files
│ ├── setup.sql # SQL file to set up database tables
│
├── api/ # API endpoints for AJAX or external interaction
│ ├── create_booking.php # API to handle booking creation
│ ├── fetch_bookings.php # API to fetch bookings dynamically
│
├── logs/ # Logs for errors or debugging (optional)
│ ├── error.log # Server error logs
│
└── README.md # Project overview and instructions
