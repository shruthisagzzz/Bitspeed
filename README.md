BiteSpeed Backend Task – Identity Reconciliation
🚀 Live Deployment

🔗 Hosted URL:
https://bitspeed-96mc.onrender.com

Endpoint:

POST /identify
📖 Problem Statement

FluxKart users may place orders using different:

Email addresses

Phone numbers

The goal is to build a backend service that:

Identifies if multiple orders belong to the same person

Links contacts using shared email or phone number

Maintains a primary–secondary contact relationship

Returns a consolidated contact view

🛠 Tech Stack

Node.js

Express.js

PostgreSQL (Neon Cloud)

Render (Deployment)

🗄 Database Schema
CREATE TABLE Contact (
  id SERIAL PRIMARY KEY,
  phoneNumber VARCHAR(20),
  email VARCHAR(255),
  linkedId INTEGER,
  linkPrecedence VARCHAR(20) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP
);
🔄 API Endpoint
POST /identify
Request Body
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}

At least one field must be provided.

✅ Response Format
{
  "contact": {
    "primaryContactId": number,
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": [number]
  }
}
🧠 Identity Logic
1️⃣ New Contact

If no existing contact matches:

Create a new primary contact.

2️⃣ Existing Match (Email or Phone)

If email or phone matches:

Link to the oldest primary.

Create a secondary contact if new information is introduced.

3️⃣ Merge Two Primaries (Critical Case)

If two primary contacts become connected:

The oldest contact remains primary

The newer primary becomes secondary

All linked contacts are consolidated

🧪 Example
Request
{
  "email": "george@hillvalley.edu",
  "phoneNumber": "717171"
}
Response
{
  "contact": {
    "primaryContactId": 1,
    "emails": [
      "george@hillvalley.edu",
      "biff@hillvalley.edu"
    ],
    "phoneNumbers": [
      "919191",
      "717171"
    ],
    "secondaryContactIds": [2]
  }
}
⚙️ Running Locally

Clone the repo

Install dependencies:

npm install

Create .env file:

DATABASE_URL=your_neon_connection_string
PORT=3000

Start server:

npm start

Server runs on:

http://localhost:3000
🌐 Deployment

The project is deployed on Render and uses Neon PostgreSQL as the production database.

📌 Key Features Implemented

✔ Primary–secondary linking
✔ Oldest primary preservation
✔ Merge-two-primary handling
✔ Consolidated response formatting
✔ SQL-backed persistent storage
✔ Hosted live endpoint

👤 Author

Shruthi Sagar
