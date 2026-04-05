// Typed API client — thin fetch wrapper for all persistence routes.
// Returns typed data or null on error (never throws).

// --- Progress ---

export type ProgressRecord = {
  lessonId: string;
  step: number;
  completed: boolean;
  notes: string | null;
  reflection: string | null;
};

export async function fetchProgress(): Promise<Record<
  string,
  { step: number; completed: boolean; notes?: string; reflection?: string }
> | null> {
  try {
    const res = await fetch("/api/progress");
    if (!res.ok) return null;
    const data = (await res.json()) as { progress: ProgressRecord[] };
    const map: Record<
      string,
      { step: number; completed: boolean; notes?: string; reflection?: string }
    > = {};
    for (const p of data.progress) {
      map[p.lessonId] = {
        step: p.step,
        completed: p.completed,
        ...(p.notes ? { notes: p.notes } : {}),
        ...(p.reflection ? { reflection: p.reflection } : {}),
      };
    }
    return map;
  } catch {
    return null;
  }
}

export async function upsertProgress(data: {
  lessonId: string;
  step?: number;
  completed?: boolean;
  notes?: string;
  reflection?: string;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- Competencies ---

export type CompetencyRecord = {
  domain: string;
  level: number;
};

export async function fetchCompetencies(): Promise<CompetencyRecord[] | null> {
  try {
    const res = await fetch("/api/competencies");
    if (!res.ok) return null;
    const data = (await res.json()) as { competencies: CompetencyRecord[] };
    return data.competencies;
  } catch {
    return null;
  }
}

export async function upsertCompetency(data: {
  domain: string;
  level: number;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/competencies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- Lab attempts ---

export type LabAttemptRecord = {
  lessonId: string;
  templateId: string;
  attempt: number;
  passed: boolean;
};

export async function fetchLabAttempts(
  lessonId?: string,
): Promise<LabAttemptRecord[] | null> {
  try {
    const url = lessonId
      ? `/api/lab-attempts?lessonId=${encodeURIComponent(lessonId)}`
      : "/api/lab-attempts";
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { attempts: LabAttemptRecord[] };
    return data.attempts;
  } catch {
    return null;
  }
}

export async function recordLabAttempt(data: {
  lessonId: string;
  templateId: string;
  attempt: number;
  files: Record<string, string>;
  passed: boolean;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/lab-attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- Submissions ---

export type SubmissionRecord = {
  id: string;
  lessonId: string;
  content: string;
  status: string;
};

export async function fetchSubmissions(): Promise<SubmissionRecord[] | null> {
  try {
    const res = await fetch("/api/submissions");
    if (!res.ok) return null;
    const data = (await res.json()) as { submissions: SubmissionRecord[] };
    return data.submissions;
  } catch {
    return null;
  }
}

export async function createSubmission(data: {
  lessonId: string;
  content: string;
}): Promise<{ id: string } | null> {
  try {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const result = (await res.json()) as { submission: { id: string } };
    return { id: result.submission.id };
  } catch {
    return null;
  }
}
