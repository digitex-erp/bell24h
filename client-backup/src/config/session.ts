import session from 'express-session';

export const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'default-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_LIFETIME || '86400000'), // 24 hours
    },
};
