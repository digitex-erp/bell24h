import { NextResponse } from 'next/server'
import { db } from '@/lib/db-connection'

export async function POST(request: Request) {
  try {
    const { action, clientId, config } = await request.json()

    switch (action) {
      case 'create':
        return await createWhiteLabelClient(clientId, config)
      
      case 'update':
        return await updateWhiteLabelClient(clientId, config)
      
      case 'delete':
        return await deleteWhiteLabelClient(clientId)
      
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid white-label action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('White-label API error:', error)
    return NextResponse.json({
      success: false,
      message: 'White-label operation failed'
    }, { status: 500 })
  }
}

async function createWhiteLabelClient(clientId: string, config: any) {
  try {
    // Create white-label client configuration
    const whiteLabelConfig = await db.whiteLabelClient.create({
      data: {
        clientId,
        subdomain: config.subdomain,
        companyName: config.companyName,
        logo: config.logo,
        primaryColor: config.primaryColor || '#2563eb',
        secondaryColor: config.secondaryColor || '#1e40af',
        customDomain: config.customDomain,
        theme: config.theme || 'default',
        features: config.features || [],
        contactEmail: config.contactEmail,
        supportPhone: config.supportPhone,
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'White-label client created successfully',
      data: {
        clientId: whiteLabelConfig.clientId,
        subdomain: whiteLabelConfig.subdomain,
        customDomain: whiteLabelConfig.customDomain,
        status: whiteLabelConfig.status
      }
    })

  } catch (error) {
    throw error
  }
}

async function updateWhiteLabelClient(clientId: string, config: any) {
  try {
    const updatedConfig = await db.whiteLabelClient.update({
      where: { clientId },
      data: {
        logo: config.logo,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        customDomain: config.customDomain,
        theme: config.theme,
        features: config.features,
        contactEmail: config.contactEmail,
        supportPhone: config.supportPhone,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'White-label client updated successfully',
      data: {
        clientId: updatedConfig.clientId,
        subdomain: updatedConfig.subdomain,
        customDomain: updatedConfig.customDomain,
        status: updatedConfig.status
      }
    })

  } catch (error) {
    throw error
  }
}

async function deleteWhiteLabelClient(clientId: string) {
  try {
    await db.whiteLabelClient.update({
      where: { clientId },
      data: { status: 'inactive' }
    })

    return NextResponse.json({
      success: true,
      message: 'White-label client deactivated successfully'
    })

  } catch (error) {
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const subdomain = searchParams.get('subdomain')

    if (clientId) {
      // Get specific white-label client configuration
      const client = await db.whiteLabelClient.findUnique({
        where: { clientId }
      })

      if (!client) {
        return NextResponse.json({
          success: false,
          message: 'White-label client not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          clientId: client.clientId,
          subdomain: client.subdomain,
          companyName: client.companyName,
          logo: client.logo,
          primaryColor: client.primaryColor,
          secondaryColor: client.secondaryColor,
          customDomain: client.customDomain,
          theme: client.theme,
          features: client.features,
          contactEmail: client.contactEmail,
          supportPhone: client.supportPhone,
          status: client.status
        }
      })
    }

    if (subdomain) {
      // Get white-label client by subdomain
      const client = await db.whiteLabelClient.findFirst({
        where: { subdomain }
      })

      if (!client) {
        return NextResponse.json({
          success: false,
          message: 'White-label client not found for subdomain'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          clientId: client.clientId,
          subdomain: client.subdomain,
          companyName: client.companyName,
          logo: client.logo,
          primaryColor: client.primaryColor,
          secondaryColor: client.secondaryColor,
          customDomain: client.customDomain,
          theme: client.theme,
          features: client.features,
          contactEmail: client.contactEmail,
          supportPhone: client.supportPhone,
          status: client.status
        }
      })
    }

    // Get all white-label clients
    const clients = await db.whiteLabelClient.findMany({
      where: { status: 'active' },
      select: {
        clientId: true,
        subdomain: true,
        companyName: true,
        customDomain: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        total: clients.length,
        clients: clients
      }
    })

  } catch (error) {
    console.error('White-label client fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch white-label clients'
    }, { status: 500 })
  }
} 