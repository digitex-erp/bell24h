import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { start, end } = req.query;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/monitoring/events/errors?start=${start}&end=${end}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch error logs');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 