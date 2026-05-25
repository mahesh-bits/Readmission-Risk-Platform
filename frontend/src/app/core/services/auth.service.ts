import { Injectable } from '@angular/core';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _profile: UserProfile | null = null;

  setProfile(profile: UserProfile) { this._profile = profile; }

  logout() { this._profile = null; }

  isAuthenticated(): boolean        { return !!this._profile; }
  getRole(): string                 { return this._profile?.role ?? 'guest'; }
  getToken(): string | null         { return this._profile ? 'mock-jwt-token' : null; }
  getProfile(): UserProfile | null  { return this._profile; }
}
