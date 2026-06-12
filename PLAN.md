# Trip Mates — Project Plan

## UI Plan

### Screens / Pages

1. **Landing / Home Page**
   - Hero section with value proposition and call-to-action
   - Featured trips section (trending or upcoming trips)
   - How it works section (3-step explanation)
   - Footer with links

2. **Sign Up / Login Page**
   - Email and password authentication
   - Social login option (Google)
   - Simple form with clear error messages

3. **Profile Setup Page**
   - Multi-step form: personal info, family details, travel preferences, availability
   - Photo upload for profile picture
   - Save and continue flow

4. **Dashboard / Feed Page**
   - Trip discovery feed with cards showing trip details
   - Filter bar (destination, dates, group type, budget)
   - Sort options (newest, upcoming, popular)
   - Pagination or infinite scroll

5. **Trip Detail Page**
   - Full trip information: description, destination, dates, budget, group needs
   - Posted by info with user profile link
   - Interested button to express interest
   - Comments section for questions
   - Match compatibility score display

6. **Post a Trip Page**
   - Form to create a new trip: destination, dates, budget, description, group needs
   - Date picker for trip dates
   - Group composition selector (couples, families with kids, solo)
   - Activity preferences checkboxes

7. **Messaging / Chat Page**
   - List of conversations (trip threads and direct messages)
   - Chat interface with message history
   - User profiles accessible within chat
   - Trip-specific thread grouping

8. **User Profile Page**
   - View other users' public profiles
   - Trip history, travel style badges
   - Interested in / Posted trips section
   - Contact / message button

### Key Components

- **TripCard** — Reusable card component for displaying trip previews
- **FilterBar** — Search and filter controls for the feed
- **ProfileForm** — Multi-step form for profile creation
- **TripForm** — Form for posting new trips
- **ChatBubble** — Message display component
- **AvailabilityCalendar** — Visual calendar for availability
- **MatchScore** — Compatibility indicator component

### User Flows

1. **New User Journey**: Landing → Sign Up → Profile Setup → Dashboard → Browse Trips → Express Interest → Chat
2. **Trip Poster Flow**: Sign In → Dashboard → Post a Trip → Fill Form → Publish → Receive Interest → Chat with Interested Users
3. **Matching Flow**: Browse Feed → Filter Results → View Trip Details → Express Interest → Mutual Interest → Start Chat

### Wireframe Notes

- Mobile-first responsive design
- Top navigation bar with logo, search, notifications, and profile menu
- Feed uses card-based layout with prominent destination imagery
- Primary action buttons: "Post a Trip", "Get Started"
- Color scheme: warm, inviting tones (blues, oranges, whites)

## Tech Plan

### Stack Choice

- **Frontend**: React 18 + Vite 5 — Fast, modern, excellent developer experience
- **Styling**: Tailwind CSS 3.4 — Utility-first, rapid prototyping, consistent design
- **Backend**: Node.js 20 + Express 4 — Familiar ecosystem, fast development
- **Database**: PostgreSQL 15 — Relational data, robust, excellent for structured queries
- **ORM**: Prisma 5 — Type-safe database queries, easy migrations
- **Authentication**: JWT-based auth with bcrypt — Simple, secure, no external dependencies
- **State Management**: React Context + useReducer — Lightweight, sufficient for v1
- **Forms**: React Hook Form 7 — Performant form handling
- **Validation**: Zod 5 — Type-safe schema validation

### Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   React Frontend │◄───────►│   Node Backend   │◄───────►│ PostgreSQL  │
│   (SPA)          │  HTTP   │   (Express API)  │  SQL    │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
```

- RESTful API architecture
- Stateless backend with JWT authentication
- Database schema with relationships for users, trips, interests, messages
- Clean separation between frontend and backend concerns

### Directory Structure

```
trip-mates/
├── PRD.md
├── PLAN.md
├── package.json
├── .env.example
├── .gitignore
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Trip.js
│   │   │   ├── Interest.js
│   │   │   └── Message.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── trips.js
│   │   │   └── messages.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── tripController.js
│   │   │   └── messageController.js
│   │   └── utils/
│   │       └── helpers.js
│   └── prisma/
│       └── schema.prisma
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── styles/
│       │   └── globals.css
│       ├── components/
│       │   ├── TripCard.js
│       │   ├── FilterBar.js
│       │   ├── ProfileForm.js
│       │   ├── TripForm.js
│       │   ├── ChatBubble.js
│       │   ├── AvailabilityCalendar.js
│       │   ├── MatchScore.js
│       │   └── Navbar.js
│       ├── pages/
│       │   ├── Landing.js
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   ├── Dashboard.js
│       │   ├── TripDetail.js
│       │   ├── PostTrip.js
│       │   ├── Chat.js
│       │   └── Profile.js
│       ├── context/
│       │   └── AuthContext.js
│       ├── services/
│       │   ├── api.js
│       │   └── auth.js
│       └── utils/
│           └── helpers.js
└── shared/
    └── constants.js
```

### Key Dependencies with Versions

**Server:**
- express: ^4.18.2
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.2
- cors: ^2.8.5
- dotenv: ^16.3.1
- prisma: ^5.4.2
- @prisma/client: ^5.4.2

**Client:**
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.0
- react-hook-form: ^7.48.2
- zod: ^5.0.0
- axios: ^1.6.2
- tailwindcss: ^3.4.0
- postcss: ^8.4.32
- autoprefixer: ^10.4.16
