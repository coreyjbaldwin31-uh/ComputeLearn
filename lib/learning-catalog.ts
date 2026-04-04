import type { Course, Curriculum, Lesson, Phase } from "@/data/curriculum";

type CourseRecord = {
  phase: Phase;
  course: Course;
};

type LessonRecord = {
  phase: Phase;
  course: Course;
  lesson: Lesson;
};

export function getCourseRecords(curriculum: Curriculum): CourseRecord[] {
  return curriculum.phases.flatMap((phase) =>
    phase.courses.map((course) => ({ phase, course })),
  );
}

export function getLessonRecords(curriculum: Curriculum): LessonRecord[] {
  return curriculum.phases.flatMap((phase) =>
    phase.courses.flatMap((course) =>
      course.lessons.map((lesson) => ({ phase, course, lesson })),
    ),
  );
}

export function findCourseRecord(curriculum: Curriculum, courseId: string) {
  return getCourseRecords(curriculum).find((record) => record.course.id === courseId);
}

export function findLessonRecord(curriculum: Curriculum, lessonId: string) {
  return getLessonRecords(curriculum).find((record) => record.lesson.id === lessonId);
}

export function getAssignments(curriculum: Curriculum) {
  return getLessonRecords(curriculum).flatMap((record) => {
    const transfer = record.lesson.transferTask;
    if (!transfer) {
      return [];
    }

    return [
      {
        id: transfer.id,
        lessonId: record.lesson.id,
        lessonTitle: record.lesson.title,
        courseTitle: record.course.title,
        phaseTitle: record.phase.title,
        title: transfer.title,
        prompt: transfer.prompt,
      },
    ];
  });
}
