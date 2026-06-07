# Airport Counter System

A Laravel + React (Inertia.js) application for managing airport customer arrivals, payments, vehicle assignments, and trip dispatching.

## Features

* Customer Registration
* Cash & POS Payments
* PDF Invoice Generation
* Email Invoices (Queue Based)
* Vehicle Assignment
* Driver Management
* Trip Management
* Agent Approval Workflow

## Tech Stack

* Laravel
* React
* Inertia.js
* MySQL
* Tailwind CSS
* DomPDF

## Installation

```bash
git clone https://github.com/Explore-Holdings/terminal-prime.git

composer install

npm install

cp .env.example .env

php artisan key:generate
```

Configure your database in `.env`

```env
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

Run migrations:

```bash
php artisan migrate
```

Create storage link:

```bash
php artisan storage:link
```

Start the application:

```bash
php artisan serve

npm run dev
```

Start queue worker:

```bash
php artisan queue:work
```

## Workflow

1. Customer arrives
2. Create customer record
3. Process payment
4. Generate invoice
5. Assign vehicle
6. Create trip
7. Driver status changes to On Duty
8. Agent status changes to Approved

## Driver Status

* Off Duty
* On Duty

Only On Duty drivers can be assigned to new trips.