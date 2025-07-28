import { NextResponse } from 'next/server'
import { db } from '@/lib/db-connection'
import { generateSecret, generateToken, verifyToken } from 'node-2fa'

export async function POST(request: Request) {
  try {
    const { action, userId, token, secret } = await request.json()

    switch (action) {
      case 'setup':
        // Generate new 2FA secret for user
        const secretData = generateSecret({
          name: 'Bell24h',
          account: userId
        })

        // Store secret in database (in production, encrypt this)
        await db.user.update({
          where: { id: userId },
          data: {
            twoFactorSecret: secretData.secret,
            twoFactorEnabled: false
          }
        })

        return NextResponse.json({
          success: true,
          secret: secretData.secret,
          qrCode: secretData.qr,
          message: '2FA setup initiated'
        })

      case 'verify':
        // Verify 2FA token
        const verification = verifyToken(secret, token)
        
        if (verification && verification.delta === 0) {
          // Enable 2FA for user
          await db.user.update({
            where: { id: userId },
            data: {
              twoFactorEnabled: true
            }
          })

          return NextResponse.json({
            success: true,
            message: '2FA enabled successfully'
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'Invalid 2FA token'
          }, { status: 400 })
        }

      case 'authenticate':
        // Verify 2FA during login
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { twoFactorSecret: true, twoFactorEnabled: true }
        })

        if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
          return NextResponse.json({
            success: false,
            message: '2FA not enabled for this user'
          }, { status: 400 })
        }

        const authVerification = verifyToken(user.twoFactorSecret, token)
        
        if (authVerification && Math.abs(authVerification.delta) <= 1) {
          return NextResponse.json({
            success: true,
            message: '2FA authentication successful'
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'Invalid 2FA token'
          }, { status: 400 })
        }

      case 'disable':
        // Disable 2FA for user
        await db.user.update({
          where: { id: userId },
          data: {
            twoFactorEnabled: false,
            twoFactorSecret: null
          }
        })

        return NextResponse.json({
          success: true,
          message: '2FA disabled successfully'
        })

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('2FA API error:', error)
    return NextResponse.json({
      success: false,
      message: '2FA operation failed'
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID required'
      }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true }
    })

    return NextResponse.json({
      success: true,
      twoFactorEnabled: user?.twoFactorEnabled || false
    })

  } catch (error) {
    console.error('2FA status check error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to check 2FA status'
    }, { status: 500 })
  }
} 