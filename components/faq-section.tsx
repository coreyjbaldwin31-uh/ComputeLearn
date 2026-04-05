"use client";

import { useState } from "react";
import styles from "./faq-section.module.css";

const FAQ_ITEMS = [
  {
    question: "Who is ComputeLearn designed for?",
    answer:
      "ComputeLearn is built for anyone entering software engineering — career switchers, bootcamp grads, self-taught developers, and CS students who want practical, hands-on training that mirrors real engineering workflows.",
  },
  {
    question: "What makes this different from video courses or tutorials?",
    answer:
      "Every lesson uses evidence-gated progression: you prove competency through exercises, transfer tasks, and lab validation before advancing. There are no passive videos — you learn by doing, and the platform verifies your understanding at every step.",
  },
  {
    question: "Do I need prior programming experience?",
    answer:
      "No. Phase 1 starts with computer fundamentals — how files, folders, and operating systems work. The curriculum is designed to build from zero to professional engineering workflows across four structured phases.",
  },
  {
    question: "How long does the full curriculum take?",
    answer:
      "Most learners complete all four phases in 8–12 weeks at 10–15 hours per week. Each lesson shows its estimated duration, and you can work at your own pace with full progress tracking.",
  },
  {
    question: "Can I export my work and progress?",
    answer:
      "Yes. Every note, reflection, code exercise, and lab artifact can be exported. Your competency evidence travels with you — useful for portfolios, interviews, and continued learning.",
  },
  {
    question: "Is there a subscription or recurring cost?",
    answer:
      "No subscriptions. You get full, permanent access to all four phases, every lab, and all future curriculum updates with a single purchase.",
  },
  {
    question: "What technologies does the curriculum cover?",
    answer:
      "The curriculum progresses from OS fundamentals through Git, HTML/CSS, JavaScript, HTTP, Docker, CI/CD pipelines, JSON configuration, and professional development workflows — all practiced in realistic, simulated environments.",
  },
  {
    question: "What if I get stuck on a lesson?",
    answer:
      "Each exercise includes progressive hints, inspection mode for detailed feedback, and reflection prompts to help you identify gaps. The competency engine also tracks weak areas and surfaces reinforcement exercises automatically.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={styles.faqSection}>
      <h2 className={styles.faqHeading}>Frequently asked questions</h2>
      <p className={styles.faqSubheading}>
        Everything you need to know before getting started.
      </p>
      <div className={styles.faqList}>
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`${styles.faqItem} ${isOpen ? styles.open : ""}`}
            >
              <h3 className={styles.faqQuestionHeading}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <span className={styles.faqIcon} aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div className={styles.faqAnswer} data-open={isOpen} role="region">
                <div className={styles.faqAnswerInner}>
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
