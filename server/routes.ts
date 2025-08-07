import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default admin on server start
  try {
    const created = await storage.createDefaultAdmin();
    if (created) {
      console.log('🚀 Default admin created:');
      console.log('📧 Email: admin@system.local');
      console.log('🔑 Password: AdminPass123!');
      console.log('🎯 This admin can approve and manage all users');
    }
  } catch (error) {
    console.error('Error initializing default admin:', error);
  }

  // User management endpoints
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/users/pending', async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      res.status(500).json({ error: 'Failed to fetch pending users' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Special endpoint for default admin
  app.get('/api/users/default-admin', async (req, res) => {
    try {
      const admin = await storage.getUserByEmail('admin@system.local');
      if (!admin) {
        return res.status(404).json({ error: 'Default admin not found' });
      }
      res.json(admin);
    } catch (error) {
      console.error('Error fetching default admin:', error);
      res.status(500).json({ error: 'Failed to fetch default admin' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.post('/api/users/:id/approve', async (req, res) => {
    try {
      const { approvedBy } = req.body;
      if (!approvedBy) {
        return res.status(400).json({ error: 'approvedBy is required' });
      }
      
      await storage.approveUser(req.params.id, approvedBy);
      res.json({ message: 'User approved successfully' });
    } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ error: 'Failed to approve user' });
    }
  });

  app.post('/api/users/:id/reject', async (req, res) => {
    try {
      const { rejectedBy, reason } = req.body;
      if (!rejectedBy) {
        return res.status(400).json({ error: 'rejectedBy is required' });
      }
      
      await storage.rejectUser(req.params.id, rejectedBy, reason);
      res.json({ message: 'User rejected successfully' });
    } catch (error) {
      console.error('Error rejecting user:', error);
      res.status(500).json({ error: 'Failed to reject user' });
    }
  });

  app.post('/api/users/:id/role', async (req, res) => {
    try {
      const { role, changedBy, reason } = req.body;
      if (!role || !changedBy) {
        return res.status(400).json({ error: 'role and changedBy are required' });
      }
      
      await storage.updateUserRole(req.params.id, role, changedBy, reason);
      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  app.get('/api/role-changes', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const changes = await storage.getRoleChangeHistory(userId);
      res.json(changes);
    } catch (error) {
      console.error('Error fetching role changes:', error);
      res.status(500).json({ error: 'Failed to fetch role changes' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}