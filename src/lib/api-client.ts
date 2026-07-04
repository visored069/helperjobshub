import type {
  ApplicantView,
  Application,
  ApplicationStatus,
  GiverProfile,
  Job,
  Role,
  Session,
  WorkerProfile,
} from "./types";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  return res.json() as Promise<T>;
}

// ---- Accounts & session ----

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  return api("/api/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) });
}

export async function logIn(
  email: string,
  password: string
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  return api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function logOut(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function getSession(): Promise<Session | null> {
  const data = await api<{ session: Session | null }>("/api/session");
  return data.session;
}

export async function setActiveRole(role: Role): Promise<Session | null> {
  const data = await api<{ session: Session }>("/api/role", { method: "POST", body: JSON.stringify({ role }) });
  return data.session;
}

/**
 * Server-backed route gating: redirects client-side when there's no session
 * (or the session lacks the required role). Call at the top of a protected
 * page's inline script.
 */
export async function requireSession(requiredRole?: Role): Promise<Session | null> {
  let session = await getSession();
  if (!session) {
    window.location.href = "/login";
    return null;
  }
  if (requiredRole && session.activeRole !== requiredRole) {
    if (!session.roles.includes(requiredRole)) {
      window.location.href = "/select-role";
      return null;
    }
    session = await setActiveRole(requiredRole);
  }
  return session;
}

// ---- Jobs ----

export async function getJobs(): Promise<Job[]> {
  const data = await api<{ jobs: Job[] }>("/api/jobs");
  return data.jobs;
}

export async function getJob(jobId: string): Promise<Job | undefined> {
  const data = await api<{ job: Job | null }>(`/api/jobs/${jobId}`);
  return data.job ?? undefined;
}

export async function getJobsPostedBy(): Promise<Job[]> {
  const data = await api<{ jobs: Job[] }>("/api/jobs/mine");
  return data.jobs;
}

export async function saveJob(
  job: Omit<Job, "id" | "postedAt" | "status" | "postedBy" | "postedByName">
): Promise<Job> {
  const data = await api<{ job: Job }>("/api/jobs", { method: "POST", body: JSON.stringify(job) });
  return data.job;
}

export async function updateJobStatus(jobId: string, status: Job["status"]): Promise<void> {
  await api(`/api/jobs/${jobId}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ---- Applications ----

export async function getMyApplications(): Promise<Application[]> {
  const data = await api<{ applications: Application[] }>("/api/applications/mine");
  return data.applications;
}

export async function hasApplied(jobId: string): Promise<boolean> {
  const data = await api<{ applied: boolean }>(`/api/applications/has-applied?jobId=${encodeURIComponent(jobId)}`);
  return data.applied;
}

export async function applyToJob(jobId: string): Promise<Application> {
  const data = await api<{ application: Application }>("/api/applications", {
    method: "POST",
    body: JSON.stringify({ jobId }),
  });
  return data.application;
}

export async function getApplicantsForJob(jobId: string): Promise<ApplicantView[]> {
  const data = await api<{ applicants: ApplicantView[] }>(`/api/jobs/${jobId}/applicants`);
  return data.applicants;
}

export async function setApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
  await api(`/api/applications/${applicationId}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ---- Saved jobs ----

export async function getSavedJobIds(): Promise<string[]> {
  const data = await api<{ jobIds: string[] }>("/api/saved-jobs");
  return data.jobIds;
}

export async function toggleSavedJob(jobId: string): Promise<boolean> {
  const data = await api<{ saved: boolean }>(`/api/saved-jobs/${jobId}/toggle`, { method: "POST" });
  return data.saved;
}

// ---- Profiles ----

export async function getWorkerProfile(): Promise<WorkerProfile> {
  const data = await api<{ profile: WorkerProfile }>("/api/profile/worker");
  return data.profile;
}

export async function saveWorkerProfile(profile: WorkerProfile): Promise<void> {
  await api("/api/profile/worker", { method: "POST", body: JSON.stringify(profile) });
}

export async function getGiverProfile(): Promise<GiverProfile> {
  const data = await api<{ profile: GiverProfile }>("/api/profile/giver");
  return data.profile;
}

export async function saveGiverProfile(profile: GiverProfile): Promise<void> {
  await api("/api/profile/giver", { method: "POST", body: JSON.stringify(profile) });
}
