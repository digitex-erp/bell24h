# Bell24H Emergency Response Protocol

This document outlines emergency procedures for the Bell24H TradeEscrow platform, focusing on the pause functionality implemented across both smart contracts and oracle services.

## Pause Functionality

The Bell24H platform implements a comprehensive pause mechanism that can halt critical operations during emergencies, maintenance periods, or when security issues are detected. The pause functionality is implemented at two levels:

1. **Smart Contract Level**: Using OpenZeppelin's PausableUpgradeable pattern
2. **Oracle Service Level**: Using a custom pause service with API controls

When paused:
- All state-changing contract functions will revert with "TradeEscrow: Contract is paused"
- Oracle service will stop processing blockchain events
- Task queue will stop processing new tasks and message queue consumption
- Scheduled jobs (except for health monitoring) will be skipped
- API endpoints will remain available for monitoring and control

## Emergency Response Team

The Emergency Response Team should include:
- Technical Lead
- Smart Contract Engineer
- Oracle Service Engineer
- Security Officer

Each member should have the necessary access rights to execute their responsibilities during an emergency.

## Pause Authorization

The following roles are authorized to trigger pause functionality:

1. **PAUSER_ROLE** - For smart contract pausing
   - Granted to: Admin wallets, Security Officer wallet, Oracle wallet
   - Access Control: Managed through AccessControl on the smart contract

2. **API Key Holders** - For oracle service pausing
   - Limited to: Operations team, Monitoring systems
   - Access Control: API key authentication

## Emergency Response Process

### Step 1: Identification

An emergency situation may be identified through:
- Automated monitoring alerts
- User reports of suspicious activity
- Security vulnerability disclosures
- Detected anomalies in transaction patterns

### Step 2: Initial Assessment

The Technical Lead or on-call engineer should:
1. Assess the severity of the issue
2. Determine if a pause is necessary
3. Document the issue and initial findings

### Step 3: Pause Execution

If a pause is required:

#### For Contract-Level Pause:

```javascript
// Using ethers.js
const PAUSER_ROLE = await tradeEscrow.PAUSER_ROLE();
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const tradeEscrow = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
const tx = await tradeEscrow.pause();
await tx.wait();
console.log("Contract paused", tx.hash);
```

#### For Oracle Service Pause:

**Via API:**
```bash
curl -X POST https://oracle-api.bell24h.com/pause \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"reason": "Emergency response to [ISSUE DESCRIPTION]"}'
```

**Via Admin Console:**
1. Log in to the Oracle Admin Console
2. Navigate to System Controls
3. Click "Emergency Pause" button
4. Enter reason for the pause
5. Confirm action

### Step 4: Communication

Once the system is paused:
1. Notify all stakeholders according to the communication plan
2. Post status update on status page
3. Inform customer support team with appropriate messaging for users

### Step 5: Issue Resolution

While the system is paused:
1. Investigate the root cause
2. Develop and test a fix
3. Prepare an implementation plan
4. Document all actions taken

### Step 6: Recovery

After the issue is resolved:

#### For Contract-Level Unpause:

```javascript
// Using ethers.js
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const tradeEscrow = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
const tx = await tradeEscrow.unpause();
await tx.wait();
console.log("Contract unpaused", tx.hash);
```

#### For Oracle Service Unpause:

**Via API:**
```bash
curl -X POST https://oracle-api.bell24h.com/unpause \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"reason": "Recovery complete - [RESOLUTION SUMMARY]"}'
```

**Via Admin Console:**
1. Log in to the Oracle Admin Console
2. Navigate to System Controls
3. Click "Unpause System" button
4. Enter reason for the unpause
5. Confirm action

### Step 7: Post-Incident Review

After recovery:
1. Conduct a post-mortem meeting
2. Document the incident, response, and resolution
3. Update procedures based on lessons learned
4. Implement preventative measures to avoid similar incidents

## Health Monitoring During Pause

Even while the system is paused, the following monitoring remains active:
- Oracle health check (runs every hour)
- Contract event monitoring (for pause/unpause events)
- API health endpoint (`/health`)

## Testing the Pause Functionality

The pause functionality should be tested regularly:
1. Conduct quarterly drills of the emergency response process
2. Include pause/unpause tests in CI/CD pipelines
3. Test both contract and oracle pause mechanisms independently and together
4. Validate that all affected operations properly respect the pause state

## Resuming Normal Operations

Before unpausing, verify:
1. The issue has been fully resolved
2. All affected components have been tested
3. The security team has approved the unpause
4. A rollback plan is in place if new issues arise

## Special Considerations

### Stuck Funds
If a pause results in funds being temporarily locked in the contract:
1. Communicate clearly with affected users
2. Provide estimated timeline for resolution
3. Consider compensation mechanisms for affected parties

### Regulatory Notifications
Determine if the incident requires notification to:
1. Regulatory authorities
2. Data protection agencies
3. Law enforcement

## Document History

| Date       | Version | Author        | Description               |
|------------|---------|---------------|---------------------------|
| 2025-06-02 | 1.0     | Bell24H Team  | Initial document creation |

---

*Note: This document should be reviewed and updated at least quarterly.*
