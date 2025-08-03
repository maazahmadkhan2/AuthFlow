import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Firebase-only backend',
      timestamp: new Date().toISOString()
    });
  });

  // All authentication is handled by Firebase on the frontend
  // No backend auth routes needed

  return createServer(app);
}