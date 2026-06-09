const mongoose = require('mongoose');

const TERMINAL = ['deployed', 'failed'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'code-review', 'testing', 'deployed', 'failed'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    tags:           { type: [String], default: [] },
    dueDate:        { type: Date,    default: null },
    completedAt:    { type: Date,    default: null },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigneeId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignee:       { type: String, default: 'Unassigned' },
    sprint:         { type: String, default: 'Backlog' },
    slackAlertSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskSchema.virtual('isOverdue').get(function () {
  if (TERMINAL.includes(this.status) || !this.dueDate) return false;
  return new Date() > new Date(this.dueDate);
});

taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.completedAt    = this.status === 'deployed' ? new Date() : null;
    this.slackAlertSent = ['todo', 'in-progress'].includes(this.status) ? false : this.slackAlertSent;
  }
  next();
});

taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1, slackAlertSent: 1 });

module.exports = mongoose.model('Task', taskSchema);
