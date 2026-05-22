# SkillBridge Client

Frontend for the Assignment 4 SkillBridge full-stack project.

## Live Links

- Frontend: add your deployed frontend URL here
- Backend: add your deployed backend URL here
- Video walkthrough: add your video URL here
- Frontend repository: add your frontend GitHub URL here
- Backend repository: add your backend GitHub URL here

## Admin Credentials

- Email: `admin@skillbridge.com`
- Password: `admin1234`

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

- Student: browse tutors, book sessions, view bookings, leave reviews, manage profile.
- Tutor: manage profile, set availability, view sessions, mark sessions completed, manage reviews.
- Admin: manage users, ban/unban users, approve tutors, view bookings, manage categories and courses.

## Payment Rule

No online payment integration is used. Bookings follow the no-online-payment / Cash on Delivery requirement.
