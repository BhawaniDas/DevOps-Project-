const Task = require('../models/Task');

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/MOCK/WEBHOOK/URL';
const INTERVAL_MS = 60_000; // 60 seconds

function buildPayload(task) {
  return {
    text: '🚨 *TaskDash Alert* — Overdue Task',
    attachments: [{
      color:  task.priority === 'critical' ? '#ef4444' : '#f97316',
      fields: [
        { title: 'Task',     value: task.title,                                               short: false },
        { title: 'Priority', value: task.priority.toUpperCase(),                              short: true  },
        { title: 'Sprint',   value: task.sprint,                                              short: true  },
        { title: 'Assignee', value: task.assignee,                                            short: true  },
        { title: 'Due',      value: new Date(task.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' }), short: true },
      ],
      footer: 'TaskDash Notification Engine',
      ts:     Math.floor(Date.now() / 1000),
    }],
  };
}

async function scanOverdue() {
  try {
    const overdue = await Task.find({
      dueDate:        { $lt: new Date() },
      status:         { $nin: ['deployed', 'failed'] },
      slackAlertSent: false,
    }).lean();

    if (!overdue.length) return;

    console.log(`\n🔔 [SlackWorker] ${overdue.length} overdue task(s) detected\n`);

    for (const task of overdue) {
      const payload = buildPayload(task);

      // ── Production: replace console.log with real HTTP POST ──────────────
      // await fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify(payload),
      //   headers: { 'Content-Type': 'application/json' } });
      console.log(`📣 [Slack → ${WEBHOOK_URL}]`);
      console.log(JSON.stringify(payload, null, 2), '\n');

      await Task.findByIdAndUpdate(task._id, { slackAlertSent: true });
    }
  } catch (err) {
    console.error('❌ [SlackWorker]', err.message);
  }
}

function startSlackWorker() {
  scanOverdue(); // immediate first run
  const timer = setInterval(scanOverdue, INTERVAL_MS);
  console.log(`🤖 [SlackWorker] Started — scanning every ${INTERVAL_MS / 1000}s`);
  return timer; // caller can clearInterval if needed
}

module.exports = { startSlackWorker };
