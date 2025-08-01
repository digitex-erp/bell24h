import { NextResponse } from 'next/server'
import { db } from '@/lib/db-connection'

export async function POST(request: Request) {
  try {
    const { action, ticketData } = await request.json()

    switch (action) {
      case 'create-ticket':
        return await createSupportTicket(ticketData)
      
      case 'update-ticket':
        return await updateSupportTicket(ticketData)
      
      case 'add-response':
        return await addTicketResponse(ticketData)
      
      case 'escalate-ticket':
        return await escalateTicket(ticketData)
      
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid support action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Support API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Support operation failed'
    }, { status: 500 })
  }
}

async function createSupportTicket(ticketData: any) {
  try {
    const ticket = await db.supportTicket.create({
      data: {
        ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        userId: ticketData.userId,
        category: ticketData.category,
        priority: ticketData.priority || 'medium',
        subject: ticketData.subject,
        description: ticketData.description,
        status: 'open',
        assignedTo: null,
        slaLevel: ticketData.slaLevel || 'standard',
        attachments: ticketData.attachments || [],
        tags: ticketData.tags || []
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully',
      data: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        priority: ticket.priority,
        slaLevel: ticket.slaLevel
      }
    })

  } catch (error) {
    throw error
  }
}

async function updateSupportTicket(ticketData: any) {
  try {
    const { ticketId, ...updateData } = ticketData

    const ticket = await db.supportTicket.update({
      where: { ticketId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Support ticket updated successfully',
      data: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        priority: ticket.priority
      }
    })

  } catch (error) {
    throw error
  }
}

async function addTicketResponse(ticketData: any) {
  try {
    const { ticketId, response, agentId, isInternal } = ticketData

    const ticketResponse = await db.ticketResponse.create({
      data: {
        ticketId,
        agentId,
        response,
        isInternal: isInternal || false,
        createdAt: new Date()
      }
    })

    // Update ticket status if response is from agent
    if (agentId) {
      await db.supportTicket.update({
        where: { ticketId },
        data: {
          status: 'in-progress',
          lastResponseAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Response added successfully',
      data: {
        responseId: ticketResponse.id,
        ticketId: ticketResponse.ticketId
      }
    })

  } catch (error) {
    throw error
  }
}

async function escalateTicket(ticketData: any) {
  try {
    const { ticketId, escalationReason, escalatedTo } = ticketData

    const ticket = await db.supportTicket.update({
      where: { ticketId },
      data: {
        status: 'escalated',
        priority: 'high',
        escalatedTo,
        escalationReason,
        escalatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Ticket escalated successfully',
      data: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        priority: ticket.priority,
        escalatedTo: ticket.escalatedTo
      }
    })

  } catch (error) {
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    if (ticketId) {
      // Get specific ticket with responses
      const ticket = await db.supportTicket.findUnique({
        where: { ticketId },
        include: {
          responses: {
            orderBy: { createdAt: 'asc' }
          },
          user: {
            select: { name: true, email: true, companyName: true }
          }
        }
      })

      if (!ticket) {
        return NextResponse.json({
          success: false,
          message: 'Ticket not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: ticket
      })
    }

    // Build where clause for filtering
    const whereClause: any = {}
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (status) {
      whereClause.status = status
    }
    
    if (priority) {
      whereClause.priority = priority
    }

    // Get tickets with filters
    const tickets = await db.supportTicket.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, companyName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Get ticket statistics
    const stats = await db.supportTicket.groupBy({
      by: ['status'],
      _count: {
        ticketId: true
      }
    })

    const priorityStats = await db.supportTicket.groupBy({
      by: ['priority'],
      _count: {
        ticketId: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        tickets,
        statistics: {
          total: tickets.length,
          byStatus: stats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.ticketId
            return acc
          }, {} as any),
          byPriority: priorityStats.reduce((acc, stat) => {
            acc[stat.priority] = stat._count.ticketId
            return acc
          }, {} as any)
        }
      }
    })

  } catch (error) {
    console.error('Support tickets fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch support tickets'
    }, { status: 500 })
  }
} 