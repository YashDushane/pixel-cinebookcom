# 🎬CINEBOOK – Movie Ticket Booking Website
# website:- https://pixel-cinebookcom.lovable.app
## 1. About the Project

IMovie is a web-based movie ticket booking website developed as a college project. The main purpose of this project is to provide users with a simple and convenient way to explore movies, select show timings, choose seats, and book movie tickets online.

The website provides a user-friendly interface with movie posters, movie information, user registration, login, seat selection, and booking history. It uses Python and Flask for backend operations and SQLite for storing user and booking information.

This project demonstrates the practical implementation of frontend development, backend programming, database management, and web application integration.

## 2. Objectives

The main objectives of the IMovie project are:

- To develop a simple and user-friendly movie ticket booking website.
- To allow users to register and log in securely.
- To display movie details, categories, and ticket prices.
- To allow users to select show dates, timings, and seats.
- To store user information and booking records in a database.
- To prevent duplicate bookings for the same seat and show.
- To understand how frontend and backend technologies work together.

## 3. Features

### User Registration and Login
Users can create an account using their name, email address, and password. Registered users can log in to access the booking features.

### Movie Browsing
The website displays movie posters and information, including movie titles, categories, languages, ratings, and ticket prices.

### Movie Search and Categories
Users can search for movies and browse available movies according to their categories.

### Seat Selection
Users can select their preferred seats from the available seating layout. The application checks existing bookings to identify seats that are already reserved.

### Ticket Booking
Users can select a movie, show date, show time, and seats. The application calculates the total ticket price and stores the booking information.

### Booking History
Logged-in users can view their previous bookings and related information.

### Database Integration
SQLite is used to store user accounts and booking records. The application initializes the required database tables automatically.

## 4. Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| Flask | Web framework and API handling |
| HTML5 | Structure of web pages |
| CSS3 | Website design and styling |
| JavaScript | Interactive features and seat selection |
| SQLite | Database management |
| GitHub | Source-code hosting and version control |



## 5. Project Structure

The main project files are organized as follows:

```text
IMovieProjectYash/
│
├── app.py
├── cinebook.db
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   ├── script.js
│   └── images/
│       ├── 3-idiots.jpg
│       ├── avengers.jpg
│       ├── bhool_bhulaiyaa_three.jpg
│       ├── interstellar.jpg
│       └── jawan.jpg
│
├── requirements.txt
├── .gitignore
└── README.md
```

**Description of the main files:**

- `app.py`: Contains the Flask application, API routes, authentication logic, movie information, and booking operations.
- `index.html`: Contains the main webpage structure.
- `style.css`: Controls the website's appearance and layout.
- `script.js`: Handles interactive frontend functionality.
- `images/`: Stores movie poster images.
- `cinebook.db`: SQLite database used for storing accounts and booking information.
- `requirements.txt`: Lists the Python packages required to run the application.
- `.gitignore`: Specifies files that should not be tracked by Git.

## 6. Installation and Setup

### Prerequisites

Before running the project, install Python 3 and a code editor such as Visual Studio Code.

### Step 1: Clone the Repository

```bash
git clone https://github.com/YashDushane/IMovieProjectYash.git
```

### Step 2: Open the Project Folder

```bash
cd IMovieProjectYash
```

### Step 3: Install Dependencies

Create a `requirements.txt` file containing:

```text
Flask
gunicorn
```

Then run:

```bash
python -m pip install -r requirements.txt
```

### Step 4: Run the Application

```bash
python app.py
```

Open the local address displayed in the terminal. The current application is configured to run at:

`http://127.0.0.1:5001`

## 7. How the Website Works

The general workflow of the IMovie website is:

1. The user opens the website and browses the available movies.
2. The user registers or logs in to their account.
3. The user selects a movie and chooses a show date and time.
4. The application retrieves the seats already booked for that show.
5. The user selects available seats.
6. The backend validates the booking details and calculates the total price.
7. The booking information is stored in the SQLite database.
8. The user can view the booking in their booking history.

The backend validates booking information to prevent invalid seat selections and duplicate confirmed reservations.

## 8. Security and Data Management

The project implements basic security practices, including password hashing, input validation, parameterized SQL queries, and session-based authentication for booking operations.

The application also uses database constraints to help prevent the same seat from being booked more than once for a particular movie, date, and show time.

For a public deployment, a strong secret key must be configured using an environment variable. Debug mode should be disabled, confidential information must not be uploaded to GitHub, and the database must be hosted using a suitable persistent storage solution.

## 9. Limitations and Future Improvements

The current version is intended for educational use. It does not include a real payment gateway or integration with actual cinema booking systems. Movie information is predefined in the backend, and the application uses SQLite for data storage.

Future improvements may include:

- Integration with an online payment gateway.
- An administrator dashboard for managing movies and shows.
- Email or SMS booking confirmations.
- Ticket cancellation and refund functionality.
- QR-code-based digital tickets.
- A persistent PostgreSQL database.
- Improved mobile responsiveness.
- Automated testing and enhanced security.

## 10. Conclusion

IMovie demonstrates how a movie ticket booking website can be developed using Python, Flask, HTML, CSS, JavaScript, and SQLite. It combines an interactive frontend with backend APIs and database operations to support user accounts, movie browsing, seat selection, and ticket reservations.

The project provides practical experience in full-stack web development and can serve as a foundation for building a more advanced online ticket booking system.

## 11. Author

**Yash Dushane**

GitHub: [YashDushane](https://github.com/YashDushane)



