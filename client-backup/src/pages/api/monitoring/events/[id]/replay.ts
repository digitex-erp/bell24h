import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/monitoring/events/${id}/replay`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to replay event');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error replaying event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 