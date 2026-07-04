export type Role = "finder" | "giver";

export type VerificationLevel = "unverified" | "phone" | "id";

export interface Session {
  name: string;
  email: string;
  activeRole: Role | null;
  roles: Role[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  wageRange: string;
}

export type PayType = "hourly" | "daily" | "fixed" | "monthly";
export type Frequency = "one-time" | "recurring" | "full-time";
export type JobStatus = "open" | "filled" | "closed";

export interface Job {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  location: string;
  payType: PayType;
  payAmount: string;
  frequency: Frequency;
  urgent: boolean;
  verifiedOnly: boolean;
  postedBy: string;
  postedByName: string;
  postedAt: string;
  status: JobStatus;
}

export type ApplicationStatus = "applied" | "viewed" | "shortlisted" | "declined" | "hired" | "closed";

export interface Application {
  id: string;
  jobId: string;
  applicantName: string;
  appliedAt: string;
  status: ApplicationStatus;
}

export interface ApplicantView {
  applicationId: string;
  name: string;
  email: string;
  experienceYears: number;
  rating: number;
  ratingCount: number;
  verification: VerificationLevel;
  appliedAt: string;
  status: ApplicationStatus;
}

export interface WorkerProfile {
  name: string;
  skills: string[];
  experienceYears: number;
  availableNow: boolean;
  verification: VerificationLevel;
  rating: number;
  ratingCount: number;
  bio: string;
}

export interface GiverProfile {
  name: string;
  location: string;
  verification: VerificationLevel;
  rating: number;
  ratingCount: number;
}
