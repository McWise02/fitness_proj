/* server.js */
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json'); // keep your file name

// ---- ROUTES (fix the filenames to your actual routes) ----
const gymRoutes = require('./routes/gymRoutes');
const machineRoutes = require('./routes/machineRoutes');
const trainerRoutes = require('./routes/trainerRoutes'); // if you have it
const userRoutes = require('./routes/userRoutes');       // your /auth routes

// ----------------------------------------------------------------------------
// PASSPORT (GitHub)
// ----------------------------------------------------------------------------
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/auth/github/callback',
      scope: ['read:user'], // add user:email if you read emails
    },
    // In production, upsert user in DB and pass that doc to done()
    (accessToken, refreshToken, profile, done) => {
      const user = {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.photos?.[0]?.value,
        provider: 'github',
      };
      return done(null, user);
    }
  )
);

// ----------------------------------------------------------------------------
// APP + MIDDLEWARE
// ----------------------------------------------------------------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <— needed for form POST body

// simple CORS (adjust as needed)
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24
    }
    // store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, _res, next) => {
  console.log('Cookies:', req.headers.cookie);
  console.log('SessionID:', req.sessionID);
  console.log('Session has userId?', !!req.session?.userId);
  next();
});

// ----------------------------------------------------------------------------
// SWAGGER
// ----------------------------------------------------------------------------
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    swaggerOptions: {
      requestInterceptor: (req) => {
        // If you serve Swagger from a different origin, you might need:
        req.credentials = 'include';
        return req;
      },
      responseInterceptor: (res) => {
        try {
          if (res && res.status === 401 && typeof window !== 'undefined') {
            window.location = '/auth/github';
          }
        } catch (_) {}
        return res;
      },
    },
  })
);

app.use((req, _res, next) => {
  console.log('auth?', req.isAuthenticated && req.isAuthenticated(), 'sessionId?', req.sessionID);
  next();
});

// ----------------------------------------------------------------------------
// DB CONNECT (Mongoose) then mount routes
// ----------------------------------------------------------------------------
const port = process.env.PORT || 8080;
const host = process.env.HOST || 'localhost';

(async () => {
  try {
    if (process.env.MONGOOSE_DEBUG === 'true') {
      mongoose.set('debug', true);
    }

    await mongoose.connect(process.env.MONGO_DB_URI, {
      dbName: 'final_project',
      autoIndex: true, // helpful in dev
    });

    console.log(
      `Mongoose connected to db "${mongoose.connection.name}" @ ${mongoose.connection.host}:${mongoose.connection.port}`
    );

    // Mount routes ONLY after DB connect
    app.use('/auth', userRoutes);
    app.use('/gyms', gymRoutes);
    app.use('/machines', machineRoutes);
    app.use('/trainers', trainerRoutes); // if applicable

    // Healthcheck
    app.get('/health', (_req, res) =>
      res.status(200).json({ ok: true, db: mongoose.connection.readyState })
    );

    app.listen(port, () =>
      console.log(`API listening on http://${host}:${port} (docs at /api-docs)`)
    );
  } catch (err) {
    console.error('Mongo connection failed:', err);
    process.exit(1);
  }
})();

// ----------------------------------------------------------------------------
// Graceful shutdown (optional)
// ----------------------------------------------------------------------------
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
  } finally {
    process.exit(0);
  }
});
