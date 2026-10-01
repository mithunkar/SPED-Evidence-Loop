import {
  appendDemoSubmission,
  DEMO_DRAFT_STORAGE_KEY,
  DEMO_SUBMISSIONS_STORAGE_KEY,
  type DemoSubmission,
} from "@/demo/demo-storage";

export const DEMO_STORAGE_UNAVAILABLE = "__demo_storage_unavailable__";

const draftListeners = new Set<() => void>();
const submissionListeners = new Set<() => void>();

const emitDraftChange = () => {
  draftListeners.forEach((listener) => listener());
};

const emitSubmissionChange = () => {
  submissionListeners.forEach((listener) => listener());
};

export function subscribeToDemoDraft(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === DEMO_DRAFT_STORAGE_KEY) {
      listener();
    }
  };

  draftListeners.add(listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    draftListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getDemoDraftSnapshot() {
  try {
    return window.localStorage.getItem(DEMO_DRAFT_STORAGE_KEY);
  } catch {
    return DEMO_STORAGE_UNAVAILABLE;
  }
}

export function subscribeToDemoSubmissions(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === DEMO_SUBMISSIONS_STORAGE_KEY) {
      listener();
    }
  };

  submissionListeners.add(listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    submissionListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getDemoSubmissionsSnapshot() {
  try {
    return window.localStorage.getItem(DEMO_SUBMISSIONS_STORAGE_KEY);
  } catch {
    return DEMO_STORAGE_UNAVAILABLE;
  }
}

export function writeDemoDraftSnapshot(serialized: string) {
  try {
    window.localStorage.setItem(DEMO_DRAFT_STORAGE_KEY, serialized);
    emitDraftChange();
    return true;
  } catch {
    emitDraftChange();
    return false;
  }
}

export function storeDemoSubmission(submission: DemoSubmission) {
  try {
    const storedSubmissions = appendDemoSubmission(
      window.localStorage.getItem(DEMO_SUBMISSIONS_STORAGE_KEY),
      submission,
    );
    window.localStorage.setItem(
      DEMO_SUBMISSIONS_STORAGE_KEY,
      storedSubmissions,
    );
    window.localStorage.removeItem(DEMO_DRAFT_STORAGE_KEY);
    emitDraftChange();
    emitSubmissionChange();
    return true;
  } catch {
    return false;
  }
}

export function clearDemoDraft() {
  try {
    window.localStorage.removeItem(DEMO_DRAFT_STORAGE_KEY);
    emitDraftChange();
    return true;
  } catch {
    emitDraftChange();
    return false;
  }
}
