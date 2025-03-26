import express, { Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';
import { connectToDatabase, sessionStore } from './config/db';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Secure Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'strict'
  }
}));

// Enhanced Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      log(`${req.method} ${path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// Data Sanitization Middleware
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(body) {
    // Remove sensitive data from responses
    if (body && typeof body === 'object') {
      if ('password' in body) delete body.password;
      if ('__v' in body) delete body.__v;
    }
    return originalJson.call(this, body);
  };
  next();
});

// Error Interface
interface HttpError extends Error {
  status?: number;
  expose?: boolean;
}

// Startup Sequence
(async () => {
  try {
    // Database Connection
    await connectToDatabase();
    log('✅ Database connection established');

    // Route Registration
    const server = await registerRoutes(app);
    log('✅ Routes registered');

    // Error Handler
    app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || 500;
      const message = process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'An error occurred';

      if (status >= 500) {
        log(`❗ Server Error: ${err.stack}`);
      }

      res.status(status).json({
        status: 'error',
        message
      });
    });

    // Vite Setup (Dev only)
    if (process.env.NODE_ENV === 'development') {
      await setupVite(app, server);
      log('⚡ Vite dev server ready');
    } else {
      serveStatic(app);
      log('📦 Serving static production assets');
    }

    // Server Startup
    const port = process.env.PORT || 5000;
    server.listen(port, '0.0.0.0', () => {
      log(`🚀 Server running on port ${port}`);
      log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`   Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
    });

  } catch (error) {
    log(`❌ Fatal startup error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
})();