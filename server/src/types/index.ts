declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  familySize?: number;
  childrenAges?: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface UpdateProfileRequestBody {
  name?: string;
  bio?: string;
  familySize?: number;
  childrenAges?: string;
  travelPreferences?: string;
  availability?: string;
  profilePicture?: string;
}

export interface PaginatedResult<T> {
  results: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UserOutput {
  id: string;
  email: string;
  name: string;
  bio?: string | null;
  profilePicture?: string | null;
  familySize: number;
  childrenAges?: string | null;
  travelPreferences?: string | null;
  availability?: string | null;
  createdAt: Date;
}

export interface TripInput {
  title: string;
  description: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  groupType: string;
  activityPref?: string;
  budget: number;
}

export interface TripOutput extends TripInput {
  id: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageInput {
  content: string;
  tripId?: string;
  receiverId: string;
}

export interface MessageOutput extends MessageInput {
  id: string;
  senderId: string;
  createdAt: Date;
}
