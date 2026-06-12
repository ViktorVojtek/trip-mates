export interface User {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  profilePicture: string | null;
  familySize: number;
  childrenAges: string | null;
  travelPreferences: string | null;
  availability: string | null;
  createdAt: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  groupType: string;
  activityPref: string | null;
  budget: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripInterest {
  id: string;
  tripId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  user?: User;
}

export interface Message {
  id: string;
  content: string;
  tripId: string | null;
  receiverId: string;
  senderId: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  results: T[];
  meta: PaginationMeta;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  familySize: number;
  childrenAges?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UpdateProfileFormData {
  name: string;
  bio?: string;
  familySize: number;
  childrenAges?: string;
  travelPreferences?: string;
  availability?: string;
  profilePicture?: string;
}

export interface TripFormData {
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  groupType: string;
  activityPref?: string;
  budget: number;
}

export interface TripFilters {
  destination?: string;
  groupType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  createdById?: string;
}
