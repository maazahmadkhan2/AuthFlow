import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running with Firestore-only setup' });
  });

  // All user management is now handled client-side with Firestore
  // No backend API endpoints needed for user operations

  const httpServer = createServer(app);
  return httpServer;
}