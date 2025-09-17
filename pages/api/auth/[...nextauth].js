/**
 * NextAuth API Route Handler
 * This file handles all authentication requests
 */

import NextAuth from 'next-auth';
import { authOptions } from '../../../lib/auth';

export default NextAuth(authOptions);