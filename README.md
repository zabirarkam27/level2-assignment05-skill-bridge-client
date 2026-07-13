# MentorForge Client

Frontend for the Assignment 5 MentorForge full-stack project.

## Live Links

- [Frontend Live](https://skil-bridge-client-v2.vercel.app/)
- [Backend Live](https://skil-bridge-server-v2.vercel.app/)
- [Demo Video](https://drive.google.com/file/d/1Qr5mcDZUdXcF5d5FclAMQ_tz59Oao5Vq/view?usp=sharing)

## Repositories

- [Frontend Repository](https://github.com/zabirarkam27/level2-assignment05-skill-bridge-client)
- [Backend Repository](https://github.com/zabirarkam27/level2-assignment05-skill-bridge-server)

## Demo Credentials

### Admin

- Email: `admin@mentorforge.com`
- Password: `admin1234`

### Student

- Use the registration page to create a student account, or use Google login with an allowed account.

### Tutor

- Create a tutor account from registration, then approve it from the admin dashboard before testing tutor features.

Run the backend admin seed before testing these credentials.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Express API base URL.
- `NEXT_PUBLIC_AUTH_URL`: Better Auth server URL.
- `NEXT_PUBLIC_APP_URL`: frontend URL used as auth callback target.

## Features

- Student: browse tutors, pay before booking sessions, view bookings, leave reviews, manage profile.
- Tutor: manage profile, set availability, view sessions, mark sessions completed, manage reviews.
- Admin: manage users, ban/unban users, approve tutors, view bookings, manage categories and courses.

## Payment Flow

Students select a tutor, course, available slot, and date. The app then opens
Stripe Checkout. A booking is created only after successful payment, then the
tutor can confirm the paid pending session.
