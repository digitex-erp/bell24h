export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ 
    symbol: 'NIFTY', 
    price: 24500, 
    status: 'ok' 
  });
}
