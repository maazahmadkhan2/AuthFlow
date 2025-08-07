import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  boolean,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums for roles and status
export const roleEnum = pgEnum('role', ['admin', 'manager', 'coordinator', 'instructor', 'student']);
export const statusEnum = pgEnum('status', ['pending', 'approved', 'rejected', 'inactive']);

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with role-based access control
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Firebase UID
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  displayName: varchar("display_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  role: roleEnum("role").notNull().default('student'),
  status: statusEnum("status").notNull().default('pending'),
  emailVerified: boolean("email_verified").notNull().default(false),
  isDefaultAdmin: boolean("is_default_admin").default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: varchar("rejected_by"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role changes audit log
export const roleChanges = pgTable("role_changes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  changedBy: varchar("changed_by").notNull().references(() => users.id),
  previousRole: roleEnum("previous_role"),
  newRole: roleEnum("new_role").notNull(),
  reason: text("reason"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// User approvals audit log
export const userApprovals = pgTable("user_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  action: varchar("action").notNull(), // 'approved', 'rejected', 'reactivated', 'deactivated'
  reason: text("reason"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
  rejectedAt: true,
});

export const insertRoleChangeSchema = createInsertSchema(roleChanges).omit({
  id: true,
  timestamp: true,
});

export const insertUserApprovalSchema = createInsertSchema(userApprovals).omit({
  id: true,
  timestamp: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RoleChange = typeof roleChanges.$inferSelect;
export type InsertRoleChange = z.infer<typeof insertRoleChangeSchema>;
export type UserApproval = typeof userApprovals.$inferSelect;
export type InsertUserApproval = z.infer<typeof insertUserApprovalSchema>;

// Role permissions mapping
export const rolePermissions = {
  admin: ['manage_users', 'manage_roles', 'view_all_data', 'manage_system', 'approve_users'],
  manager: ['manage_teams', 'view_reports', 'manage_projects', 'assign_roles'],
  coordinator: ['coordinate_activities', 'manage_schedules', 'view_team_data'],
  instructor: ['manage_students', 'manage_assignments', 'view_class_data'],
  student: ['view_courses', 'submit_assignments', 'view_grades']
} as const;

export type UserRole = keyof typeof rolePermissions;
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'inactive';