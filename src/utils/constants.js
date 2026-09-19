// ─── Status Values ──────────────────────────────────────

export const CLIENT_STATUSES = ['LEAD', 'NEW', 'ONBOARDING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'INACTIVE'];
export const ORDER_STATUSES = ['NEW', 'ONBOARDING', 'IN_PRODUCTION', 'PARTIALLY_DELIVERED', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
export const SCRIPT_STATUSES = ['DRAFT', 'ASSIGNED', 'IN_REVIEW', 'SENT_TO_CLIENT', 'REVISION_REQUIRED', 'APPROVED', 'READY_FOR_SHOOT'];
export const VIDEO_STATUSES = ['SCRIPT_APPROVED', 'SHOOT_PENDING', 'RAW_FOOTAGE_RECEIVED', 'VIDEO_EDITING', 'INTERNAL_QA', 'CLIENT_REVIEW', 'REVISION', 'FINAL_APPROVED', 'DELIVERED'];
export const SHOOT_STATUSES = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESHOOT_REQUIRED'];
export const PAYMENT_STATUSES = ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];
export const PAYOUT_STATUSES = ['PENDING', 'APPROVED', 'PAID'];
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
export const TASK_PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
export const ORDER_REQUEST_STATUSES = ['PENDING', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'];
export const CREATOR_AVAILABILITY = ['AVAILABLE', 'BOOKED', 'UNAVAILABLE', 'ON_HOLD'];

export const EXPENSE_CATEGORIES = ['SALARIES', 'OFFICE', 'STUDIO', 'EQUIPMENT', 'FUEL', 'PAYOUTS', 'MISC'];

export const USER_ROLES = ['OWNER', 'ADMIN', 'SALES', 'SCRIPT_WRITER', 'SHOOT_MANAGER', 'EDITOR', 'CLIENT'];

// ─── Status Color Map ───────────────────────────────────

export const STATUS_COLORS = {
  // Client
  LEAD: 'bg-blue-100 text-blue-700',
  NEW: 'bg-sky-100 text-sky-700',
  ONBOARDING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-gray-100 text-gray-600',

  // Order
  IN_PRODUCTION: 'bg-blue-100 text-blue-700',
  PARTIALLY_DELIVERED: 'bg-indigo-100 text-indigo-700',
  CANCELLED: 'bg-red-100 text-red-700',

  // Script
  DRAFT: 'bg-gray-100 text-gray-600',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  SENT_TO_CLIENT: 'bg-purple-100 text-purple-700',
  REVISION_REQUIRED: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-green-100 text-green-700',
  READY_FOR_SHOOT: 'bg-emerald-100 text-emerald-700',

  // Shoot
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-teal-100 text-teal-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESHOOT_REQUIRED: 'bg-red-100 text-red-700',

  // Video
  SCRIPT_APPROVED: 'bg-green-50 text-green-700',
  SHOOT_PENDING: 'bg-blue-100 text-blue-700',
  RAW_FOOTAGE_RECEIVED: 'bg-indigo-100 text-indigo-700',
  VIDEO_EDITING: 'bg-purple-100 text-purple-700',
  INTERNAL_QA: 'bg-yellow-100 text-yellow-700',
  CLIENT_REVIEW: 'bg-amber-100 text-amber-700',
  REVISION: 'bg-orange-100 text-orange-700',
  FINAL_APPROVED: 'bg-green-100 text-green-700',
  DELIVERED: 'bg-emerald-100 text-emerald-800',

  // Payment
  UNPAID: 'bg-red-100 text-red-700',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-800',

  // Payout
  PENDING: 'bg-yellow-100 text-yellow-700',

  // Task
  TODO: 'bg-gray-100 text-gray-700',
  DONE: 'bg-green-100 text-green-700',

  // Ticket
  OPEN: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',

  // Creator
  AVAILABLE: 'bg-green-100 text-green-700',
  BOOKED: 'bg-blue-100 text-blue-700',
  UNAVAILABLE: 'bg-gray-100 text-gray-600',

  // Order Request
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
};

// ─── Status Labels (human readable) ─────────────────────

export const STATUS_LABELS = {
  SCRIPT_APPROVED: 'Script Approved',
  SHOOT_PENDING: 'Shoot Pending',
  RAW_FOOTAGE_RECEIVED: 'Raw Footage',
  VIDEO_EDITING: 'Editing',
  INTERNAL_QA: 'Internal QA',
  CLIENT_REVIEW: 'Client Review',
  REVISION: 'Revision',
  FINAL_APPROVED: 'Final Approved',
  DELIVERED: 'Delivered',
  IN_PRODUCTION: 'In Production',
  PARTIALLY_DELIVERED: 'Partially Delivered',
  SENT_TO_CLIENT: 'Sent to Client',
  REVISION_REQUIRED: 'Revision Required',
  READY_FOR_SHOOT: 'Ready for Shoot',
  RESHOOT_REQUIRED: 'Reshoot Required',
  PARTIALLY_PAID: 'Partially Paid',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  TODO: 'To Do',
  UNDER_REVIEW: 'Under Review',
  CHANGES_REQUESTED: 'Changes Requested',
};

export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
};

// ─── Video Pipeline Columns ─────────────────────────────

export const VIDEO_PIPELINE_COLUMNS = [
  { id: 'SCRIPT_APPROVED', title: 'Script Approved', color: 'bg-green-500' },
  { id: 'SHOOT_PENDING', title: 'Shoot Pending', color: 'bg-blue-500' },
  { id: 'RAW_FOOTAGE_RECEIVED', title: 'Raw Footage', color: 'bg-indigo-500' },
  { id: 'VIDEO_EDITING', title: 'Editing', color: 'bg-purple-500' },
  { id: 'INTERNAL_QA', title: 'Internal QA', color: 'bg-yellow-500' },
  { id: 'CLIENT_REVIEW', title: 'Client Review', color: 'bg-amber-500' },
  { id: 'REVISION', title: 'Revision', color: 'bg-orange-500' },
  { id: 'FINAL_APPROVED', title: 'Approved', color: 'bg-emerald-500' },
  { id: 'DELIVERED', title: 'Delivered', color: 'bg-emerald-700' },
];

export const SCRIPT_PIPELINE_COLUMNS = [
  { id: 'DRAFT', title: 'Draft', color: 'bg-gray-400' },
  { id: 'ASSIGNED', title: 'Assigned', color: 'bg-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-yellow-500' },
  { id: 'SENT_TO_CLIENT', title: 'Sent to Client', color: 'bg-purple-500' },
  { id: 'REVISION_REQUIRED', title: 'Needs Revision', color: 'bg-orange-500' },
  { id: 'APPROVED', title: 'Approved', color: 'bg-green-500' },
  { id: 'READY_FOR_SHOOT', title: 'Ready for Shoot', color: 'bg-emerald-500' },
];

export const TASK_COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'DONE', title: 'Done', color: 'bg-green-500' },
];

// ─── Role Colors ────────────────────────────────────────

export const ROLE_COLORS = {
  OWNER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  SALES: 'bg-green-100 text-green-700',
  SCRIPT_WRITER: 'bg-yellow-100 text-yellow-700',
  SHOOT_MANAGER: 'bg-orange-100 text-orange-700',
  EDITOR: 'bg-indigo-100 text-indigo-700',
  CLIENT: 'bg-amber-100 text-amber-700',
};
