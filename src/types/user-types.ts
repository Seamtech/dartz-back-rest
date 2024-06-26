import { UserProfile } from "@loopback/security/dist/types";

export interface CustomUserProfile extends UserProfile {
    username: string;
    email: string;
    role: string;
    profileId: number;
  }