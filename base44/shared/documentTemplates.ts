// Shared document-type configuration used by generateDocument and weeklyRegulatoryResearch.
// Keeping this in one place ensures both functions research and generate from the same spec.

export interface DocTypeDef {
  id: string;
  label: string;
  authority: string;
  save_as: string; // maps to ComplianceDocument.document_type enum
  guidance: string; // detailed generation instructions for the LLM
}

export const CREATABLE_DOC_TYPES: DocTypeDef[] = [
  {
    id: "spd",
    label: "Summary Plan Description (SPD)",
    authority: "DOL EBSA — 29 CFR 2520.102",
    save_as: "spd",
    guidance: `Generate a complete Summary Plan Description (SPD) that complies with ERISA Section 102 and 29 CFR 2520.102.
Required sections: (1) Plan name, sponsor name, and EIN; (2) type of plan and administration;
(3) plan administrator name, address, and contact; (4) type of funding and funding arrangement;
(5) eligibility conditions and enrollment; (6) description of benefits and covered services;
(7) cost-sharing (premiums, deductibles, copays, coinsurance, out-of-pocket maximums);
(8) exclusions and limitations; (9) COBRA continuation rights; (10) claims procedures and appeals (two levels); 
(11) circumstances causing loss or denial of benefits; (12) ERISA Statement of Rights (use DOL model language); 
(13) amendment and termination; (14) plan year and service provider info.
Research the CURRENT DOL model SPD language and ACA-prompted disclosures for the relevant plan year.
Write in plain language at ~9th-grade reading level. Use the employer, plan, and carrier data provided.`,
  },
  {
    id: "sbc",
    label: "Summary of Benefits and Coverage (SBC)",
    authority: "DOL/IRS/HHS — 45 CFR 147.200 (ACA SBC)",
    save_as: "sbc",
    guidance: `Generate a Summary of Benefits and Coverage (SBC) following the current DOL unified SBC template 
(maximum 4 double-sided pages). Include: "Why This Matters" intro, "Questions and Answers About the Plan,"
the standard "Common Medical Events" coverage examples table, cost-sharing detail rows, exclusions, 
and the two coverage examples (having a baby; managing type 2 diabetes) using the current national average costs.
Research the LATEST SBC template and guidance for the relevant plan year. Use plan cost-sharing data provided.
Keep to the standardized format — do not add free-form marketing copy.`,
  },
  {
    id: "sar",
    label: "Summary Annual Report (SAR)",
    authority: "DOL EBSA — 29 CFR 2520.104",
    save_as: "sar",
    guidance: `Generate a Summary Annual Report (SAR) per 29 CFR 2520.104-4 through -9.
Include: plan name; plan year; a plain-language summary of total plan assets, contributions received, 
benefits paid, and plan expenses; a comparison of this year vs. prior year financials; a statement of 
participants' right to receive the full annual report (Form 5500) free of charge; the administrator's 
name, address, and signature block; and the DOL-required notice language. If financial figures are not 
provided, insert clearly-labeled bracketed placeholders for the preparer to complete. 
Research the current DOL model SAR language for the filing year.`,
  },
  {
    id: "smm",
    label: "Summary of Material Modifications (SMM)",
    authority: "DOL EBSA — 29 CFR 2520.104",
    save_as: "smm",
    guidance: `Generate a Summary of Material Modifications (SMM) summarizing a material plan change.
Include: plan name; a clear summary of what changed, the effective date, and which benefit categories are affected;
"before vs. after" comparison; a statement that this SMM amends the SPD and should be kept with it; 
distribution timing note (within 210 days after plan year end, or 60 days for a material reduction); 
and instructions for questions. Research current DOL SMM requirements for the relevant plan year.`,
  },
  {
    id: "wrap_document",
    label: "Wrap Plan Document",
    authority: "DOL EBSA — ERISA §402",
    save_as: "wrap_document",
    guidance: `Generate a Wrap Plan Document that wraps around the carrier certificate(s) to create a single 
ERISA-compliant plan document. Include: plan name and sponsor; named fiduciary and plan administrator 
(employer, with EIN); plan administrator duties; funding arrangement (fully insured, self-funded, or level-funded) 
and insurance carriers; covered benefits reference to the underlying certificates; eligibility and enrollment;
claims and appeals procedures meeting 29 CFR 2560.503-1 (two levels, 15/30/45 day timelines); 
COBRA continuation rights reference; ERISA fiduciary provisions; amendment and termination procedures; 
plan year; definitions section. Research current DOL claims-procedure and disclosure requirements.`,
  },
  {
    id: "plan_document",
    label: "Plan Document",
    authority: "DOL EBSA — ERISA §402(a)(1)",
    save_as: "plan_document",
    guidance: `Generate a formal Plan Document under ERISA §402(a)(1). Include: plan name and sponsor;
stated purpose; effective date; definitions; eligibility and participation; classes of employees covered;
covered benefits and limitations; funding arrangement; contributions (employee and employer); 
benefit payments; claims and appeals procedure; COBRA reference; fiduciary responsibilities; 
amendment and termination; plan year; administrator and named fiduciary. Where actual figures are unknown, 
insert clearly-labeled bracketed placeholders. Research current ERISA plan-document requirements for the relevant year.`,
  },
  {
    id: "cobra_notice",
    label: "COBRA Initial / Election Notice",
    authority: "DOL EBSA — 29 CFR 2590.606",
    save_as: "cobra_notice",
    guidance: `Generate a COBRA continuation coverage notice (applicable to employers with 20+ employees) 
meeting 29 CFR 2590.606. Include: plan name and sponsor (if >=20 employees); a description of COBRA continuation rights;
qualifying events and the 18/29/36 month maximum periods; how to elect (deadline: 60 days); premium and grace period 
details; the 2% (or 150% for disability) surcharge; address for premium payment; consequences of late or non-payment;
and where to send notices of qualifying events or disability determinations. Research current DOL model COBRA notices 
for the relevant year. State clearly if the employer has fewer than 20 employees (COBRA does not apply).`,
  },
  {
    id: "hipaa_notice",
    label: "HIPAA Notice of Privacy Practices",
    authority: "HHS — 45 CFR 164.520",
    save_as: "hipaa_notice",
    guidance: `Generate a HIPAA Notice of Privacy Practices under 45 CFR 164.520 for a group health plan.
Include: how the plan may use and disclose PHI; the plan's duties (privacy practices, safeguards); 
individual rights (access, amendment, restrictions, confidential communications, accounting of disclosures, 
paper copy); right to file a complaint with the plan and with the Secretary of HHS; plan contact;
effective date; and the required statement that the plan will not use/disclose genetic information for 
underwriting. Research current HHS model NPP language for the relevant year.`,
  },
];

export function getDocType(id: string): DocTypeDef | undefined {
  return CREATABLE_DOC_TYPES.find((d) => d.id === id);
}

// Compact list of authorities for the weekly research scan prompt.
export const AUTHORITIES = [
  "DOL Employee Benefits Security Administration (EBSA) — ebsa.dol.gov",
  "IRS — irs.gov (Employee Plans, ACA reporting, PCORI)",
  "HHS — hhs.gov (HIPAA, ACA, CHIPRA)",
  "CMS — cms.gov (Medicare Part D, market reforms)",
  "PBGC — pbgc.gov (if relevant)",
];

// Build the research + generation prompt for a single document.
export function buildGenerationPrompt(
  def: DocTypeDef,
  client: { company_name?: string; ein?: string; contact_name?: string; address?: string; contact_email?: string; total_employees?: number },
  plan: { plan_name?: string; plan_type?: string; carrier?: string; policy_number?: string; plan_number?: string; funding_type?: string; annual_premium?: number } | null,
  planYear: string
): string {
  const planBlock = plan
    ? `Benefit Plan:
- Plan name: ${plan.plan_name || "—"}
- Plan type: ${plan.plan_type || "—"}
- Carrier: ${plan.carrier || "—"}
- Policy number: ${plan.policy_number || "—"}
- Plan number (Form 5500): ${plan.plan_number || "—"}
- Funding type: ${plan.funding_type || "—"}
- Annual premium: ${plan.annual_premium || "—"}`
    : "Benefit Plan: (none specified — generate a general template with bracketed placeholders for plan-specific details).";

  return `You are an ERISA compliance documents expert assisting a licensed benefits broker.

TASK: Research current regulatory requirements, then draft the document described below.

DOCUMENT TO PRODUCE: ${def.label}
GOVERNING AUTHORITY: ${def.authority}
PLAN YEAR: ${planYear}

EMPLOYER / CLIENT:
- Company: ${client.company_name || "—"}
- EIN: ${client.ein || "—"}
- Primary contact: ${client.contact_name || "—"}
- Address: ${client.address || "—"}
- Total employees: ${client.total_employees || "—"}

${planBlock}

GENERATION REQUIREMENTS:
${def.guidance}

INSTRUCTIONS:
1. Search the web for the most current official guidance, model notices, and template language from the governing authority for ${def.label} applicable to plan year ${planYear}.
2. Reflect any 2025/2026 changes to the document template, required disclosures, or penalty amounts in the output.
3. Produce a complete, ready-to-finalize draft in clean Markdown using clear section headings.
4. Where specific employer/plan data is missing, insert bracketed placeholders like [INSERT: ...].
5. Add a short "Preparer Notes" section at the end listing the key sources you relied on and any dates/deadlines to verify.
6. Include a standard disclaimer that the draft is generated for review by a licensed professional and must be reviewed before distribution.

Return a JSON object with:
- "content": the full Markdown document
- "sources": a short list of the authoritative URLs you relied on
- "disclaimer": a one-line disclaimer
`;
}