# Bell24H Enterprise Backend Integration

## Architecture Overview

```
src/backend/
├── api/                    # API Layer
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware
│   ├── routes/           # API route definitions
│   └── validators/       # Request validation
├── config/               # Configuration files
├── core/                 # Core business logic
│   ├── erp/             # Oracle ERP integration
│   ├── supplier/        # Supplier management
│   ├── rfq/             # RFQ processing
│   └── security/        # Security framework
├── database/            # Database models and migrations
├── services/            # Business services
├── utils/              # Utility functions
└── tests/              # Integration tests
```

## Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TimescaleDB
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **API Gateway**: Kong
- **Authentication**: Keycloak
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

## Key Features

1. **Oracle ERP Integration**
   - RESTful API endpoints
   - EDI message processing
   - Data transformation services
   - Transaction logging

2. **Supplier Management**
   - Qualification tracking
   - Performance metrics
   - Compliance monitoring
   - Search optimization

3. **RFQ Processing**
   - AI-powered matching
   - Document encryption
   - Workflow automation
   - Notification system

4. **Security Framework**
   - SSO integration
   - RBAC implementation
   - Data encryption
   - API protection

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   $env:PORT=3000; npm run dev
   ```

## API Documentation

API documentation is available at `/api/docs` when running the server.

## Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:e2e

# Run performance tests
npm run test:perf
```

## Deployment

See `deployment/` directory for deployment configurations and scripts. 

## API Layer

### File Structure

```
src/backend/
  api/
    controllers/
      rfq.controller.ts
      supplier.controller.ts
      wallet.controller.ts
      escrow.controller.ts
      payment.controller.ts
      analytics.controller.ts
      logistics.controller.ts
      risk.controller.ts
      video.controller.ts
      auth.controller.ts
    routes/
      rfq.routes.ts
      supplier.routes.ts
      wallet.routes.ts
      escrow.routes.ts
      payment.routes.ts
      analytics.routes.ts
      logistics.routes.ts
      risk.routes.ts
      video.routes.ts
      auth.routes.ts
    validators/
      rfq.validator.ts
      supplier.validator.ts
      wallet.validator.ts
      escrow.validator.ts
      payment.validator.ts
      analytics.validator.ts
      logistics.validator.ts
      risk.validator.ts
      video.validator.ts
      auth.validator.ts
    index.ts
```

### Code Scaffolding

#### Example: `rfq.controller.ts` (NestJS-style, can adapt to Express)

```typescript
// src/backend/api/controllers/rfq.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RFQService } from '../../core/rfq/rfq.service';
import { CreateRFQDto } from '../../core/rfq/dto/create-rfq.dto';

@Controller('rfq')
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  @Get(':id')
  async getRFQ(@Param('id') id: string) {
    return this.rfqService.getRFQById(id);
  }

  @Post()
  async createRFQ(@Body() dto: CreateRFQDto) {
    return this.rfqService.createRFQ(dto);
  }

  // Add more endpoints as needed (list, update, delete, match, etc.)
}
```

#### Example: `rfq.routes.ts` (Express-style)

```typescript
// src/backend/api/routes/rfq.routes.ts
import { Router } from 'express';
import { RFQController } from '../controllers/rfq.controller';
import { validateCreateRFQ } from '../validators/rfq.validator';

const router = Router();
const controller = new RFQController();

router.get('/:id', (req, res) => controller.getRFQ(req, res));
router.post('/', validateCreateRFQ, (req, res) => controller.createRFQ(req, res));

export default router;
```

#### Example: `rfq.validator.ts` (Joi)

```typescript
// src/backend/api/validators/rfq.validator.ts
import Joi from 'joi';

export const createRFQSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  requirements: Joi.array().items(Joi.string()).required(),
  category: Joi.string().required(),
  budget: Joi.number().optional(),
  // ...other fields
});

export function validateCreateRFQ(req, res, next) {
  const { error } = createRFQSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
}
```

#### Repeat for each resource:
- supplier, wallet, escrow, payment, analytics, logistics, risk, video, auth

#### Step-by-Step Implementation Plan (Week 1)

##### Day 1-2: Scaffold API Layer
- Create all controller, route, and validator files as above.
- Wire up API entry point (`index.ts`) to register all routes.
- Connect controllers to existing service logic.

##### Day 3-4: Integrate RazorpayX with Wallet/Escrow
- Update wallet/escrow services to call RazorpayX API for deposits, withdrawals, escrow creation/release.
- Expose endpoints in `wallet.controller.ts` and `escrow.controller.ts`.
- Add integration tests.

##### Day 5: Complete Voice RFQ API Endpoint & Basic UI
- Expose `/rfq/voice` endpoint in `rfq.controller.ts` (calls `processVoiceRFQ`).
- Add minimal React/Next.js UI for voice upload and RFQ preview.
- Test end-to-end.

##### Day 6-7: Add SHAP/LIME Explainability to AI Matching
- Integrate SHAP/LIME (or a simple explainability layer) in `ai-matching.service.ts`.
- Expose `/rfq/explain` endpoint.
- Add tests and sample outputs.

#### Integration Plan: RazorpayX-Wallet-Escrow

- On wallet deposit/withdrawal:
  - Call RazorpayX API to move funds.
  - Update wallet balance in DB.
- On escrow creation:
  - Lock funds in wallet, create escrow record, call RazorpayX if needed.
- On escrow release/refund:
  - Move funds from escrow to supplier wallet via RazorpayX.
- Endpoints:
  - `POST /wallet/deposit`, `POST /wallet/withdraw`, `POST /escrow/create`, `POST /escrow/release`, `POST /escrow/refund`

#### UI Mockup Requirements

Voice RFQ:
- Microphone button to record/upload audio.
- Show transcription and extracted RFQ fields for user confirmation.
- Submit button to create RFQ.

Supplier Risk Dashboard:
- Search/select supplier.
- Show risk score, breakdown (financial, reliability, quality, reputation).
- Show explainability (why this score?).
- Recommendations and key findings.

#### Development Environment Setup

- Live Preview:
  - Storybook for components, Vite/Next.js dev server for app.
- Hot Reload:
  - `npm run dev` (frontend), `npm run start:dev` (backend).
- Split-Screen:
  - Arrange editor and browser side by side.
- Testing:
  - Jest for backend, Cypress/Playwright for frontend.
- Error Logging:
  - Integrate Sentry or Winston for backend, browser console for frontend.
- Workflow Docs:
  - Create `DEVELOPMENT.md` with setup, scripts, and workflow tips.

#### Which Feature to Tackle First?

Start with:
Build the missing API layer (controllers/routes/validators) for all existing backend services.

Why?
- All other features (payments, voice RFQ, explainability, video, analytics) depend on a robust API.
- Quickest way to unlock frontend/mobile integration and testing.
- Enables parallel work on other features.

Ready to scaffold the API layer?
Let me know if you want the full code for all controllers/routes/validators, or if you want to start with a specific resource (e.g., RFQ, wallet, escrow) first! 