import { z } from "zod";

// User Roles
export const userRoles = ['admin', 'manager', 'coordinator', 'instructor', 'student'] as const;
export const roleSchema = z.enum(userRoles);

// Permissions for each role
export const permissions = {
  admin: ['manage_users', 'manage_roles', 'view_all_data', 'manage_system'],
  manager: ['manage_coordinators', 'manage_instructors', 'view_reports', 'manage_courses'],
  coordinator: ['manage_instructors', 'manage_students', 'view_course_data'],
  instructor: ['manage_students', 'manage_assignments', 'view_class_data'],
  student: ['view_courses', 'submit_assignments', 'view_grades']
} as const;

// Firebase User Document Schema
export const firebaseUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  emailVerified: z.boolean(),
  profileImageUrl: z.string().nullable(),
  role: roleSchema.default('student'),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isApproved: z.boolean().optional().default(false), // Users need admin approval
  isDefaultAdmin: z.boolean().optional(), // Flag for system admin
  approvedAt: z.any().optional(), // Firestore Timestamp
  approvedBy: z.string().optional(), // Admin who approved
  rejectedAt: z.any().optional(), // Firestore Timestamp
  rejectedBy: z.string().optional(), // Admin who rejected
  rejectionReason: z.string().optional(), // Reason for rejection
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
});

// Firebase Post Document Schema
export const firebasePostSchema = z.object({
  id: z.string().optional(), // Document ID
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  published: z.boolean(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
});

// Form Schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(['student', 'instructor']).default('student'), // Only student and instructor allowed
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Role management schemas
export const assignRoleSchema = z.object({
  userId: z.string(),
  role: roleSchema,
  assignedBy: z.string(),
});

export const updateUserRoleSchema = z.object({
  role: roleSchema,
  isActive: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
});

// Type exports
export type UserRole = z.infer<typeof roleSchema>;
export type FirebaseUser = z.infer<typeof firebaseUserSchema>;
export type FirebasePost = z.infer<typeof firebasePostSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type CreatePostForm = z.infer<typeof createPostSchema>;
export type AssignRoleForm = z.infer<typeof assignRoleSchema>;
export type UpdateUserRoleForm = z.infer<typeof updateUserRoleSchema>;

// Add missing imports
export { z } from 'zod';