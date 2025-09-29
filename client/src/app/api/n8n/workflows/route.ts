import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/n8n/workflows - Get all N8N workflows
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let whereClause = {};
    if (status) {
      whereClause = { ...whereClause, status };
    }
    if (category) {
      whereClause = { ...whereClause, category };
    }

    const workflows = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        description,
        status,
        nodes,
        connections,
        settings,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM n8n_workflows
      ${status ? `WHERE status = '${status}'` : ''}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: workflows,
      count: workflows.length
    });
  } catch (error) {
    console.error('Error fetching N8N workflows:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

// POST /api/n8n/workflows - Create a new N8N workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, nodes, connections, settings, category } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const workflow = await prisma.$executeRaw`
      INSERT INTO n8n_workflows (name, description, status, nodes, connections, settings, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      name,
      description,
      'active',
      JSON.stringify(nodes || {}),
      JSON.stringify(connections || {}),
      JSON.stringify(settings || {}),
      category || 'General'
    ];

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow created successfully'
    });
  } catch (error) {
    console.error('Error creating N8N workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

// PUT /api/n8n/workflows/[id] - Update a workflow
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const workflow = await prisma.$executeRaw`
      UPDATE n8n_workflows 
      SET 
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        nodes = COALESCE($5, nodes),
        connections = COALESCE($6, connections),
        settings = COALESCE($7, settings),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      id,
      body.name,
      body.description,
      body.status,
      body.nodes ? JSON.stringify(body.nodes) : null,
      body.connections ? JSON.stringify(body.connections) : null,
      body.settings ? JSON.stringify(body.settings) : null
    ];

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow updated successfully'
    });
  } catch (error) {
    console.error('Error updating N8N workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// DELETE /api/n8n/workflows/[id] - Delete a workflow
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    await prisma.$executeRaw`
      DELETE FROM n8n_workflows WHERE id = $1
    `, [id];

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting N8N workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
