import { NextResponse } from 'next/server'

export async function GET() {
  const apiDocumentation = {
    version: '1.0.0',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://bell24h.com',
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <your-api-key>',
      endpoints: {
        login: '/api/auth/login',
        refresh: '/api/auth/refresh',
        logout: '/api/auth/logout'
      }
    },
    endpoints: {
      // User Management
      users: {
        get: '/api/users',
        getById: '/api/users/{id}',
        create: '/api/users',
        update: '/api/users/{id}',
        delete: '/api/users/{id}'
      },
      // RFQ Management
      rfqs: {
        list: '/api/rfqs',
        getById: '/api/rfqs/{id}',
        create: '/api/rfqs',
        update: '/api/rfqs/{id}',
        delete: '/api/rfqs/{id}',
        submit: '/api/rfqs/{id}/submit',
        close: '/api/rfqs/{id}/close'
      },
      // Supplier Management
      suppliers: {
        list: '/api/suppliers',
        getById: '/api/suppliers/{id}',
        search: '/api/suppliers/search',
        categories: '/api/suppliers/categories',
        ratings: '/api/suppliers/{id}/ratings'
      },
      // Transaction Management
      transactions: {
        list: '/api/transactions',
        getById: '/api/transactions/{id}',
        create: '/api/transactions',
        update: '/api/transactions/{id}',
        status: '/api/transactions/{id}/status'
      },
      // AI Features
      ai: {
        voiceRfq: '/api/voice/rfq',
        explainability: '/api/ai/explain-match',
        riskScore: '/api/supplier/risk-score',
        marketData: '/api/market/stock-data'
      },
      // Fintech Services
      fintech: {
        invoiceDiscounting: '/api/fintech/invoice-discounting',
        workingCapital: '/api/fintech/working-capital',
        applications: '/api/fintech/applications',
        status: '/api/fintech/applications/{id}/status'
      },
      // Wallet & Escrow
      wallet: {
        balance: '/api/wallet/balance',
        transactions: '/api/wallet/transactions',
        escrow: '/api/wallet/escrow',
        transfer: '/api/wallet/transfer'
      },
      // Analytics
      analytics: {
        traffic: '/api/analytics/traffic',
        revenue: '/api/analytics/revenue',
        performance: '/api/analytics/performance',
        custom: '/api/analytics/custom'
      }
    },
    webhooks: {
      rfqCreated: '/api/webhooks/rfq-created',
      transactionCompleted: '/api/webhooks/transaction-completed',
      supplierMatched: '/api/webhooks/supplier-matched',
      paymentProcessed: '/api/webhooks/payment-processed'
    },
    rateLimits: {
      standard: '1000 requests per hour',
      premium: '10000 requests per hour',
      enterprise: '100000 requests per hour'
    },
    errorCodes: {
      200: 'Success',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      429: 'Rate Limit Exceeded',
      500: 'Internal Server Error',
      503: 'Service Unavailable'
    },
    examples: {
      createRfq: {
        method: 'POST',
        url: '/api/rfqs',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer <your-api-key>'
        },
        body: {
          title: 'Steel Pipes Supply',
          description: 'Need 1000 metric tons of steel pipes',
          category: 'Metals',
          quantity: 1000,
          unit: 'metric tons',
          budget: 5000000,
          currency: 'INR',
          deadline: '2024-02-15',
          specifications: {
            diameter: '50mm',
            grade: 'A53',
            coating: 'Galvanized'
          }
        }
      },
      getSuppliers: {
        method: 'GET',
        url: '/api/suppliers?category=Metals&location=Mumbai&rating=4.5+',
        headers: {
          'Authorization': 'Bearer <your-api-key>'
        }
      }
    },
    sdk: {
      javascript: 'npm install @bell24h/api-client',
      python: 'pip install bell24h-api',
      java: 'Maven dependency available',
      dotnet: 'NuGet package available'
    },
    support: {
      documentation: 'https://docs.bell24h.com',
      apiStatus: 'https://status.bell24h.com',
      support: 'https://support.bell24h.com',
      email: 'api-support@bell24h.com'
    }
  }

  return NextResponse.json(apiDocumentation, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
} 