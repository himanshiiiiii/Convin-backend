# Convin-backend

## Setup
1. Clone the repository
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory and add the following:-
  - MONGDB_URL=mongodb://localhost:27017/balance-sheet
  - JWT_SECRET=yourSecretKey
  - PORT=3000
4. Start the server using `node server.js`


# Features

- User registration and login
- Add and view expenses
- Download balance sheet as CSV
- Individual and overall expense tracking
- Pagination for large datasets
- Input validation and error handling
- Authentication and authorization

# All Paths/Routes
- Signup a new user: POST /users/signup
- Login a new user: POST /users/login
- Get user details: GET /users/:id
- Get individual user expenses: GET /users/:id/expenses
- Add a new expense: POST /expenses
- Get all expenses: GET /expenses
- Get total expenses: GET /expenses/total
- Download balance sheet: GET /expenses/download