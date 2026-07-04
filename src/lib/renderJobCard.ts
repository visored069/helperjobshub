import { getCategory } from "./categories";
import { isJobSaved, toggleSavedJob } from "./store";
import type { Job } from "./types";

const mapPinSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-mute shrink-0" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const bookmarkSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`;

/**
 * Every job listing view merges seed data with locally-saved (user-posted)
 * jobs, so cards are always built client-side rather than pre-rendered by an
 * Astro component. This is the single template all finder-facing listing
 * pages (browse, dashboard) render from.
 */
export function createJobCardElement(job: Job, opts: { href: string; showSave?: boolean }): HTMLElement {
  const { href, showSave = true } = opts;
  const category = getCategory(job.categoryId);

  const article = document.createElement("article");
  article.className =
    "group relative flex flex-col gap-3 rounded-md border border-hairline bg-canvas p-5 shadow-card transition-colors hover:border-hairline-strong";
  article.dataset.jobCard = "true";
  article.dataset.jobId = job.id;
  article.dataset.category = job.categoryId;
  article.dataset.payType = job.payType;

  const topRow = document.createElement("div");
  topRow.className = "flex items-start justify-between gap-3";

  const categoryLabel = document.createElement("span");
  categoryLabel.className = "text-caption text-mute";
  categoryLabel.textContent = category?.label ?? "";
  topRow.appendChild(categoryLabel);

  if (job.urgent) {
    const badge = document.createElement("span");
    badge.className = "inline-flex items-center rounded-full bg-warning-soft px-2 py-0.5 text-caption text-warning-deep";
    badge.textContent = "Urgent";
    topRow.appendChild(badge);
  }
  article.appendChild(topRow);

  const titleLink = document.createElement("a");
  titleLink.href = href;
  titleLink.className = "focus-ring text-body-lg font-medium text-ink hover:text-link";
  titleLink.textContent = job.title;
  article.appendChild(titleLink);

  const desc = document.createElement("p");
  desc.className = "line-clamp-2 text-body-sm text-body";
  desc.textContent = job.description;
  article.appendChild(desc);

  const metaRow = document.createElement("div");
  metaRow.className = "mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-body";
  metaRow.innerHTML = `<span class="inline-flex items-center gap-1">${mapPinSvg}</span>`;
  (metaRow.querySelector("span") as HTMLElement).append(document.createTextNode(job.location));
  const payEl = document.createElement("span");
  payEl.className = "font-medium text-ink";
  payEl.textContent = job.payAmount;
  metaRow.appendChild(payEl);
  article.appendChild(metaRow);

  const bottomRow = document.createElement("div");
  bottomRow.className = "mt-1 flex items-center justify-between border-t border-hairline pt-3";
  const postedBy = document.createElement("span");
  postedBy.className = "text-caption text-mute";
  postedBy.textContent = `Posted by ${job.postedBy}`;
  bottomRow.appendChild(postedBy);

  if (showSave) {
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.setAttribute("aria-label", "Save job");
    saveBtn.className = "focus-ring rounded-full p-1.5 text-mute hover:bg-canvas-soft-2 hover:text-ink";
    saveBtn.innerHTML = bookmarkSvg;
    const reflectSaved = () => saveBtn.classList.toggle("text-ink", isJobSaved(job.id));
    reflectSaved();
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleSavedJob(job.id);
      reflectSaved();
    });
    bottomRow.appendChild(saveBtn);
  }
  article.appendChild(bottomRow);

  return article;
}
