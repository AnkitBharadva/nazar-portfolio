/**
 * Real images from the projects' own repos — nothing stock, nothing
 * generated, nothing guessed. Only two repos carry genuine result figures
 * that are also valid image files:
 *
 * - SSIP25: the README embeds assets/val_batch0_pred.jpg ("Validation
 *   Batch 0 Predictions"). Its confusion-matrix PNGs are corrupt in the
 *   repo (bytes missing from the file headers), so they are deliberately
 *   NOT used.
 * - RWIS: TRAINING_DETAILS.md documents val_batch*_pred.jpg as
 *   "Validation predictions" for the wagon detector.
 *
 * Everything else found in the audit repos is site decoration or template
 * stock (AutoRikshaw's Ahmedabad photos, folio's template imagery,
 * OdooGF's demo photos, GPHacakthon26's hero/background, Venu's texture
 * masks) — none of it is a screenshot of the project, so no other project
 * gets a screenshot section at all.
 */

export interface RepoScreenshot {
  src: string;
  caption: string;
  width: number;
  height: number;
}

const PROJECT_SCREENSHOTS: Record<string, RepoScreenshot[]> = {
  ssip25: [
    {
      src: "/screenshots/ssip25/val-batch0-pred.jpg",
      caption:
        "Validation Batch 0 Predictions — YOLOv8 detections on site imagery, as embedded in the repo README.",
      width: 1200,
      height: 1200,
    },
  ],
  rwis: [
    {
      src: "/screenshots/rwis/wagon-val-batch0-pred.jpg",
      caption:
        "Validation predictions — wagon detector (documented in TRAINING_DETAILS.md).",
      width: 1200,
      height: 692,
    },
  ],
};

export function getScreenshots(projectId: string): RepoScreenshot[] {
  return PROJECT_SCREENSHOTS[projectId] ?? [];
}
