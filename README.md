# SnapFix - Professional Service Management Platform

## Project Description
SnapFix is a comprehensive service management platform that connects customers with qualified technicians for maintenance and repair needs. The platform streamlines the entire service process from request creation to completion, featuring:

* Real-time technician tracking  
* Smart scheduling  
* AI-powered service estimation  
* Secure payment processing  

### User Roles
SnapFix serves three primary user roles:

1. **Customers:** Request services, track technicians, and rate completed work  
2. **Technicians:** Manage assigned jobs, update availability, and receive ratings  
3. **Administrators:** Manage users, assign technicians, and monitor system performance  

---

## Screenshots

### Landing Page
![Landing Page Image 1](/Front_End/assets/screenshots/landing-page1.png),
![Landing Page Image 2](/Front_End/assets/screenshots/landing-page2.png),
![Landing Page Image 3](/Front_End/assets/screenshots/landing-page3.png),
![Landing Page Image 4](/Front_End/assets/screenshots/landing-page4.png)    
Clean, modern landing page with feature highlights and call-to-action.

### User Dashboard
![User Dashboard Image 1](/Front_End/assets/screenshots/user-dashboard1.png),
![User Dashboard Image 2](/Front_End/assets/screenshots/user-dashboard2.png)  
Personalized dashboard showing service requests, statistics, and recent activity.

### Service Request Form
![Service Request Form Image 1](/Front_End/assets/screenshots/service-request1.png),
![Service Request Form Image 2](/Front_End/assets/screenshots/service-request2.png),
![Service Request Form Image 3](/Front_End/assets/screenshots/service-request3.png)   
Intuitive form for creating service requests with AI estimation feature.

### Technician Selection
![Technician Selection](/Front_End/assets/screenshots/technician-selection.png)  
Interface for browsing and selecting available technicians with ratings.

### Admin Management
![Admin Dashboard Image 1](/Front_End/assets/screenshots/admin-dashboard1.png),
![Admin Dashboard Image 2](/Front_End/assets/screenshots/admin-dashboard2.png)  
Administrative interface for user management and system oversight.

---

## Setup Instructions

### Prerequisites
* Node.js v14 or higher  
* Java JDK v11 or higher  
* Maven v3.6 or higher  

---

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd snapfix/back_end
```

2. Configure Database and JPA Settings in application.properties:
# Database Settings
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=@317Kns20020317
spring.datasource.url=jdbc:mysql://localhost:3306/snapfix_db?createDatabaseIfNotExist=true
spring.datasource.hikari.maximum-pool-size=10

# JPA Settings
spring.jpa.generate-ddl=true
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update

3. Create a .env file in the backend root directory with the following:
IMGBB_API_KEY=your_imgbb_api_key
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key

4. Build and run the backend:
mvn clean install
mvn spring-boot:run

The backend will start on http://localhost:8080

### Frontend Setup
1. Navigate to the frontend directory:
cd snapfix/Front_End

2. Install dependencies:
npm install

3. Configure API endpoint in JavaScript files: 
const BASE_URL = "http://localhost:8080/snapfix";

4. Launch the frontend:
Open index.html in a browser or run a local server

### Quick Start (Spring Boot + Frontend)

# Start backend (Spring Boot)
cd snapfix/back_end
mvn spring-boot:run

# Start frontend
cd snapfix/Front_End
npx http-server -p 8000

### YouTube Video

Watch a full demonstration of SnapFix features:
[![Watch the Demo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

© 2025 SnapFix | Professional Service Management Platform

