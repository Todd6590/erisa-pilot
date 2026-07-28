import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { CREATABLE_DOC_TYPES, AUTHORITIES } from '../../shared/documentTemplates.ts';

function escapeHtml(str) {
  if (str == null) return '';
  const amp = String.fromCharCode(38);
  return String(str)
    .replace(/&/g, amp + 'amp;')
    .replace(/</g, amp + 'lt;')
    .replace(/>/g, amp + 'gt;')
    .replace(/"/g, amp + 'quot;')
    .replace(/'/g, amp + '#39;');
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const typesList = CREATABLE_DOC_TYPES.map((d) => `${d.label} (${d.authority})`).join('\n- ');

    const prompt = `You are an ERISA compliance research analyst. Perform a weekly regulatory scan to keep 
benefits broker document templates current.

DATE OF SCAN: ${today}

DOCUMENT FAMILIES TO MONITOR:
- ${typesList}

AUTHORITIES TO SCAN:
${AUTHORITIES.map((a) => '- ' + a).join('\n')}

INSTRUCTIONS:
1. Search the web for regulatory updates, proposed and final rules, updated model notices/templates, 
new penalty amounts, and deadline changes affecting these document families over roughly the last 60 days.
2. Focus on items that affect how these documents must be created or updated (new template language, new required disclosures, new dollar thresholds).
3. For each meaningful change, note: which document it affects, what changed, the effective date, and the source URL.
4. Also note any brand-new required documents that do not yet exist in the list above.
5. If there are no material changes, say so clearly but still note minor items worth monitoring.

Return a JSON object:
- "has_updates" (boolean): true if any actionable change was found
- "title" (string): a short headline (e.g. "Weekly ERISA Regulatory Scan — Jul 27, 2026")
- "summary" (string): 2-4 sentence plain-language overview
- "findings" (string): detailed Markdown report grouped by document family, with sources inline
- "sources" (array of strings): the authoritative URLs reviewed
`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          has_updates: { type: 'boolean' },
          title: { type: 'string' },
          summary: { type: 'string' },
          findings: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'summary', 'findings'],
      },
    });

    const record = await base44.asServiceRole.entities.RegulatoryUpdate.create({
      research_date: today,
      title: result.title || `Weekly ERISA Regulatory Scan — ${today}`,
      summary: result.summary || '',
      has_updates: !!result.has_updates,
      findings: result.findings || '',
      sources: Array.isArray(result.sources) ? result.sources.join('\n') : '',
      document_types_checked: CREATABLE_DOC_TYPES.map((d) => d.id).join(', '),
    });

    // Email a brief summary to all admin users so the broker sees the Monday review prompt.
    try {
      const admins = await base44.asServiceRole.entities.User.list();
      const subject = result.has_updates
        ? `[ERISA Guide] Regulatory Updates Found — Weekly Scan ${today}`
        : `[ERISA Guide] No Material Regulatory Changes — Weekly Scan ${today}`;
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Weekly Regulatory Scan</h2>
          </div>
          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>${escapeHtml(result.summary || 'Scan complete.')}</p>
            <p style="margin-top:16px;"><strong>Action required:</strong> Review the full findings in ERISA Guide under the Document Builder page.</p>
            <p style="color:#6b7280;font-size:12px;margin-top:24px;">This is an automated message from ERISA Guide.</p>
          </div>
        </div>`;
      for (const a of admins) {
        if (a.role === 'admin' && a.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: a.email,
            subject,
            body,
          });
        }
      }
    } catch (_e) {
      // Email delivery is best-effort; the research record is already saved.
    }

    return Response.json({
      success: true,
      has_updates: !!result.has_updates,
      record_id: record.id,
      title: record.title,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}