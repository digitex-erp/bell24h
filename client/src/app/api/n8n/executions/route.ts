import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/n8n/executions - Get N8N executions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause = '';
    const params = [];

    if (workflowId) {
      whereClause += 'WHERE workflow_id = $1';
      params.push(workflowId);
    }

    if (status) {
      whereClause += workflowId ? ' AND status = $2' : 'WHERE status = $1';
      params.push(status);
    }

    const executions = await prisma.$queryRaw`
      SELECT 
        e.id,
        e.workflow_id as "workflowId",
        w.name as "workflowName",
        e.status,
        e.started_at as "startedAt",
        e.finished_at as "finishedAt",
        e.data,
        e.error,
        EXTRACT(EPOCH FROM (e.finished_at - e.started_at)) as "duration"
      FROM n8n_executions e
      LEFT JOIN n8n_workflows w ON e.workflow_id = w.id
      ${workflowId ? `WHERE e.workflow_id = ${workflowId}` : ''}
      ${status ? `AND e.status = '${status}'` : ''}
      ORDER BY e.started_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM n8n_executions e
      ${workflowId ? `WHERE e.workflow_id = ${workflowId}` : ''}
      ${status ? `AND e.status = '${status}'` : ''}
    `;

    return NextResponse.json({
      success: true,
      data: executions,
      pagination: {
        total: totalCount[0].count,
        limit,
        offset,
        hasMore: executions.length === limit
      }
    });
  } catch (error) {
    console.error('Error fetching N8N executions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}

// POST /api/n8n/executions - Create a new execution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, status, data, error } = body;

    if (!workflowId || !status) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID and status are required' },
        { status: 400 }
      );
    }

    const execution = await prisma.$executeRaw`
      INSERT INTO n8n_executions (workflow_id, status, data, error)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      workflowId,
      status,
      data ? JSON.stringify(data) : null,
      error || null
    ];

    return NextResponse.json({
      success: true,
      data: execution,
      message: 'Execution created successfully'
    });
  } catch (error) {
    console.error('Error creating N8N execution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create execution' },
      { status: 500 }
    );
  }
}

// PUT /api/n8n/executions/[id] - Update execution status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Execution ID is required' },
        { status: 400 }
      );
    }

    const execution = await prisma.$executeRaw`
      UPDATE n8n_executions 
      SET 
        status = COALESCE($2, status),
        finished_at = COALESCE($3, finished_at),
        data = COALESCE($4, data),
        error = COALESCE($5, error)
      WHERE id = $1
      RETURNING *
    `, [
      id,
      body.status,
      body.finishedAt ? new Date(body.finishedAt) : null,
      body.data ? JSON.stringify(body.data) : null,
      body.error || null
    ];

    return NextResponse.json({
      success: true,
      data: execution,
      message: 'Execution updated successfully'
    });
  } catch (error) {
    console.error('Error updating N8N execution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update execution' },
      { status: 500 }
    );
  }
}
