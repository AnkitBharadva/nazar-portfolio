import type { Project } from "./types";

/**
 * The two project tiers. Featured is an explicit flag; everything else
 * is the nazar collection — including forks, the empty repo and the
 * template-based portfolio, which stay labelled and credited on their
 * cards and case studies (the fork/empty/template flags are still in
 * the data, they just no longer form a separate tier).
 */

export function isFeatured(project: Project): boolean {
  return project.featured === true;
}

export function isCollection(project: Project): boolean {
  return !isFeatured(project);
}

/**
 * Whether the case study is veiled until the visitor removes the nazar:
 * only collection projects whose repo has no README. Featured projects
 * always open unsealed.
 */
export function isSealable(project: Project): boolean {
  return isCollection(project) && project.sealed;
}
