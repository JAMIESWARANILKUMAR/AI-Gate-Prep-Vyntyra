import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateAiText, generateAiJson } from "@/lib/ai-gateway";
import { getD1Database } from "@/lib/cloudflare-d1";
import { getAdminClient } from "@/integrations/supabase/admin";

export interface QuestionBreakdown {
  questionId: string;
  theoreticalConcept: string;
  stepByStepDerivation: string;
  commonTrapsAndPitfalls: string;
  verificationStatus: "ai_generated" | "sme_verified" | "sme_edited";
  verifiedBy?: string;
}

// 1. Fetch or Generate 3-Part AI Breakdown for a Question
export const getOrGenerateQuestionBreakdownFn = createServerFn({ method: "POST" })
  .validator((d: {
    questionId: string;
    questionText: string;
    questionType: string;
    options?: any;
    correctAnswer: string;
    subject?: string;
    branchCode?: string;
    forceRegenerate?: boolean;
  }) => d)
  .handler(async ({ data: input, context }): Promise<QuestionBreakdown> => {
    const db = getD1Database(context);

    // 1. Check D1 cache first
    if (db && !input.forceRegenerate) {
      try {
        const cached = await db
          .prepare("SELECT * FROM gate_question_breakdowns WHERE question_id = ?")
          .bind(input.questionId)
          .first<any>();

        if (cached && cached.theoretical_concept) {
          return {
            questionId: input.questionId,
            theoreticalConcept: cached.theoretical_concept,
            stepByStepDerivation: cached.step_by_step_derivation,
            commonTrapsAndPitfalls: cached.common_traps_and_pitfalls,
            verificationStatus: cached.verification_status || "ai_generated",
            verifiedBy: cached.verified_by_sme_id,
          };
        }
      } catch (err: any) {
        console.warn("[getOrGenerateQuestionBreakdownFn] D1 lookup skipped:", err.message);
      }
    }

    // 2. Generate via AI Gateway (Gemini primary with automatic OpenRouter fallback)
    const optionsText = Array.isArray(input.options)
      ? input.options.map((o: any, idx: number) => `(${o.id || String.fromCharCode(65 + idx)}) ${o.text || o}`).join("\n")
      : JSON.stringify(input.options || {});

    const systemPrompt = `You are an elite GATE (Graduate Aptitude Test in Engineering) Subject Matter Expert, IIT Professor, and Academic Author.
Your task is to produce an authoritative, crystal-clear 3-part pedagogical solution breakdown for an official GATE examination question.
You must return a valid JSON object matching the exact schema requested.`;

    const userPrompt = `=== GATE QUESTION DETAILS ===
Branch: ${input.branchCode || "Engineering"}
Subject: ${input.subject || "Core Engineering"}
Question Type: ${input.questionType.toUpperCase()} (MCQ / MSQ / NAT)
Question:
${input.questionText}

Options / Format:
${optionsText}

Verified Correct Answer:
${input.correctAnswer}

=== REQUIRED OUTPUT STRUCTURE (JSON ONLY) ===
{
  "theoreticalConcept": "Markdown text describing the fundamental mathematical/engineering theorem, governing equations, prerequisite formulas, and theoretical foundations.",
  "stepByStepDerivation": "Markdown text providing an exhaustive, rigorous, step-by-step mathematical proof or computational derivation reaching the exact verified answer.",
  "commonTrapsAndPitfalls": "Markdown text highlighting typical calculation pitfalls, sign errors, units confusion, edge cases, and decoy options that trip up candidates in the GATE exam."
}`;

    try {
      const res = await generateAiJson<{
        theoreticalConcept: string;
        stepByStepDerivation: string;
        commonTrapsAndPitfalls: string;
      }>({
        prompt: userPrompt,
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for high precision mathematics
      });

      const breakdownData = res.data;

      // 3. Cache into D1
      if (db && breakdownData) {
        try {
          await db.prepare(`
            INSERT INTO gate_question_breakdowns (
              question_id, theoretical_concept, step_by_step_derivation, common_traps_and_pitfalls, verification_status
            ) VALUES (?, ?, ?, ?, 'ai_generated')
            ON CONFLICT(question_id) DO UPDATE SET
              theoretical_concept = excluded.theoretical_concept,
              step_by_step_derivation = excluded.step_by_step_derivation,
              common_traps_and_pitfalls = excluded.common_traps_and_pitfalls,
              updated_at = CURRENT_TIMESTAMP
          `).bind(
            input.questionId,
            breakdownData.theoreticalConcept,
            breakdownData.stepByStepDerivation,
            breakdownData.commonTrapsAndPitfalls
          ).run();
        } catch (cacheErr: any) {
          console.warn("[getOrGenerateQuestionBreakdownFn] Failed to cache breakdown:", cacheErr.message);
        }
      }

      return {
        questionId: input.questionId,
        theoreticalConcept: breakdownData.theoreticalConcept,
        stepByStepDerivation: breakdownData.stepByStepDerivation,
        commonTrapsAndPitfalls: breakdownData.commonTrapsAndPitfalls,
        verificationStatus: "ai_generated",
      };
    } catch (aiErr: any) {
      console.error("[getOrGenerateQuestionBreakdownFn] AI call failed:", aiErr);
      return {
        questionId: input.questionId,
        theoreticalConcept: `### Core Concept\nThis problem evaluates fundamental principles in **${input.subject || "Engineering"}** under GATE standards. The verified answer is **${input.correctAnswer}**.`,
        stepByStepDerivation: `### Step-by-Step Derivation\n1. Analyze the given inputs.\n2. Apply the canonical formula for ${input.questionType.toUpperCase()} evaluation.\n3. Compute the result to obtain **${input.correctAnswer}**.`,
        commonTrapsAndPitfalls: `### Common Traps\nWatch out for standard calculation traps, negative marking in MCQs, and rounding limits in NAT questions.`,
        verificationStatus: "ai_generated",
      };
    }
  });

// 2. Contextual AI Doubt Solver (Scoped strictly to question context)
export const askContextualQuestionDoubtFn = createServerFn({ method: "POST" })
  .validator((d: {
    questionId: string;
    questionText: string;
    options?: any;
    correctAnswer: string;
    studentQuery: string;
    history?: Array<{ role: "student" | "ai"; content: string }>;
  }) => d)
  .handler(async ({ data: input, context }) => {
    const optionsText = Array.isArray(input.options)
      ? input.options.map((o: any, idx: number) => `(${o.id || String.fromCharCode(65 + idx)}) ${o.text || o}`).join("\n")
      : JSON.stringify(input.options || {});

    const systemInstruction = `You are a strict, pedagogical GATE Academic Mentor assisting an engineering student on a specific test question.
You are GROUNDED strictly in the following verified question context:
- Question: ${input.questionText}
- Options: ${optionsText}
- Verified Correct Answer: ${input.correctAnswer}

RULES:
1. NEVER contradict or change the verified answer key (${input.correctAnswer}). It is certified correct.
2. Answer the student's specific doubt concisely using clear mathematical derivation and standard engineering terminology.
3. If the student made a conceptual or calculation error, point out the exact step where their logic diverged.
4. Keep explanations crisp, high-contrast, formatted in clean Markdown without fluff.`;

    const chatContext = (input.history || [])
      .slice(-6)
      .map(m => `${m.role === "student" ? "Student" : "Mentor"}: ${m.content}`)
      .join("\n\n");

    const prompt = `${chatContext ? `=== PREVIOUS DISCUSSION ===\n${chatContext}\n\n` : ""}Student's Active Doubt:
"${input.studentQuery}"

Provide a direct, step-by-step mentor response explaining why the verified answer is correct and clarifying the student's doubt.`;

    const aiRes = await generateAiText({
      prompt,
      systemInstruction,
      temperature: 0.3,
      provider: "auto", // Gemini primary -> OpenRouter secondary failover
    });

    return {
      reply: aiRes.text,
      modelUsed: aiRes.model,
      didFailover: aiRes.didFailover,
    };
  });

// 3. Dynamic High-Score Roadmap Generator
export const generateHighScoreRoadmapFn = createServerFn({ method: "POST" })
  .validator((d: {
    studentId: string;
    branchCode: string;
    targetYear?: number;
    targetScore?: number;
    weakSubjects?: string[];
    strongSubjects?: string[];
    recentAccuracy?: number;
  }) => d)
  .handler(async ({ data: input, context }) => {
    const targetScore = input.targetScore || 75;
    const branch = input.branchCode || "CS";

    const prompt = `Generate a realistic, high-impact, week-by-week GATE Preparation Strategy for an engineering aspirant targeting a score of ${targetScore}+ in GATE ${input.targetYear || 2026} (${branch} Branch).

Aspirant Profile:
- Recent Diagnostic Accuracy: ${input.recentAccuracy ? `${input.recentAccuracy}%` : "Baseline (60%)"}
- Identified Weak Subjects: ${(input.weakSubjects || []).join(", ") || "Engineering Mathematics, Operating Systems"}
- Strong Subjects: ${(input.strongSubjects || []).join(", ") || "General Aptitude, Data Structures"}

Return a structured JSON with:
{
  "targetMilestone": "e.g., AIR Top 100 / Score 80+",
  "summary": "2-3 sentences strategic executive summary",
  "highYieldPrioritySubjects": ["Subject 1 (Weightage 12%)", "Subject 2 (Weightage 10%)"],
  "weeklyMilestones": [
    {
      "week": 1,
      "phase": "Foundation & Core Theory",
      "focusSubject": "Engineering Mathematics",
      "topics": ["Linear Algebra", "Calculus & Maxima-Minima"],
      "targetQuestionsPerDay": 25,
      "revisionStrategy": "Solve PYQs from 2015-2025"
    },
    {
      "week": 2,
      "phase": "Algorithm Rigor & Speed Drills",
      "focusSubject": "Algorithms & Data Structures",
      "topics": ["Dynamic Programming", "Graph Traversals (BFS/DFS)"],
      "targetQuestionsPerDay": 30,
      "revisionStrategy": "Timed sectional practice test"
    },
    {
      "week": 3,
      "phase": "System Architecture & Numerical Types",
      "focusSubject": "Operating Systems & Databases",
      "topics": ["Virtual Memory & Paging", "Normalization & Serializability"],
      "targetQuestionsPerDay": 35,
      "revisionStrategy": "Focus exclusively on NAT numerical question types"
    },
    {
      "week": 4,
      "phase": "Full-Length Mock & High-Pressure Simulation",
      "focusSubject": "All Subjects + General Aptitude",
      "topics": ["Full Mock Tests", "Error Log Analysis & Formula Revision"],
      "targetQuestionsPerDay": 65,
      "revisionStrategy": "Simulate 3-hour exam on official CBT interface"
    }
  ]
}`;

    try {
      const res = await generateAiJson<any>({
        prompt,
        systemInstruction: "You are a master GATE Ranker and IIT Mentor designing high-score roadmap strategies.",
        temperature: 0.3,
      });

      const db = getD1Database(context);
      if (db && res.data) {
        try {
          await db.prepare(`
            INSERT INTO gate_roadmaps (
              id, student_id, branch_code, target_gate_year, target_score, weak_subject_ids, strong_subject_ids, weekly_plan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(student_id) DO UPDATE SET
              target_score = excluded.target_score,
              weekly_plan = excluded.weekly_plan,
              updated_at = CURRENT_TIMESTAMP
          `).bind(
            `rdm_${Date.now()}`,
            input.studentId,
            branch,
            input.targetYear || 2026,
            targetScore,
            JSON.stringify(input.weakSubjects || []),
            JSON.stringify(input.strongSubjects || []),
            JSON.stringify(res.data)
          ).run();
        } catch (_) {}
      }

      return res.data;
    } catch (err) {
      // Robust deterministic fallback
      return {
        targetMilestone: `AIR Top 500 / Score ${targetScore}+`,
        summary: `Strategic 4-week roadmap prioritizing high-weightage topics and eliminating negative marks in ${branch}.`,
        highYieldPrioritySubjects: [
          "Engineering Mathematics (13-15 Marks)",
          "General Aptitude (15 Marks)",
          "Core Technical High-Yield Subjects (40+ Marks)"
        ],
        weeklyMilestones: [
          {
            week: 1,
            phase: "Foundation & Core Theory",
            focusSubject: "Engineering Mathematics",
            topics: ["Linear Algebra", "Calculus & Probability"],
            targetQuestionsPerDay: 25,
            revisionStrategy: "Solve PYQs from 2018-2025"
          },
          {
            week: 2,
            phase: "Deep Dive into Weak Areas",
            focusSubject: (input.weakSubjects && input.weakSubjects[0]) || "Core Technical",
            topics: ["Conceptual Derivations", "Common Trap Identification"],
            targetQuestionsPerDay: 30,
            revisionStrategy: "Topic-wise speed tests"
          },
          {
            week: 3,
            phase: "NAT & MSQ Precision Mastery",
            focusSubject: "All Technical Subjects",
            topics: ["Zero-Negative Strategy", "Numerical Calculation Precision"],
            targetQuestionsPerDay: 40,
            revisionStrategy: "Use GATE scientific calculator exclusively"
          },
          {
            week: 4,
            phase: "Full Mock Tests & Accuracy Calibration",
            focusSubject: "Complete GATE Syllabus",
            topics: ["Full-Length Mock 1 & 2", "Error Log Elimination"],
            targetQuestionsPerDay: 65,
            revisionStrategy: "3-Hour simulated CBT exam"
          }
        ]
      };
    }
  });
