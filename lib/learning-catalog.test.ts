import type { Curriculum } from "@/data/curriculum";
import { describe, expect, it } from "vitest";
import {
  findCourseRecord,
  findLessonRecord,
  getAssignments,
  getCourseRecords,
  getLessonRecords,
} from "./learning-catalog";

const curriculum: Curriculum = {
  productTitle: "Test",
  productVision: "Test vision",
  promise: "Test promise",
  phases: [
    {
      id: "phase-1",
      title: "Phase 1",
      strapline: "Start",
      purpose: "Purpose",
      level: "Beginner",
      duration: "2 weeks",
      environment: "Sandbox",
      tools: ["Terminal"],
      guardrails: ["Safe"],
      milestones: ["M1"],
      projects: ["P1"],
      courses: [
        {
          id: "course-1",
          title: "Course 1",
          focus: "Focus 1",
          outcome: "Outcome 1",
          lessons: [
            {
              id: "lesson-1",
              title: "Lesson 1",
              summary: "Summary 1",
              duration: "15 min",
              difficulty: "Easy",
              objective: "Objective 1",
              explanation: ["Concept 1"],
              demonstration: ["Demo 1"],
              exerciseSteps: ["Step 1"],
              validationChecks: ["Check 1"],
              retention: ["Cue 1"],
              tools: ["Terminal"],
              notesPrompt: "Write notes",
              exercises: [],
            },
            {
              id: "lesson-2",
              title: "Lesson 2",
              summary: "Summary 2",
              duration: "20 min",
              difficulty: "Easy",
              objective: "Objective 2",
              explanation: ["Concept 2"],
              demonstration: ["Demo 2"],
              exerciseSteps: ["Step 2"],
              validationChecks: ["Check 2"],
              retention: ["Cue 2"],
              tools: ["Terminal"],
              notesPrompt: "Write notes",
              exercises: [],
              transferTask: {
                id: "transfer-1",
                title: "Transfer 1",
                prompt: "Apply it",
                placeholder: "",
                validationMode: "includes" as const,
                acceptedAnswers: ["answer"],
                successMessage: "Good",
                hint: "Hint",
              },
            },
          ],
        },
      ],
    },
    {
      id: "phase-2",
      title: "Phase 2",
      strapline: "Build",
      purpose: "Purpose 2",
      level: "Intermediate",
      duration: "3 weeks",
      environment: "Sandbox",
      tools: ["Git"],
      guardrails: ["Safe"],
      milestones: ["M2"],
      projects: ["P2"],
      courses: [
        {
          id: "course-2",
          title: "Course 2",
          focus: "Focus 2",
          outcome: "Outcome 2",
          lessons: [
            {
              id: "lesson-3",
              title: "Lesson 3",
              summary: "Summary 3",
              duration: "30 min",
              difficulty: "Medium",
              objective: "Objective 3",
              explanation: ["Concept 3"],
              demonstration: ["Demo 3"],
              exerciseSteps: ["Step 3"],
              validationChecks: ["Check 3"],
              retention: ["Cue 3"],
              tools: ["Git"],
              notesPrompt: "Write notes",
              exercises: [],
            },
          ],
        },
      ],
    },
  ],
};

describe("getCourseRecords", () => {
  it("returns a flat list of course records with phase references", () => {
    const records = getCourseRecords(curriculum);
    expect(records).toHaveLength(2);
    expect(records[0].phase.id).toBe("phase-1");
    expect(records[0].course.id).toBe("course-1");
    expect(records[1].phase.id).toBe("phase-2");
    expect(records[1].course.id).toBe("course-2");
  });
});

describe("getLessonRecords", () => {
  it("returns a flat list of lesson records with phase and course references", () => {
    const records = getLessonRecords(curriculum);
    expect(records).toHaveLength(3);
    expect(records[0].lesson.id).toBe("lesson-1");
    expect(records[0].course.id).toBe("course-1");
    expect(records[0].phase.id).toBe("phase-1");
    expect(records[2].lesson.id).toBe("lesson-3");
    expect(records[2].phase.id).toBe("phase-2");
  });
});

describe("findCourseRecord", () => {
  it("returns the matching course record", () => {
    const record = findCourseRecord(curriculum, "course-2");
    expect(record).toBeDefined();
    expect(record!.course.title).toBe("Course 2");
    expect(record!.phase.id).toBe("phase-2");
  });

  it("returns undefined for unknown courseId", () => {
    expect(findCourseRecord(curriculum, "nonexistent")).toBeUndefined();
  });
});

describe("findLessonRecord", () => {
  it("returns the matching lesson record", () => {
    const record = findLessonRecord(curriculum, "lesson-2");
    expect(record).toBeDefined();
    expect(record!.lesson.title).toBe("Lesson 2");
    expect(record!.course.id).toBe("course-1");
    expect(record!.phase.id).toBe("phase-1");
  });

  it("returns undefined for unknown lessonId", () => {
    expect(findLessonRecord(curriculum, "nonexistent")).toBeUndefined();
  });
});

describe("getAssignments", () => {
  it("returns assignment records from lessons with transfer tasks", () => {
    const assignments = getAssignments(curriculum);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].id).toBe("transfer-1");
    expect(assignments[0].lessonId).toBe("lesson-2");
    expect(assignments[0].lessonTitle).toBe("Lesson 2");
    expect(assignments[0].courseTitle).toBe("Course 1");
    expect(assignments[0].phaseTitle).toBe("Phase 1");
    expect(assignments[0].title).toBe("Transfer 1");
    expect(assignments[0].prompt).toBe("Apply it");
  });

  it("returns empty array when no lessons have transfer tasks", () => {
    const noTransfer: Curriculum = {
      ...curriculum,
      phases: [
        {
          ...curriculum.phases[0],
          courses: [
            {
              ...curriculum.phases[0].courses[0],
              lessons: [curriculum.phases[0].courses[0].lessons[0]],
            },
          ],
        },
      ],
    };
    expect(getAssignments(noTransfer)).toHaveLength(0);
  });
});
