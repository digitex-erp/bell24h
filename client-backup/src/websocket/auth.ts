// src/websocket/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use your real secret in production

export function authenticate(request: any): any {
  const token = request.headers['sec-websocket-protocol'];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // user info from JWT payload
  } catch (err) {
    return null;
  }
}
