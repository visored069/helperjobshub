import type { Application, GiverProfile, Job, WorkerProfile } from "./types";

interface JobRow {
  id: string;
  title: string;
  category_id: string;
  description: string;
  location: string;
  pay_type: string;
  pay_amount: string;
  frequency: string;
  urgent: number;
  verified_only: number;
  posted_by: string;
  posted_by_name: string;
  posted_at: string;
  status: string;
}

export function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    description: row.description,
    location: row.location,
    payType: row.pay_type as Job["payType"],
    payAmount: row.pay_amount,
    frequency: row.frequency as Job["frequency"],
    urgent: Boolean(row.urgent),
    verifiedOnly: Boolean(row.verified_only),
    postedBy: row.posted_by,
    postedByName: row.posted_by_name,
    postedAt: row.posted_at,
    status: row.status as Job["status"],
  };
}

interface ApplicationRow {
  id: string;
  job_id: string;
  applicant_email: string;
  applied_at: string;
  status: string;
}

export function rowToApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    jobId: row.job_id,
    applicantName: row.applicant_email,
    appliedAt: row.applied_at,
    status: row.status as Application["status"],
  };
}

interface WorkerProfileRow {
  name: string;
  skills: string;
  experience_years: number;
  available_now: number;
  verification: string;
  rating: number;
  rating_count: number;
  bio: string;
}

export function rowToWorkerProfile(row: WorkerProfileRow): WorkerProfile {
  return {
    name: row.name,
    skills: JSON.parse(row.skills),
    experienceYears: row.experience_years,
    availableNow: Boolean(row.available_now),
    verification: row.verification as WorkerProfile["verification"],
    rating: row.rating,
    ratingCount: row.rating_count,
    bio: row.bio,
  };
}

interface GiverProfileRow {
  name: string;
  location: string;
  verification: string;
  rating: number;
  rating_count: number;
}

export function rowToGiverProfile(row: GiverProfileRow): GiverProfile {
  return {
    name: row.name,
    location: row.location,
    verification: row.verification as GiverProfile["verification"],
    rating: row.rating,
    ratingCount: row.rating_count,
  };
}
