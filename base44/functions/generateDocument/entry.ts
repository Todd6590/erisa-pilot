import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { CREATABLE_DOC_TYPES, getDocType, buildGenerationPrompt } from '../../shared/documentTemplates.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { document_type, client_id, plan_id, plan_year } = body;

    if (!document_type) return Response.json({ error: 'document_type is required' }, { status: 400 });
    if (!client_id) return Response.json({ error: 'client_id is required' }, { status: 400 });

    const def = getDocType(document_type);
    if (!def) {
      return Response.json({
        error: 'Unsupported document type',
        supported: CREATABLE_DOC_TYPES.map((d) => d.id),
      }, { status: 400 });
    }

    const client = await base44.asServiceRole.entities.Client.get(client_id);
    if (!client) return Response.json({ error: 'Client not found' }, { status: 404 });

    let plan = null;
    if (plan_id) {
      plan = await base44.asServiceRole.entities.BenefitPlan.get(plan_id);
    }

    const year = plan_year || String(new Date().getFullYear());
    const prompt = buildGenerationPrompt(def, client, plan, year);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
          disclaimer: { type: 'string' },
        },
        required: ['content', 'disclaimer'],
      },
    });

    return Response.json({
      document_type: def.id,
      label: def.label,
      client_id: client.id,
      client_name: client.company_name,
      plan_year: year,
      content: result.content,
      sources: result.sources || [],
      disclaimer: result.disclaimer,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}