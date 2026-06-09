const Task         = require('../models/Task');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const TERMINAL = ['deployed', 'failed'];

// ── Determine base filter (admin sees all, member sees own) ──────────────────
const baseFilter = (req) =>
  req.user.role === 'admin' ? {} : { createdBy: req.user._id };

// ── GET /api/tasks/stats ──────────────────────────────────────────────────────
exports.getStats = asyncHandler(async (req, res) => {
  const now     = new Date();
  const weekAgo = new Date(now - 7 * 86400000);
  const filter  = baseFilter(req);

  const [statusCounts, priorityCounts, total, overdue, recentActivity, daily] =
    await Promise.all([
      Task.aggregate([{ $match: filter }, { $group: { _id: '$status',   count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: filter }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, dueDate: { $lt: now }, status: { $nin: TERMINAL } }),
      Task.find(filter).sort({ updatedAt: -1 }).limit(6).select('title status priority updatedAt assignee'),
      Task.aggregate([
        { $match: { ...filter, completedAt: { $gte: weekAgo, $lte: now } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

  // Fill 7-day gaps with 0
  const weeklyCompletions = Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(now - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    const hit = daily.find((x) => x._id === key);
    return { date: key, label: d.toLocaleDateString('en-US', { weekday: 'short' }), count: hit?.count || 0 };
  });

  const byStatus   = statusCounts.reduce((a, { _id, count })   => ({ ...a, [_id]: count }), { todo: 0, 'in-progress': 0, 'code-review': 0, testing: 0, deployed: 0, failed: 0 });
  const byPriority = priorityCounts.reduce((a, { _id, count }) => ({ ...a, [_id]: count }), { low: 0, medium: 0, high: 0, critical: 0 });
  const completionRate = total > 0 ? Math.round((byStatus.deployed / total) * 100) : 0;

  res.json({ total, overdue, completionRate, byStatus, byPriority, weeklyCompletions, recentActivity });
});

// ── GET /api/tasks ────────────────────────────────────────────────────────────
exports.getTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, tags, page = 1, limit = 100, sortBy = 'createdAt', order = 'desc' } = req.query;
  const filter = { ...baseFilter(req) };

  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;
  if (tags)     filter.tags     = { $in: tags.split(',') };
  if (search)   filter.$or      = [
    { title:       { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ [sortBy]: order === 'asc' ? 1 : -1 }).skip(skip).limit(parseInt(limit))
        .populate('createdBy', 'name initials'),
    Task.countDocuments(filter),
  ]);

  res.json({ tasks, pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
});

// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
exports.getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('createdBy', 'name initials');
  if (!task) throw new AppError('Task not found', 404);

  if (req.user.role !== 'admin' && task.createdBy._id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }
  res.json(task);
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
exports.createTask = asyncHandler(async (req, res) => {
  const task = await new Task({ ...req.body, createdBy: req.user._id }).save();
  res.status(201).json(task);
});

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────────
exports.updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError('Task not found', 404);

  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  // Reset Slack alert if due date changes
  if (req.body.dueDate && req.body.dueDate !== task.dueDate?.toISOString()) {
    req.body.slackAlertSent = false;
  }

  Object.assign(task, req.body);
  res.json(await task.save());
});

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
exports.patchTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError('Task not found', 404);

  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  Object.assign(task, req.body);
  res.json(await task.save());
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError('Task not found', 404);

  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted', id: req.params.id });
});

// ── DELETE /api/tasks (bulk) ──────────────────────────────────────────────────
exports.bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) throw new AppError('ids array required', 400);
  const result = await Task.deleteMany({ _id: { $in: ids } });
  res.json({ message: `${result.deletedCount} tasks deleted` });
});

// ── POST /api/tasks/seed (admin only) ─────────────────────────────────────────
exports.seedTasks = asyncHandler(async (req, res) => {
  await Task.deleteMany({});
  const uid = req.user._id;

  const ENGINEERS = ['Alex K.', 'Priya S.', 'Jordan T.', 'Sam R.', 'Mei L.'];
  const SPRINTS   = ['Sprint 12', 'Sprint 13', 'Sprint 14'];

  const tasks = [
    { title: 'Bootstrap Kubernetes cluster on EKS',          status: 'deployed',    priority: 'critical', tags: ['kubernetes','aws','terraform'],    dueDate: new Date(Date.now()-86400000*5),  assignee: ENGINEERS[0], sprint: SPRINTS[0], description: '## Overview\nProvision EKS via Terraform.\n\n```hcl\nmodule "eks" {\n  source  = "terraform-aws-modules/eks/aws"\n  version = "~> 20.0"\n  cluster_name    = "taskdash-prod"\n  cluster_version = "1.30"\n}\n```' },
    { title: 'Implement Blue/Green deployment',               status: 'deployed',    priority: 'critical', tags: ['cicd','ecs'],                      dueDate: new Date(Date.now()-86400000*3),  assignee: ENGINEERS[1], sprint: SPRINTS[0], description: '**Goal:** Zero-downtime ECS deploys via CodeDeploy.\n\n- Auto rollback on 2xx < 95% for 5 min\n- Deployment < 10 minutes' },
    { title: 'Migrate secrets to AWS Secrets Manager',        status: 'deployed',    priority: 'high',     tags: ['security','aws'],                   dueDate: new Date(Date.now()-86400000*2),  assignee: ENGINEERS[2], sprint: SPRINTS[0], description: '```bash\naws secretsmanager create-secret --name taskdash/prod/mongo-uri --secret-string "mongodb+srv://..."\n```' },
    { title: 'Set up Prometheus + Grafana observability',     status: 'testing',     priority: 'high',     tags: ['monitoring','grafana'],             dueDate: new Date(Date.now()+86400000),    assignee: ENGINEERS[3], sprint: SPRINTS[1], description: 'Deploy `kube-prometheus-stack` via Helm. Build dashboards for API p50/p95/p99 latency.' },
    { title: 'Configure WAF rules on CloudFront',             status: 'code-review', priority: 'critical', tags: ['security','cloudfront'],            dueDate: new Date(Date.now()+86400000*2),  assignee: ENGINEERS[4], sprint: SPRINTS[1], description: 'Add AWS WAF v2 with managed rule groups.\n\n```json\n{ "RateLimit": 2000, "WindowSeconds": 300 }\n```' },
    { title: 'Automate DB snapshots to S3',                   status: 'in-progress', priority: 'high',     tags: ['database','lambda'],               dueDate: new Date(Date.now()-86400000),    assignee: ENGINEERS[0], sprint: SPRINTS[1], description: 'Lambda triggers nightly Atlas snapshots → S3 Glacier with 90-day lifecycle.' },
    { title: 'Refactor monolith into microservices',          status: 'in-progress', priority: 'medium',   tags: ['architecture','sqs'],              dueDate: new Date(Date.now()+86400000*5),  assignee: ENGINEERS[1], sprint: SPRINTS[1], description: '**Services:**\n- `auth-service`\n- `task-service`\n- `notify-service`' },
    { title: 'Implement distributed tracing with OTEL',       status: 'todo',        priority: 'medium',   tags: ['observability','xray'],            dueDate: new Date(Date.now()+86400000*8),  assignee: ENGINEERS[2], sprint: SPRINTS[2] },
    { title: 'Chaos Engineering — GameDay with Gremlin',      status: 'todo',        priority: 'low',      tags: ['reliability'],                      dueDate: new Date(Date.now()+86400000*14), assignee: ENGINEERS[3], sprint: SPRINTS[2] },
    { title: 'Audit and rotate IAM access keys',              status: 'todo',        priority: 'critical', tags: ['security','iam'],                   dueDate: new Date(Date.now()-86400000*2),  assignee: ENGINEERS[0], sprint: SPRINTS[1], description: '> ⚠️ **CRITICAL**: Keys older than 90 days detected.\n\n```bash\naws iam list-access-keys --user-name ci-deploy-user\n```' },
    { title: 'Performance test — 10k concurrent users (k6)',  status: 'todo',        priority: 'high',     tags: ['performance','k6'],                dueDate: new Date(Date.now()+86400000*6),  assignee: ENGINEERS[1], sprint: SPRINTS[2], description: '```js\nimport http from "k6/http";\nexport const options = { vus: 10000, duration: "2m" };\nexport default () => { http.get("https://api.taskdash.io/api/tasks"); }\n```' },
    { title: 'Enable multi-region failover with Route 53',    status: 'failed',      priority: 'high',     tags: ['aws','ha'],                         dueDate: new Date(Date.now()-86400000),    assignee: ENGINEERS[2], sprint: SPRINTS[2] },
    { title: 'Cost optimisation — right-size EC2 & RDS',     status: 'todo',        priority: 'low',      tags: ['finops'],                           dueDate: new Date(Date.now()+86400000*20), assignee: ENGINEERS[3], sprint: SPRINTS[2] },
    { title: 'Write on-call incident response runbook',       status: 'code-review', priority: 'medium',   tags: ['documentation'],                    dueDate: new Date(Date.now()+86400000*10), assignee: ENGINEERS[4], sprint: SPRINTS[2], description: '| Level | Response | Escalation |\n|-------|----------|------------|\n| P0    | 5 min    | CTO        |\n| P1    | 15 min   | Eng Lead   |\n| P2    | 1 hr     | On-call    |' },
  ].map((t) => ({ ...t, createdBy: uid }));

  const created = await Task.insertMany(tasks);
  res.status(201).json({ message: `${created.length} tasks seeded`, count: created.length });
});
