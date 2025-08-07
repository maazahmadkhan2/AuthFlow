import {
  users,
  roleChanges,
  userApprovals,
  type User,
  type InsertUser,
  type UserRole,
  type UserStatus,
  type InsertRoleChange,
  type InsertUserApproval,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  
  // User approval operations
  approveUser(userId: string, approvedBy: string): Promise<void>;
  rejectUser(userId: string, rejectedBy: string, reason?: string): Promise<void>;
  
  // Role management operations
  updateUserRole(userId: string, newRole: UserRole, changedBy: string, reason?: string): Promise<void>;
  getRoleChangeHistory(userId?: string): Promise<any[]>;
  
  // Admin operations
  createDefaultAdmin(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        status: 'pending', // All new users are pending approval
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getPendingUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.status, 'pending'))
      .orderBy(desc(users.createdAt));
  }

  async approveUser(userId: string, approvedBy: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Update user status
      await tx
        .update(users)
        .set({
          status: 'approved',
          approvedAt: new Date(),
          approvedBy,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log approval
      await tx.insert(userApprovals).values({
        userId,
        approvedBy,
        action: 'approved',
      });
    });
  }

  async rejectUser(userId: string, rejectedBy: string, reason?: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Update user status
      await tx
        .update(users)
        .set({
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy,
          rejectionReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log rejection
      await tx.insert(userApprovals).values({
        userId,
        rejectedBy,
        action: 'rejected',
        reason,
      });
    });
  }

  async updateUserRole(userId: string, newRole: UserRole, changedBy: string, reason?: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Get current user to log previous role
      const [currentUser] = await tx.select().from(users).where(eq(users.id, userId));
      
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Update user role
      await tx
        .update(users)
        .set({
          role: newRole,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log role change
      await tx.insert(roleChanges).values({
        userId,
        changedBy,
        previousRole: currentUser.role,
        newRole,
        reason,
      });
    });
  }

  async getRoleChangeHistory(userId?: string): Promise<any[]> {
    if (userId) {
      return await db
        .select()
        .from(roleChanges)
        .where(eq(roleChanges.userId, userId))
        .orderBy(desc(roleChanges.timestamp));
    } else {
      return await db
        .select()
        .from(roleChanges)
        .orderBy(desc(roleChanges.timestamp));
    }
  }

  async createDefaultAdmin(): Promise<boolean> {
    try {
      // Check if default admin already exists
      const existingAdmin = await this.getUserByEmail('admin@system.local');
      
      if (existingAdmin) {
        console.log('Default admin already exists');
        return false;
      }

      // Create default admin with fixed ID
      const [admin] = await db
        .insert(users)
        .values({
          id: 'default-admin', // Fixed ID for default admin
          email: 'admin@system.local',
          firstName: 'System',
          lastName: 'Administrator',
          displayName: 'System Administrator',
          role: 'admin',
          status: 'approved',
          emailVerified: true,
          isDefaultAdmin: true,
          updatedAt: new Date(),
        })
        .returning();
        
      console.log('Default admin created successfully');
      return true;
    } catch (error) {
      console.error('Error creating default admin:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();