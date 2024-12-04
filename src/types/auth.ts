export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'nurse';
}

export interface AuthState {
  currentUser: User | null;
  users: User[];
}