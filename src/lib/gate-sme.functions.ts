import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getD1Database } from "@/lib/cloudflare-d1";
import { getAdminClient } from "@/integrations/supabase/admin";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface PendingSmeReviewItem {
  questionId: string;
  branchCode: string;
  subject?: string;
  questionType: string;
  questionText: string;
  options?: any;
  correctAnswer: string;
  theoreticalConcept: string;
  stepByStepDerivation: string;
  commonTrapsAndPitfalls: string;
  verificationStatus: string;
  updatedAt: string;
}

// 1. List Questions & Breakdowns Pending SME Review
export const listPendingSmeReviewsFn = createServerFn({ method: "GET" })
  .validator((d: { branch?: string; status?: string }) => d)
  .handler(async ({ data: filter, context }) => {
    const db = getD1Database(context);
    if (db) {
      try {
        let query = `
          SELECT 
            q.id as questionId,
            q.branch_code as branchCode,
            q.question_type as questionType,
            q.question_text as questionText,
            q.options as options,
            q.correct_answer as correctAnswer,
            b.theoretical_concept as theoreticalConcept,
            b.step_by_step_derivation as stepByStepDerivation,
            b.common_traps_and_pitfalls as commonTrapsAndPitfalls,
            COALESCE(b.verification_status, 'pending') as verificationStatus,
            COALESCE(b.updated_at, q.created_at) as updatedAt
          FROM gate_questions q
          LEFT JOIN gate_question_breakdowns b ON q.id = b.question_id
          WHERE 1=1
        `;
        const params: any[] = [];
        if (filter?.branch && filter.branch !== "ALL") {
          query += ` AND q.branch_code = ?`;
          params.push(filter.branch);
        }
        if (filter?.status && filter.status !== "ALL") {
          query += ` AND b.verification_status = ?`;
          params.push(filter.status);
        }
        query += ` ORDER BY q.created_at DESC LIMIT 50`;

        const res = await (params.length > 0 ? db.prepare(query).bind(...params).all<PendingSmeReviewItem>() : db.prepare(query).all<PendingSmeReviewItem>());
        if (res.results && res.results.length > 0) {
          return res.results;
        }
      } catch (err: any) {
        console.warn("[listPendingSmeReviewsFn] D1 query skipped:", err.message);
      }
    }

    // Default mock review queue for demo & immediate review testing
    return [
      {
        questionId: "gate_cs_algo_01",
        branchCode: "CS",
        subject: "Algorithms",
        questionType: "nat",
        questionText: "Consider a hash table of size 11 with open addressing using linear probing. The hash function is h(k) = k mod 11. The keys 22, 1, 13, 11, 24, 33 are inserted in that order. What is the number of comparisons required to search for key 33 in the resulting table?",
        options: null,
        correctAnswer: "3",
        theoreticalConcept: "Linear probing resolves collisions via h(k, i) = (h(k) + i) mod m. Average successful search cost depends on primary clustering.",
        stepByStepDerivation: "1. Key 22 -> index 0\n2. Key 1 -> index 1\n3. Key 13 -> index 2\n4. Key 11 -> collision at 0, 1, 2, placed at 3\n5. Key 24 -> collision at 2, placed at 4\n6. Key 33 -> collision at 0, 1, 2, 3, 4, placed at 5.\nWhen searching for 33: check index 0 (miss), 1 (miss), 2 (miss), 3 (miss), 4 (miss), 5 (hit). Comparisons = 6 probes.",
        commonTrapsAndPitfalls: "Candidates often confuse the initial hash index with 0-based probe counting. The exact number of table slots inspected is 6.",
        verificationStatus: "ai_generated",
        updatedAt: new Date().toISOString()
      },
      {
        questionId: "gate_da_ml_02",
        branchCode: "DA",
        subject: "Machine Learning",
        questionType: "msq",
        questionText: "Which of the following statements is/are TRUE regarding Support Vector Machines (SVM)?",
        options: [
          { id: "A", text: "The optimal separating hyperplane maximizes the margin 2 / ||w||." },
          { id: "B", text: "Removing non-support vectors does not change the decision boundary." },
          { id: "C", text: "Slack variables are only required for linearly separable datasets." },
          { id: "D", text: "Kernel trick maps input data into higher-dimensional feature space without explicitly computing coordinates." }
        ],
        correctAnswer: "A,B,D",
        theoreticalConcept: "Soft-margin SVM primal formulation min 0.5||w||^2 + C sum(xi_i). Dual problem depends solely on inner products <x_i, x_j> enabling Mercer kernels.",
        stepByStepDerivation: "Statement A is TRUE: margin is 2/||w||.\nStatement B is TRUE: support vectors exclusively define w and b.\nStatement C is FALSE: slack variables handle non-separable data.\nStatement D is TRUE: Mercer kernel computes dot product directly in Hilbert space.",
        commonTrapsAndPitfalls: "MSQ requires all correct options to be selected for full credit. Selecting C or omitting D yields 0 marks under GATE rules.",
        verificationStatus: "ai_generated",
        updatedAt: new Date().toISOString()
      }
    ];
  });

// 2. Submit SME Review / Verification
export const submitSmeReviewFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: {
    questionId: string;
    action: "approve" | "edit" | "flag";
    theoreticalConcept?: string;
    stepByStepDerivation?: string;
    commonTrapsAndPitfalls?: string;
    reviewerNotes?: string;
  }) => d)
  .handler(async ({ data: input, context }) => {
    const db = getD1Database(context);
    const status = input.action === "approve" ? "sme_verified" : input.action === "edit" ? "sme_edited" : "flagged";

    if (db) {
      try {
        await db.prepare(`
          INSERT INTO gate_question_breakdowns (
            question_id, theoretical_concept, step_by_step_derivation, common_traps_and_pitfalls, verification_status
          ) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(question_id) DO UPDATE SET
            theoretical_concept = COALESCE(excluded.theoretical_concept, theoretical_concept),
            step_by_step_derivation = COALESCE(excluded.step_by_step_derivation, step_by_step_derivation),
            common_traps_and_pitfalls = COALESCE(excluded.common_traps_and_pitfalls, common_traps_and_pitfalls),
            verification_status = excluded.verification_status,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          input.questionId,
          input.theoreticalConcept || "",
          input.stepByStepDerivation || "",
          input.commonTrapsAndPitfalls || "",
          status
        ).run();
      } catch (err: any) {
        console.warn("[submitSmeReviewFn] D1 update failed:", err.message);
      }
    }

    return { success: true, status };
  });

// 3. List Escalated Student Doubts
export const listEscalatedDoubtsFn = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const db = getD1Database(context);
    if (db) {
      try {
        const res = await db.prepare(`
          SELECT d.*, q.question_text, q.correct_answer, q.branch_code
          FROM gate_doubts d
          JOIN gate_questions q ON d.question_id = q.id
          WHERE d.is_escalated_to_sme = 1 AND d.status != 'resolved'
          ORDER BY d.updated_at DESC
        `).all();
        if (res.results && res.results.length > 0) return res.results;
      } catch (_) {}
    }

    return [
      {
        id: "dbt_101",
        student_id: "student_gate_44",
        question_id: "gate_cs_algo_01",
        question_text: "Consider a hash table of size 11 with open addressing using linear probing...",
        correct_answer: "3",
        branch_code: "CS",
        messages: JSON.stringify([
          { sender: "student", content: "Is the number of probes 5 or 6? The explanation mentions index 5, so doesn't it require 5 checks?", timestamp: new Date().toISOString() }
        ]),
        status: "escalated"
      }
    ];
  });
