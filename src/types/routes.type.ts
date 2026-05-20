export interface Route {
  title: string;
  items: {
    title: string;
    url: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  isPopular: boolean;
  categoryId: string;
  category: Category;
  createdBy: {
    id: string;
    name: string;
    image?: string | null;
    role: UserRole;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Mentor {
  id: string;
  bio: string;
  subjects: string[];
  price: number;
  rating?: number;
  user: {
    id?: string;
    name: string;
    image?: string;
    email?: string;
  };
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 0–6 (Sunday–Saturday)
  day: string; // e.g. "Monday"
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  isBooked: boolean;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  dateTime: string; // ISO datetime string from API
  status: BookingStatus;
  createdAt: string;
  tutor?: Mentor;
  student?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  review?: unknown;
}

export interface Review {
  id: string;
  rating: number; // 1–5
  comment: string;
  isHidden?: boolean;
  createdAt: string;
  tutorId: string;
  studentId: string;
  // for GET /reviews/tutor/:id — student is nested under booking
  booking?: {
    student?: {
      id: string;
      name: string;
      image?: string;
    };
    tutor?: {
      user: {
        id: string;
        name: string;
        image?: string;
      };
    };
  };
}

export type UserRole = "STUDENT" | "TUTOR" | "ADMIN";

export type UserStatus = "ACTIVE" | "BANNED" | "PENDING" | "REJECTED";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  status?: UserStatus;
  createdAt?: string;
  tutorProfile?: {
    id: string;
    bio: string;
    subjects: string[];
    price: number;
  } | null;
}