Task Management Application
Full Stack Internship Assignment

Overview
This is a simple full-stack task management web application built as part of a skill assessment. The application allows users to create, view, update, and delete tasks. The main focus of this project is to demonstrate understanding of frontend fundamentals, REST APIs, and backend logic.

Tech Stack

Frontend

HTML

CSS

JavaScript (Vanilla)

Backend

Node.js

Express.js

Database

In-memory storage (for simplicity in this assignment)

Features

Add new tasks with title, description, and status

View all tasks

Update task details and status

Delete tasks

Filter tasks by status (Pending, In Progress, Completed)

Responsive and clean user interface

Project Structure

Assignment1/
client/

index.html

style.css

script.js

server/

index.js

routes/

README.md

How to Run the Project

Backend

Navigate to the server folder

Install dependencies
npm install

Start the server
node index.js

Server runs on http://localhost:5000

Frontend

Open client/index.html in the browser

Make sure the backend server is running

API Endpoints

GET /api/tasks
Fetch all tasks

POST /api/tasks
Create a new task

PUT /api/tasks/:id
Update a task

DELETE /api/tasks/:id
Delete a task
