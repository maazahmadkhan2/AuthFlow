import type { Express } from "express";
import { createServer, type Server } from "http";
import { sendVerificationEmail, sendCustomVerificationEmail, isEmailServiceAvailable, getVerificationUrlTemplate } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running with Firestore-only setup' });
  });

  // Email service status endpoint
  app.get('/api/email-service/status', (req, res) => {
    res.json({ 
      available: isEmailServiceAvailable(),
      verificationUrlTemplate: getVerificationUrlTemplate()
    });
  });

  // Send verification email endpoint
  app.post('/api/send-verification-email', async (req, res) => {
    try {
      const { userEmail, userName, actionCode, baseUrl } = req.body;

      if (!userEmail || !actionCode) {
        return res.status(400).json({ 
          error: 'Missing required fields: userEmail and actionCode are required' 
        });
      }

      const success = await sendVerificationEmail({
        userEmail,
        userName: userName || 'User',
        actionCode,
        baseUrl: baseUrl || `${req.protocol}://${req.get('host')}`
      });

      if (success) {
        res.json({ success: true, message: 'Verification email sent successfully' });
      } else {
        res.status(500).json({ 
          error: 'Failed to send verification email',
          emailServiceAvailable: isEmailServiceAvailable()
        });
      }
    } catch (error: any) {
      console.error('Send verification email error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  });

  // Send custom email endpoint
  app.post('/api/send-custom-email', async (req, res) => {
    try {
      const { to, subject, html, text, from } = req.body;

      if (!to || !subject || (!html && !text)) {
        return res.status(400).json({ 
          error: 'Missing required fields: to, subject, and either html or text are required' 
        });
      }

      const success = await sendCustomVerificationEmail({
        to,
        subject,
        html: html || text,
        text: text || '',
        from
      });

      if (success) {
        res.json({ success: true, message: 'Email sent successfully' });
      } else {
        res.status(500).json({ 
          error: 'Failed to send email',
          emailServiceAvailable: isEmailServiceAvailable()
        });
      }
    } catch (error: any) {
      console.error('Send custom email error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  });

  // All user management is now handled client-side with Firestore
  // No backend API endpoints needed for user operations

  const httpServer = createServer(app);
  return httpServer;
}