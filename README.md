# Swing System App for Cellular Sales

## Overview
A full-stack, real-time store management system tailored for Cellular Sales’ Store A. Built to modernize internal operations, streamline customer handling, manage inventory, and track store performance with live data.

Please note that after periods of inactivity, the site may take a few seconds to load as the Render-hosted server wakes up from sleep mode.

## Problem Statement
At Cellular Sales, we faced several challenges with our manual swing system:
❌ Confusion about rep rotation and customer assignment

❌ No centralized way to track or manage inventory and supplies

❌ Lack of visibility into key store performance data

❌ No internal support request system

❌ Fragmented or inconsistent store operations

Solution: The Store A Management System
This app provides a unified digital hub to support daily store operations, combining real-time queueing, inventory tracking, analytics, and support features into a single, modern interface.

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

## Key Features

 Dashboard
Live analytics and charts for:

Rep performance

Customer swing volume

Inventory trends

Supply usage

👥 Rep Portal
Real-time rep queue system ("swing system")

Rep check-ins and customer assignment tracking

Auto-rotation with status updates

📦 Inventory Management
View, add, edit, and transfer inventory between stores

Supports detailed tracking of devices, SIMs, and accessories

📑 Supply Ordering
Browse supply catalog from product_types

Place timed orders (delayed fulfillment to simulate restocking window)

Auto-adds to inventory when order is "fulfilled"

🔄 Inventory Transfers
Transfer inventory between stores

Status tracking and admin approval flow

🆘 Internal Support System
Submit support tickets

Track resolution status

Categorized by department or issue type

## Tech Stack
Frontend: React, React Router, Material UI

Backend: Express.js, Node.js, Supabase (PostgreSQL), Firebase Auth

Real-Time: Socket.IO

Data: Day.js, Chart.js or Recharts (based on implementation)

Auth: Firebase Admin SDK + JWT

Deployment: Render, netlify




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
