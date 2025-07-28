import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { RouteOptimizationService, Location } from '../../../../services/logistics/route-optimization-service';
import { validateRequest } from '../../../../lib/middleware/validate-request';
import { rateLimiter } from '../../../../lib/middleware/rate-limiter';
import { z } from 'zod';

// Initialize the route optimization service
const routeOptimizationService = new RouteOptimizationService();

// Validation schema for route optimization request
const routeOptimizationSchema = z.object({
  origin: z.object({
    address: z.string().min(1, "Origin address is required"),
    city: z.string().min(1, "Origin city is required"),
    state: z.string().optional(),
    country: z.string().min(1, "Origin country is required"),
    postalCode: z.string().min(1, "Origin postal code is required"),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
  destination: z.object({
    address: z.string().min(1, "Destination address is required"),
    city: z.string().min(1, "Destination city is required"),
    state: z.string().optional(),
    country: z.string().min(1, "Destination country is required"),
    postalCode: z.string().min(1, "Destination postal code is required"),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
  options: z.object({
    avoidTolls: z.boolean().optional(),
    avoidHighways: z.boolean().optional(),
    optimizeFor: z.enum(['distance', 'time', 'fuel']).optional(),
    departureTime: z.string().optional(), // ISO date string
    vehicleType: z.enum(['car', 'truck', 'van']).optional(),
    trafficModel: z.enum(['best_guess', 'pessimistic', 'optimistic']).optional(),
    getAlternatives: z.boolean().optional(),
  }).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to access this resource' });
  }

  // Only allow POST method for route optimization
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Apply rate limiting
  const isRateLimited = await rateLimiter(req, res, 'logistics-api');
  if (isRateLimited) {
    return; // Response already sent by the rate limiter
  }

  try {
    // Validate request data
    const validationResult = await validateRequest(req, res, routeOptimizationSchema);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid request data', errors: validationResult.errors });
    }

    const { origin, destination, options = {} } = validationResult.data;

    // Get optimized route or route alternatives
    if (options.getAlternatives) {
      const routes = await routeOptimizationService.getRouteAlternatives(
        origin as Location,
        destination as Location,
        options
      );
      
      return res.status(200).json({
        alternatives: routes,
        count: routes.length,
      });
    } else {
      const route = await routeOptimizationService.getOptimalRoute(
        origin as Location,
        destination as Location,
        options
      );
      
      return res.status(200).json(route);
    }
  } catch (error) {
    console.error('Error optimizing route:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to optimize route' 
    });
  }
}
