# Swing System App for Cellular Sales

## Overview
The Swing System App is a queue management solution developed to solve a common challenge at my Cellular Sales local store. This application streamlines customer assignments, ensuring fair distribution of sales opportunities while providing real-time visibility into the queue status.

Please note that after periods of inactivity, the site may take a few seconds to load as the Render-hosted server wakes up from sleep mode.

## Problem Statement
At Cellular Sales, we faced several challenges with our manual swing system:
- Difficulty tracking which sales rep should get the next customer
- Confusion when handling customers
- No visibility into queue status across the sales floor
- Inconsistent application of queue rules when shifts change
- Lack of data on customer volume and rep performance

## Testing 🚨 **Important** 
Since this is a demo version of the actualy application, here are testing emails:

test@test.com
test123

natelevi@cellularsales.com
Raygun11

brendenburns@cellularsales.com
testemail3

lewisporter@cellularsales.com
testemail4

johncrawford@cellularsales.com
testemail5

## Features

### Queue Tasking
- The reps understood that their order was based on who clocked in for the day
- The first in order got the next customer
- Reps sign in at the start of their shift, press the help button
- When a customer walks in, the system assigns the customer to the rep at the top with a status of busy

### Real-time Updates
- Using Socket.IO and Firebase, the system updates in real time
- Reps can immediately see who's next, who is busy, and how many customers are waiting

### Wait Time and Total Customers
- Reps can see how long customers have been waiting based on when they walked in
- After each rep finishes with a customer, their total customers increases by 1
- If a group came in, the rep still helps the group which counts as 1 customer

### Authentication
- Reps log in using their work email and password (managed via Firebase Authentication)
- This allows them to assign themselves to a specific customer

### Queue Visibility
- All reps can see current queue order and their position

### Reset Rep
- This feature allows reps to reset their position in the queue
- Used in rare cases when the customer didn't count (fraud, abuse, or chaotic event)

### Add and Remove Customer
- This feature allows reps to add a customer to the queue and remove one if needed

## Technologies Used

### Frontend
- React (built with Vite)

### Backend
- Node.js with Express

### Real-time Communication
- Socket.IO

### Authentication
- Firebase Authentication

### Database
- PostgreSQL
- Supabase

### Deployment
- Netlify: Frontend hosting
- Render: Backend hosting

## Impact
The Swing System App was adopted by our store team and resulted in:
- Reduction in confusion over customer assignments
- Eliminated disputes over the queue order
- Increased transparency across the sales floor
- Improved management visibility into sales rep performance
- Better customer experience through reduced wait times

### Installation
```bash
# Clone the repository

# Install dependencies
cd server && cd client npm install
npm install

# Start development server
npm run dev
```

## Usage
1. Sales reps log in at the beginning of their shift
2. System automatically places them in the queue
3. When customers enter, the system assigns them to the rep at the top of the queue
4. Reps can update their status and view real-time queue information
5. Managers can access customer and rep performance data
