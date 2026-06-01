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
  tutorId?: string | null;
  category: Category;
  createdBy: {
    id: string;
    name: string;
    image?: string | null;
    role: UserRole;
  };
  tutor?: {
    id: string;
    name: string;
    image?: string | null;
    role?: UserRole;
    status?: UserStatus;
    tutorProfile?: {
      id: string;
    } | null;
  } | null;
  createdAt: string;
  updatedAt?: string;
  deleteRequests?: {
    id: string;
    requesterId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
  }[];
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
    assignedCourses?: Course[];
  };
  courses?: Course[];
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
export type PaymentStatus = "INITIATED" | "PAID" | "FAILED" | "CANCELLED";
export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "SESSION_COMPLETED"
  | "NEW_REVIEW"
  | "COURSE_ASSIGNED"
  | "COURSE_DELETE_REQUEST"
  | "COURSE_DELETE_APPROVED"
  | "COURSE_DELETE_REJECTED"
  | "TUTOR_REQUEST_APPROVED"
  | "TUTOR_REQUEST_REJECTED"
  | "SYSTEM";

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  courseId?: string | null;
  dateTime: string; // ISO datetime string from API
  status: BookingStatus;
  createdAt: string;
  course?: Course | null;
  tutor?: Mentor;
  student?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  payment?: {
    id: string;
    bookingId?: string | null;
    status: PaymentStatus;
    gateway: string;
    amount: number;
    currency: string;
    transactionId: string;
    createdAt: string;
  } | null;
  review?: unknown;
}

export interface PaymentHistoryItem {
  id: string;
  transactionId: string;
  gateway: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  studentId: string;
  tutorId: string;
  courseId: string;
  bookingId?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  tutor?: {
    id: string;
    user?: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  } | null;
  course?: (Course & {
    category?: {
      id: string;
      name: string;
    };
  }) | null;
  booking?: {
    id: string;
    status: BookingStatus;
    dateTime: string;
  } | null;
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  certificateNo: string;
  issuedAt: string;
  createdAt?: string;
  updatedAt?: string;
  student?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  course?: Course & {
    tutor?: {
      id: string;
      name: string;
      email?: string;
      image?: string | null;
    } | null;
    category?: {
      id: string;
      name: string;
    };
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  entityId?: string | null;
  createdAt: string;
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
