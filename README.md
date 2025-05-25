# TobaccoTrade System - Installation Guide

## System Overview

TobaccoTrade is a comprehensive platform for managing tobacco auctions, trading, and regulatory compliance. The system consists of:

1. **Backend API** - Built with Laravel (PHP)
2. **Frontend Application** - Built with React
3. **Image Detection Service** - Python-based tobacco verification service

This guide will help you set up all components of the system, even if you have minimal programming knowledge.

## System Requirements

Before starting, ensure you have the following installed:

- **PHP 8.1+** - For the Laravel backend
- **Composer** - PHP dependency manager
- **Node.js 16+** - For the React frontend
- **npm** - Node.js package manager
- **MySQL 5.7+** or **MariaDB 10.3+** - Database server
- **Python 3.8+** - For the image detection service
- **pip** - Python package manager
- **Visual Studio Code** - Recommended code editor

## 1. Setting Up the Backend (Laravel)

### 1.1. Clone the Repository

Open your VS Code terminal and run:

```bash
# Create a directory for the project (if not already created)
mkdir tobacco-system-project
cd tobacco-system-project

# Clone the repository (if you have the repository URL)
# If you don't have a repository URL, you can skip this and copy the files manually
git clone [repository-url] .

# Or navigate to where your project files are extracted
```

### 1.2. Backend Setup (Laravel)

Navigate to the backend directory:

```bash
cd tobacco-system
```

Install PHP dependencies:

```bash
composer install
```

Create a configuration file:

```bash
cp .env.example .env
```

Generate an application key:

```bash
php artisan key:generate
```

### 1.3. Configure the Database

Edit the `.env` file in the `tobacco-system` directory using VS Code. Look for these lines and update them with your database information:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tobacco_system
DB_USERNAME=root
DB_PASSWORD=
```

Now create the database:

```bash
# Connect to MySQL (you may need to provide your password)
mysql -u root -p

# In the MySQL prompt, create the database and exit
CREATE DATABASE tobacco_system;
EXIT;
```

Run database migrations and seed the database:

```bash
php artisan migrate
php artisan db:seed
```

### 1.4. Set Up File Storage

Configure storage for tobacco images:

```bash
php artisan storage:link
```

## 2. Setting Up the Frontend (React)

### 2.1. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../tobacco-management
```

Install Node.js dependencies:

```bash
npm install
```

### 2.2. Configure Environment Variables

Create a `.env` file in the `tobacco-management` directory:

```bash
touch .env
```

Open the file in VS Code and add:

```
VITE_API_URL=http://localhost:8000/api
VITE_PUSHER_APP_KEY=c5ba39b7d1b759608012
VITE_PUSHER_APP_CLUSTER=eu
```

## 3. Setting Up the Python Image Detection Service (Optional)

This component is used for automated tobacco image verification.

### 3.1. Set Up Python Environment

Since you're already using the base conda environment on Windows, you don't need to create a new environment.

```bash
# Navigate to the directory containing app.py
cd ../
```

### 3.2. Install Python Dependencies

In your conda base environment, install the required packages:

```bash
conda install flask pillow requests
pip install torch clip
```

Note: CLIP is a deep learning model that might require specific setup. If you encounter issues, refer to: https://github.com/openai/CLIP

## 4. Running the System

### 4.1. Start the Backend Server

In a new terminal, navigate to the Laravel backend:

```bash
cd tobacco-system
php artisan serve
```

This will start the backend server at http://localhost:8000

### 4.2. Start the Frontend Development Server

In another terminal, navigate to the React frontend:

```bash
cd tobacco-management
npm run dev
```

This will start the frontend development server, typically at http://localhost:5173

### 4.3. Start the Python Image Detection Service (Optional)

In a third terminal window in VS Code, navigate to the root directory (your conda base environment is already activated):

```bash
# Navigate to the directory containing app.py
cd path\to\project\root

# Run the Flask app
python app.py
```

This will start the image detection service at http://localhost:5000

## 5. Accessing the System

Once all components are running:

1. Open your browser and navigate to http://localhost:5173
2. You'll be directed to the login page
3. Use these default credentials:
   - Email: admin@tobacco.com
   - Password: password123

## 6. System Usage

### 6.1. User Types and Permissions

The system supports different user types with specific permissions:

1. **Admin** - Full system access, manages companies and users
2. **Trader** - Can create tobacco listings and auctions, manage sales
3. **Buyer** - Can view and bid on auctions, create orders
4. **TIMB Officer** - Tobacco Industry Marketing Board officer who approves tobacco listings

### 6.2. Key Features

- **Tobacco Listings** - Traders can create and manage tobacco listings
- **TIMB Clearance** - Officers can review and approve tobacco listings
- **Auctions** - Traders can create auctions, buyers can place bids
- **Orders** - Buyers can create orders for won auctions
- **Payments** - Process payments for orders (simulated in the current version)
- **Company Registration** - Register and manage company profiles

## 7. Troubleshooting

### 7.1. Backend Issues

If you encounter issues with the Laravel backend:

```bash
# Clear cache
php artisan cache:clear

# Clear config cache
php artisan config:clear

# Check Laravel logs
cat storage/logs/laravel.log
```

### 7.2. Frontend Issues

If you encounter issues with the React frontend:

```bash
# Check if all dependencies are installed
npm install

# Force rebuild node modules (on Windows)
rmdir /s /q node_modules
npm install
```

### 7.3. Database Issues

```bash
# Reset and recreate the database
php artisan migrate:fresh --seed
```

## 8. Security Notes

This setup guide is for development purposes. For production deployment:

1. Use strong passwords
2. Configure proper SSL/TLS
3. Implement proper authentication mechanisms
4. Review and enhance data validation

## 9. Support

For additional support or inquiries, please contact the system administrator.
