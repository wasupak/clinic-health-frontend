# Clinic Health Care Web App

React + TypeScript frontend for the Clinic Health Care portfolio project. It provides a patient list, patient detail view, vital-record entry, export preview, and dashboard charts.

This repository is a portfolio/demo project. It displays synthetic development data from the backend and does not provide authentication. Do not connect it to real patient data without adding the required access controls and privacy/security measures.

## Features

- Patient search, pagination, create, edit, and soft-delete
- Doctor and diagnosis fields
- Patient vital-record history
- Vital-record form with date and numeric validation
- Dashboard with vital coverage and recording-frequency charts
- Patient summary image export
- Responsive clinic-oriented UI

## Tech stack

- React 19
- TypeScript
- Vite
- React Router
- Recharts
- React DatePicker
- Font Awesome

## Requirements

- Node.js 20+
- pnpm
- The clinic-health-backend running on `http://localhost:3000`

## Local setup

Install dependencies:

```bash
pnpm install
```

Start the backend first, then start the frontend:

```bash
pnpm dev
```

The Vite development server proxies `/api` requests to `http://localhost:3000`.

Open the URL shown by Vite, usually `http://localhost:5173`.

## Build and checks

```bash
pnpm lint
pnpm build
pnpm preview
```

## Main routes

| Route | Description |
| --- | --- |
| `/dashboard` | Dashboard metrics and charts |
| `/patients` | Active patient list |
| `/patients/:patientHn` | Patient details and vital records |

## Backend connection

The frontend calls relative `/api` routes. During local development, `vite.config.ts` proxies those requests to the backend at `http://localhost:3000`.

For a production deployment, configure the frontend and backend behind the same origin, or replace the development proxy with an explicit API base URL appropriate for the hosting environment.

## Authentication and production use

Authentication is intentionally omitted from this initial version so the project can be cloned and demonstrated immediately. The API and UI should therefore be considered local/demo software. Before using real patient data, add authentication, authorization/roles, secure transport, audit logging, error monitoring, and appropriate privacy controls.

## Data and licensing notes

The backend seed contains synthetic sample data only. Production data belongs in a separately managed PostgreSQL database and must never be committed to this repository.
