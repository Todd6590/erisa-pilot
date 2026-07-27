import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const tasks = await base44.asServiceRole.entities.ComplianceTask.filter({});
    const clients = await base44.asServiceRole.entities.Client.filter({});

    const clientMap = {};
    clients.forEach(c => { clientMap[c.id] = c; });

    const now = new Date();
    const alerts = [];

    for (const task of tasks) {
      if (task.status === 'completed' || task.status === 'na' || !task.due_date) continue;

      const dueDate = new Date(task.due_date);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      const client = clientMap[task.client_id];

      // Mark overdue tasks
      if (daysUntilDue < 0 && task.status !== 'overdue') {
        await base44.asServiceRole.entities.ComplianceTask.update(task.id, { status: 'overdue' });
        alerts.push({
          type: 'overdue',
          task: task.title,
          client: client?.company_name || 'Unknown',
          daysOverdue: Math.abs(daysUntilDue),
        });
      }

      // Send reminder at 30, 14, and 7 days before due date
      if ([30, 14, 7].includes(daysUntilDue) && client?.contact_email) {
        const urgency = daysUntilDue <= 7 ? 'URGENT' : daysUntilDue <= 14 ? 'Important' : 'Reminder';

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: client.contact_email,
          subject: `[${urgency}] ${escapeHtml(task.title)} — Due in ${daysUntilDue} days`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">ERISA Compliance Reminder</h2>
              </div>
              <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Dear ${escapeHtml(client.contact_name || 'Plan Administrator')},</p>
                <p>This is a ${urgency.toLowerCase()} reminder that the following compliance item is due soon:</p>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid ${daysUntilDue <= 7 ? '#ef4444' : '#f59e0b'};">
                  <p style="margin: 0; font-weight: bold;">${escapeHtml(task.title)}</p>
                  <p style="margin: 4px 0 0; color: #6b7280;">Due: ${new Date(task.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  ${task.description ? `<p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">${escapeHtml(task.description)}</p>` : ''}
                </div>
                <p>Please take action to ensure timely compliance. Contact your broker if you need assistance.</p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">This is an automated message from ERISA Comply.</p>
              </div>
            </div>
          `,
        });

        alerts.push({
          type: 'reminder_sent',
          task: task.title,
          client: client.company_name,
          daysLeft: daysUntilDue,
          email: client.contact_email,
        });
      }
    }

    return Response.json({
      success: true,
      processed: tasks.length,
      alerts: alerts.length,
      details: alerts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});