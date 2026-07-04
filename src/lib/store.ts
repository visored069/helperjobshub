import type {
  Application,
  ApplicationStatus,
  GiverProfile,
  Job,
  Role,
  Session,
  VerificationLevel,
  WorkerProfile,
} from "./types";
import { sampleJobs } from "./sampleJobs";

/**
 * v1 prototype "backend": everything lives in localStorage. This file is the
 * single seam to replace with real API calls later — callers never touch
 * localStorage directly.
 */

const KEYS = {
  session: "hjh_session",
  users: "hjh_users",
  jobs: "hjh_jobs",
  applications: "hjh_applications",
  savedJobs: "hjh_saved_jobs",
  workerProfile: "hjh_worker_profile",
  giverProfile: "hjh_giver_profile",
  applicantDecisions: "hjh_applicant_decisions",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Accounts & session ----

interface StoredUser {
  name: string;
  email: string;
  password: string;
  roles: Role[];
}

export function signUp(name: string, email: string, password: string): { ok: true } | { ok: false; error: string } {
  const users = read<Record<string, StoredUser>>(KEYS.users, {});
  const key = email.trim().toLowerCase();
  if (users[key]) {
    return { ok: false, error: "An account with this email already exists. Try logging in instead." };
  }
  users[key] = { name: name.trim(), email: key, password, roles: [] };
  write(KEYS.users, users);
  setSession({ name: name.trim(), email: key, activeRole: null, roles: [] });
  return { ok: true };
}

export function logIn(email: string, password: string): { ok: true } | { ok: false; error: string } {
  const users = read<Record<string, StoredUser>>(KEYS.users, {});
  const key = email.trim().toLowerCase();
  const user = users[key];
  if (!user || user.password !== password) {
    return { ok: false, error: "We couldn't find a matching account. Check your email and password." };
  }
  setSession({ name: user.name, email: user.email, activeRole: user.roles[0] ?? null, roles: user.roles });
  return { ok: true };
}

export function logOut(): void {
  localStorage.removeItem(KEYS.session);
}

export function getSession(): Session | null {
  return read<Session | null>(KEYS.session, null);
}

function setSession(session: Session): void {
  write(KEYS.session, session);
}

export function setActiveRole(role: Role): void {
  const session = getSession();
  if (!session) return;
  const roles = session.roles.includes(role) ? session.roles : [...session.roles, role];
  const updated: Session = { ...session, activeRole: role, roles };
  setSession(updated);

  const users = read<Record<string, StoredUser>>(KEYS.users, {});
  const stored = users[session.email];
  if (stored) {
    stored.roles = roles;
    write(KEYS.users, users);
  }
}

/**
 * Prototype-level route gating: no server session, so this just redirects
 * client-side. Call at the top of a protected page's inline script.
 */
export function requireSession(requiredRole?: Role): Session | null {
  const session = getSession();
  if (!session) {
    window.location.href = "/login";
    return null;
  }
  if (requiredRole && session.activeRole !== requiredRole) {
    if (!session.roles.includes(requiredRole)) {
      window.location.href = "/select-role";
      return null;
    }
    setActiveRole(requiredRole);
  }
  return getSession();
}

// ---- Jobs ----

export function getJobs(): Job[] {
  const posted = read<Job[]>(KEYS.jobs, []);
  return [...posted, ...sampleJobs].sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));
}

export function getJob(jobId: string): Job | undefined {
  return getJobs().find((j) => j.id === jobId);
}

export function getJobsPostedBy(email: string): Job[] {
  return read<Job[]>(KEYS.jobs, []).filter((j) => j.postedBy === email);
}

export function saveJob(job: Omit<Job, "id" | "postedAt" | "status" | "seed">): Job {
  const posted = read<Job[]>(KEYS.jobs, []);
  const newJob: Job = {
    ...job,
    id: id("job"),
    postedAt: new Date().toISOString().slice(0, 10),
    status: "open",
  };
  posted.unshift(newJob);
  write(KEYS.jobs, posted);
  return newJob;
}

export function updateJobStatus(jobId: string, status: Job["status"]): void {
  const posted = read<Job[]>(KEYS.jobs, []);
  const next = posted.map((j) => (j.id === jobId ? { ...j, status } : j));
  write(KEYS.jobs, next);
}

// ---- Applications ----

export function getMyApplications(applicantEmail: string): Application[] {
  return read<Application[]>(KEYS.applications, []).filter((a) => a.applicantName === applicantEmail);
}

export function hasApplied(jobId: string, applicantEmail: string): boolean {
  return read<Application[]>(KEYS.applications, []).some((a) => a.jobId === jobId && a.applicantName === applicantEmail);
}

export function applyToJob(jobId: string, applicantEmail: string): Application {
  const applications = read<Application[]>(KEYS.applications, []);
  const newApplication: Application = {
    id: id("app"),
    jobId,
    applicantName: applicantEmail,
    appliedAt: new Date().toISOString().slice(0, 10),
    status: "applied",
  };
  applications.unshift(newApplication);
  write(KEYS.applications, applications);
  return newApplication;
}

export function setApplicationStatus(applicationId: string, status: ApplicationStatus): void {
  const applications = read<Application[]>(KEYS.applications, []);
  const next = applications.map((a) => (a.id === applicationId ? { ...a, status } : a));
  write(KEYS.applications, next);
}

/**
 * Deterministic mock applicants for a given job, so a Job Giver's
 * "view applicants" page has realistic content in this frontend-only
 * prototype (there usually isn't a second real browser applying).
 */
export function getMockApplicantsForJob(jobId: string): Array<{
  name: string;
  experienceYears: number;
  rating: number;
  verification: VerificationLevel;
  appliedAt: string;
}> {
  const pool = [
    { name: "Sunita Devi", experienceYears: 4, rating: 4.8, verification: "id" as const },
    { name: "Ramesh Kumar", experienceYears: 2, rating: 4.3, verification: "phone" as const },
    { name: "Fatima Sheikh", experienceYears: 6, rating: 4.9, verification: "id" as const },
    { name: "Arjun Yadav", experienceYears: 1, rating: 4.0, verification: "unverified" as const },
    { name: "Geeta Bai", experienceYears: 8, rating: 5.0, verification: "id" as const },
  ];
  let hash = 0;
  for (let i = 0; i < jobId.length; i++) hash = (hash * 31 + jobId.charCodeAt(i)) >>> 0;
  const count = 2 + (hash % 3);
  const start = hash % pool.length;
  return Array.from({ length: count }, (_, i) => ({
    ...pool[(start + i) % pool.length],
    appliedAt: new Date(Date.now() - ((hash + i * 7) % 5) * 86400000).toISOString().slice(0, 10),
  }));
}

export type ApplicantDecision = "pending" | "shortlisted" | "declined";

export function getApplicantDecision(jobId: string, applicantName: string): ApplicantDecision {
  const decisions = read<Record<string, ApplicantDecision>>(KEYS.applicantDecisions, {});
  return decisions[`${jobId}::${applicantName}`] ?? "pending";
}

export function setApplicantDecision(jobId: string, applicantName: string, decision: ApplicantDecision): void {
  const decisions = read<Record<string, ApplicantDecision>>(KEYS.applicantDecisions, {});
  decisions[`${jobId}::${applicantName}`] = decision;
  write(KEYS.applicantDecisions, decisions);
}

// ---- Saved jobs ----

export function getSavedJobIds(): string[] {
  return read<string[]>(KEYS.savedJobs, []);
}

export function isJobSaved(jobId: string): boolean {
  return getSavedJobIds().includes(jobId);
}

export function toggleSavedJob(jobId: string): boolean {
  const saved = getSavedJobIds();
  const idx = saved.indexOf(jobId);
  if (idx >= 0) {
    saved.splice(idx, 1);
  } else {
    saved.push(jobId);
  }
  write(KEYS.savedJobs, saved);
  return saved.includes(jobId);
}

// ---- Profiles ----

const defaultWorkerProfile: WorkerProfile = {
  name: "",
  skills: [],
  experienceYears: 0,
  availableNow: false,
  verification: "unverified",
  rating: 0,
  ratingCount: 0,
  bio: "",
};

export function getWorkerProfile(): WorkerProfile {
  return read<WorkerProfile>(KEYS.workerProfile, defaultWorkerProfile);
}

export function saveWorkerProfile(profile: WorkerProfile): void {
  write(KEYS.workerProfile, profile);
}

const defaultGiverProfile: GiverProfile = {
  name: "",
  location: "",
  verification: "unverified",
  rating: 0,
  ratingCount: 0,
};

export function getGiverProfile(): GiverProfile {
  return read<GiverProfile>(KEYS.giverProfile, defaultGiverProfile);
}

export function saveGiverProfile(profile: GiverProfile): void {
  write(KEYS.giverProfile, profile);
}
