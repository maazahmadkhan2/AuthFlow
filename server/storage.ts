import {
  users,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Simple in-memory storage for when MySQL is not available
let memoryUsers: User[] = [];
let nextId = 1;

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Additional operations for email/password auth
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithPassword(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<User>;
  validatePassword(email: string, password: string): Promise<User | null>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    if (!db) {
      // Use memory storage
      return memoryUsers.find(u => u.id.toString() === id);
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!db) {
      // Use memory storage
      const existingUser = userData.email ? memoryUsers.find(u => u.email === userData.email) : null;
      
      if (existingUser) {
        // Update existing user
        Object.assign(existingUser, userData, { updatedAt: new Date() });
        return existingUser;
      } else {
        // Create new user
        const newUser: User = {
          id: nextId++,
          email: userData.email || null,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          profileImageUrl: userData.profileImageUrl || null,
          password: userData.password || null,
          emailVerified: userData.emailVerified || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryUsers.push(newUser);
        return newUser;
      }
    }

    // Database storage
    const existingUser = userData.email ? await this.getUserByEmail(userData.email) : null;
    
    if (existingUser) {
      // Update existing user
      await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));
      
      // Fetch and return updated user
      const [user] = await db.select().from(users).where(eq(users.id, existingUser.id));
      return user;
    } else {
      // Insert new user
      const result = await db
        .insert(users)
        .values(userData);
      
      // Get the inserted user by insertId
      const insertId = result[0].insertId;
      const [user] = await db.select().from(users).where(eq(users.id, insertId));
      return user;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) {
      // Use memory storage
      return memoryUsers.find(u => u.email === email);
    }
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUserWithPassword(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    if (!db) {
      // Use memory storage
      const newUser: User = {
        id: nextId++,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: null,
        password: hashedPassword,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryUsers.push(newUser);
      return newUser;
    }
    
    const result = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        emailVerified: false,
      });
    
    // Get the inserted user by insertId
    const insertId = result[0].insertId;
    const [user] = await db.select().from(users).where(eq(users.id, insertId));
    return user;
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}

export const storage = new DatabaseStorage();
