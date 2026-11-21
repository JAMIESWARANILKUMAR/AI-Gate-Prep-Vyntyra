import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getD1Database } from "@/lib/cloudflare-d1";
import { generateUploadUrl, uploadBufferToR2 } from "@/lib/r2";
import { getAdminClient } from "@/integrations/supabase/admin";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface GateVaultItem {
  id: string;
  category: "pyq" | "syllabus" | "study_notes" | "formula_sheet";
  branch_code: string;
  year?: number | null;
  subject_id?: string | null;
  subject_name?: string | null;
  title: string;
  description?: string | null;
  r2_key: string;
  r2_url: string;
  file_size_bytes?: number;
  file_type?: string;
  download_count: number;
  created_at: string;
}

// 1. List Vault Documents (filter by branch, category, year)
export const listGateVaultDocumentsFn = createServerFn({ method: "GET" })
  .validator((d: { branch?: string; category?: string; year?: number }) => d)
  .handler(async ({ data: filter, context }) => {
    const db = getD1Database(context);
    
    if (db) {
      try {
        let query = `
          SELECT v.*, s.name as subject_name 
          FROM gate_vault_documents v
          LEFT JOIN gate_subjects s ON v.subject_id = s.id
          WHERE 1=1
        `;
        const params: any[] = [];

        if (filter?.branch && filter.branch !== "ALL") {
          query += ` AND v.branch_code = ?`;
          params.push(filter.branch);
        }
        if (filter?.category && filter.category !== "ALL") {
          query += ` AND v.category = ?`;
          params.push(filter.category);
        }
        if (filter?.year && filter.year > 0) {
          query += ` AND v.year = ?`;
          params.push(filter.year);
        }

        query += ` ORDER BY v.year DESC, v.created_at DESC`;
        const stmt = db.prepare(query);
        const res = await (params.length > 0 ? stmt.bind(...params).all<GateVaultItem>() : stmt.all<GateVaultItem>());
        if (res.results && res.results.length > 0) {
          return res.results;
        }
      } catch (err: any) {
        console.warn("[listGateVaultDocumentsFn] D1 fetch error, using fallback:", err.message);
      }
    }

    // Supabase fallback query if D1 table is empty or local
    try {
      const supabase = getAdminClient();
      let query = supabase.from("gate_vault_documents").select("*");
      if (filter?.branch && filter.branch !== "ALL") query = query.eq("branch_code", filter.branch);
      if (filter?.category && filter.category !== "ALL") query = query.eq("category", filter.category);
      if (filter?.year && filter.year > 0) query = query.eq("year", filter.year);
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as GateVaultItem[];
      }
    } catch (_) {}

    // Default Seed Documents if nothing uploaded yet
    return getSeedVaultDocuments(filter?.branch, filter?.category);
  });

// 2. Upload Document to R2 Vault
export const uploadGateVaultDocumentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: {
    title: string;
    category: "pyq" | "syllabus" | "study_notes" | "formula_sheet";
    branch_code: string;
    year?: number;
    subject_id?: string;
    description?: string;
    fileBase64?: string;
    fileName?: string;
    contentType?: string;
    directUrl?: string;
  }) => d)
  .handler(async ({ data: input, context }) => {
    let fileUrl = input.directUrl || "";
    let r2Key = `gate-vault/${input.category}/${input.branch_code}/${Date.now()}-${input.fileName || "doc.pdf"}`;

    if (input.fileBase64) {
      const buffer = Buffer.from(input.fileBase64.replace(/^data:[^;]+;base64,/, ""), "base64");
      const uploadedUrl = await uploadBufferToR2(buffer, r2Key, input.contentType || "application/pdf");
      if (uploadedUrl) {
        fileUrl = uploadedUrl;
      }
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const db = getD1Database(context);

    if (db) {
      try {
        await db.prepare(`
          INSERT INTO gate_vault_documents (
            id, category, branch_code, year, subject_id, title, description, r2_key, r2_url, file_size_bytes, file_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          docId,
          input.category,
          input.branch_code,
          input.year || null,
          input.subject_id || null,
          input.title,
          input.description || null,
          r2Key,
          fileUrl,
          0,
          input.contentType || "application/pdf"
        ).run();
      } catch (err: any) {
        console.warn("[uploadGateVaultDocumentFn] D1 insert failed:", err.message);
      }
    }

    // Also persist in Supabase for cross-environment redundancy
    try {
      const supabase = getAdminClient();
      await supabase.from("gate_vault_documents").upsert({
        id: docId,
        category: input.category,
        branch_code: input.branch_code,
        year: input.year || null,
        subject_id: input.subject_id || null,
        title: input.title,
        description: input.description || null,
        r2_key: r2Key,
        r2_url: fileUrl,
      });
    } catch (_) {}

    return { success: true, docId, fileUrl };
  });

// 3. Increment Download Counter
export const incrementGateVaultDownloadFn = createServerFn({ method: "POST" })
  .validator((d: { docId: string }) => d)
  .handler(async ({ data: { docId }, context }) => {
    const db = getD1Database(context);
    if (db) {
      try {
        await db.prepare("UPDATE gate_vault_documents SET download_count = download_count + 1 WHERE id = ?").bind(docId).run();
      } catch (_) {}
    }
    return { success: true };
  });

// Seed catalog for standard branches (CS, DA, EC, EE, ME, CE)
function getSeedVaultDocuments(branch?: string, category?: string): GateVaultItem[] {
  const seeds: GateVaultItem[] = [
    {
      id: "seed-cs-2025",
      category: "pyq",
      branch_code: "CS",
      year: 2025,
      title: "GATE 2025 Computer Science & IT (CS) - Official Question Paper & Key",
      description: "Official question paper conducted by IIT Roorkee with verified master answer key.",
      r2_key: "gate-vault/pyq/CS/GATE_2025_CS_Official.pdf",
      r2_url: "https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/gate-vault/pyq/CS/GATE_2025_CS_Official.pdf",
      download_count: 1420,
      created_at: "2025-02-15T10:00:00Z"
    },
    {
      id: "seed-da-2025",
      category: "pyq",
      branch_code: "DA",
      year: 2025,
      title: "GATE 2025 Data Science & AI (DA) - Official Question Paper & Key",
      description: "Official IIT Roorkee question paper for Data Science and Artificial Intelligence.",
      r2_key: "gate-vault/pyq/DA/GATE_2025_DA_Official.pdf",
      r2_url: "https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/gate-vault/pyq/DA/GATE_2025_DA_Official.pdf",
      download_count: 980,
      created_at: "2025-02-15T10:00:00Z"
    },
    {
      id: "seed-cs-syl-2026",
      category: "syllabus",
      branch_code: "CS",
      year: 2026,
      title: "GATE 2026 Official Syllabus - Computer Science & Information Technology",
      description: "Detailed topic-wise syllabus breakdown, sections weightage, and reference textbooks.",
      r2_key: "gate-vault/syllabus/GATE_CS_Syllabus_Official.pdf",
      r2_url: "https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/gate-vault/syllabus/GATE_CS_Syllabus_Official.pdf",
      download_count: 3100,
      created_at: "2025-01-10T10:00:00Z"
    },
    {
      id: "seed-da-syl-2026",
      category: "syllabus",
      branch_code: "DA",
      year: 2026,
      title: "GATE 2026 Official Syllabus - Data Science & Artificial Intelligence (DA)",
      description: "Machine Learning, Deep Learning, Probability & Statistics, Linear Algebra and Python.",
      r2_key: "gate-vault/syllabus/GATE_DA_Syllabus_Official.pdf",
      r2_url: "https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/gate-vault/syllabus/GATE_DA_Syllabus_Official.pdf",
      download_count: 2450,
      created_at: "2025-01-10T10:00:00Z"
    },
    {
      id: "seed-cs-notes-algo",
      category: "study_notes",
      branch_code: "CS",
      year: 2025,
      title: "High-Yield Algorithms & Asymptotic Notation Mastery Guide",
      description: "Recurrence relations, divide-and-conquer, greedy, dynamic programming & graph algorithms.",
      r2_key: "gate-vault/materials/CS/Algorithms_Core_Notes.pdf",
      r2_url: "https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/gate-vault/materials/CS/Algorithms_Core_Notes.pdf",
      download_count: 1890,
      created_at: "2025-01-20T10:00:00Z"
    },
    {
      id: "seed-cs-formula",
      category: "formula_sheet",
      branch_code: "CS",
      year: 2025,
      title: "GATE CS Complete Formula & Quick Revision Handbook",
      description: "Formulas across DBMS Normalization, Discrete Math, OS Scheduling, and Networks Subnetting.",
      r2_key: "gate-vault/materials/CS/GATE_CS_Formula_Sheet.pdf",
      r2_url: "https://pub-6aedbff3e9ed429dbf052e690252ec6f.r2.dev/gate-vault/materials/CS/GATE_CS_Formula_Sheet.pdf",
      download_count: 4200,
      created_at: "2025-01-25T10:00:00Z"
    }
  ];

  return seeds.filter(s => {
    if (branch && branch !== "ALL" && s.branch_code !== branch) return false;
    if (category && category !== "ALL" && s.category !== category) return false;
    return true;
  });
}
