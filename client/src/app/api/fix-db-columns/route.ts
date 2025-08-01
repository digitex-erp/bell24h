import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
  
  const results = {
    success: false,
    checks: [] as any[],
    fixes: [] as any[],
    errors: [] as any[],
    fullError: null as any
  }
  
  try {
    console.log('Starting column fix process...')
    
    // First, let's check what tables exist
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ` as any[]
      
      results.checks.push({
        step: 'Check tables',
        success: true,
        data: tables
      })
    } catch (e) {
      results.errors.push({
        step: 'Check tables',
        error: e instanceof Error ? e.message : String(e)
      })
    }
    
    // Check current columns for each table
    const tablesToFix = ['User', 'Wallet', 'Profile']
    
    for (const tableName of tablesToFix) {
      try {
        const columns = await prisma.$queryRaw`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${tableName}
          AND table_schema = 'public'
        ` as any[]
        
        results.checks.push({
          table: tableName,
          columns: columns.map((c: any) => c.column_name)
        })
        
        // Check if we need to fix createdat -> createdAt
        const hasCreatedat = columns.some((c: any) => c.column_name === 'createdat')
        const hasCreatedAt = columns.some((c: any) => c.column_name === 'createdAt')
        
        if (hasCreatedat && !hasCreatedAt) {
          try {
            await prisma.$executeRawUnsafe(
              `ALTER TABLE "${tableName}" RENAME COLUMN "createdat" TO "createdAt"`
            )
            results.fixes.push({
              table: tableName,
              column: 'createdAt',
              status: 'FIXED'
            })
          } catch (e) {
            results.errors.push({
              table: tableName,
              column: 'createdAt',
              error: e instanceof Error ? e.message : String(e)
            })
          }
        } else {
          results.fixes.push({
            table: tableName,
            column: 'createdAt',
            status: hasCreatedAt ? 'ALREADY_CORRECT' : 'COLUMN_NOT_FOUND'
          })
        }
        
        // Check if we need to fix updatedat -> updatedAt
        const hasUpdatedat = columns.some((c: any) => c.column_name === 'updatedat')
        const hasUpdatedAt = columns.some((c: any) => c.column_name === 'updatedAt')
        
        if (hasUpdatedat && !hasUpdatedAt) {
          try {
            await prisma.$executeRawUnsafe(
              `ALTER TABLE "${tableName}" RENAME COLUMN "updatedat" TO "updatedAt"`
            )
            results.fixes.push({
              table: tableName,
              column: 'updatedAt',
              status: 'FIXED'
            })
          } catch (e) {
            results.errors.push({
              table: tableName,
              column: 'updatedAt',
              error: e instanceof Error ? e.message : String(e)
            })
          }
        } else {
          results.fixes.push({
            table: tableName,
            column: 'updatedAt',
            status: hasUpdatedAt ? 'ALREADY_CORRECT' : 'COLUMN_NOT_FOUND'
          })
        }
        
      } catch (e) {
        results.errors.push({
          table: tableName,
          step: 'Check columns',
          error: e instanceof Error ? e.message : String(e)
        })
      }
    }
    
    // Final verification
    try {
      const finalCheck = await prisma.$queryRaw`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN ('User', 'Wallet', 'Profile')
        AND column_name IN ('createdAt', 'updatedAt', 'createdat', 'updatedat')
        ORDER BY table_name, column_name
      ` as any[]
      
      results.checks.push({
        step: 'Final verification',
        columns: finalCheck
      })
    } catch (e) {
      results.errors.push({
        step: 'Final verification',
        error: e instanceof Error ? e.message : String(e)
      })
    }
    
    results.success = results.errors.length === 0
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Critical error:', error)
    results.fullError = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    }
    
    return NextResponse.json(results, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Also support POST
export async function POST() {
  return GET()
}
