# Airport Counter System

A Laravel + React (Inertia.js) application for managing airport customer arrivals, payments, vehicle assignments, and trip dispatching.

## Features

* Customer registration and passenger intake
* Cash and POS payment processing
* PDF invoice generation
* Email invoices via queued jobs
* Vehicle assignment and dispatch
* Driver management, status tracking, and service categories
* Trip creation and administration
* Agent approval workflow for completed trips

## Tech Stack

* PHP 8.2+
* Laravel 12
* React 18 + Inertia.js
* Tailwind CSS
* Vite
* MySQL (or compatible SQL database)
* DomPDF

## Prerequisites

* PHP 8.2+
* Composer
* Node.js 18+ / npm
* MySQL or another supported database
* Git

## Setup

1. Clone the repository:

```bash
git clone https://github.com/Explore-Holdings/terminal-prime.git airport-counter-system
cd airport-counter-system
```

2. Install PHP dependencies:

```bash
composer install
```

3. Install frontend dependencies:

```bash
npm install
```

4. Copy the environment file and generate an application key:

```bash
copy .env.example .env
php artisan key:generate
```

5. Configure your database credentials in `.env`:

```env
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

6. Run database migrations:

```bash
php artisan migrate
```

7. Create the storage symlink:

```bash
php artisan storage:link
```

## Development

Start the application with Vite and Laravel development server:

```bash
npm run dev
```

Then open the local application URL shown in the terminal.

## Queue Worker

Process emails and other background jobs using:

```bash
php artisan queue:work
```

## Useful Commands

* `composer install` - install PHP dependencies
* `npm install` - install frontend dependencies
* `php artisan migrate` - run database migrations
* `php artisan storage:link` - link storage to public
* `npm run dev` - start Vite development server
* `npm run build` - build production assets
* `php artisan queue:work` - start queue worker

## Workflow

1. Customer arrives
2. Create customer record
3. Process payment
4. Generate invoice
5. Assign vehicle
6. Create trip
7. Driver status becomes `On Duty`
8. Agent approval completes the workflow

## Driver Status

* `Off Duty`
* `On Duty`

Only `On Duty` drivers can be assigned to new trips.
