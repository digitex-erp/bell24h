# n8n Workflow Import & Configuration Guide

## 🚀 Step 1: Access n8n Dashboard

### Login Information
- **URL:** http://165.232.187.195:5678
- **Username:** admin
- **Password:** Bell24h@N8N

### Navigation
1. Open your browser and navigate to the n8n URL
2. Login with the provided credentials
3. You'll see the n8n workflow canvas
4. Left sidebar shows workflow templates and nodes
5. Top menu has Import, Export, and Settings options

---

## 📥 Step 2: Import Workflow JSON Files

### Import Process for Each Workflow:

1. **Click "Import" button** (top menu)
2. **Select "Import from File"**
3. **Choose the workflow JSON file** from your computer
4. **Review the imported workflow** on the canvas
5. **Click "Save"** (Ctrl+S or top menu)
6. **Name your workflow** appropriately

### Expected After Import:
- Workflow nodes appear on canvas
- Connections between nodes are visible
- Node configurations may show errors (we'll fix these)
- Credentials will need to be configured

---

## 🔐 Step 3: Configure Credentials

### PostgreSQL (InsForge) - READ ONLY
**Purpose:** Query data for marketing campaigns
```
Host: your-neon-host.neon.tech
Port: 5432
Database: your_database_name
User: your_readonly_user
Password: your_readonly_password
SSL: Required
```
**⚠️ IMPORTANT:** Create a read-only database user for n8n

### Gmail SMTP (Email Sending)
**Purpose:** Send marketing emails
```
Host: smtp.gmail.com
Port: 587 (TLS) or 465 (SSL)
User: your-bell24h-email@gmail.com
Password: App-specific password (not regular password)
From Email: noreply@bell24h.com
```
**Setup Steps:**
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate app-specific password
4. Use this password in n8n

### MSG91 API (SMS)
**Purpose:** Send SMS notifications
```
API Key: your-msg91-api-key
Sender ID: BELL24H
Route: 4 (Transactional) or 1 (Promotional)
Country: 91 (India)
```
**Get API Key:** https://control.msg91.com/signin/

### OpenAI API (Content Generation)
**Purpose:** Generate email content, social posts
```
API Key: your-openai-api-key
Organization: your-org-id (optional)
Model: gpt-3.5-turbo or gpt-4
```
**Get API Key:** https://platform.openai.com/api-keys

### LinkedIn OAuth2 (Social Media)
**Purpose:** Post to LinkedIn company page
```
Client ID: your-linkedin-client-id
Client Secret: your-linkedin-client-secret
Authorization URL: https://www.linkedin.com/oauth/v2/authorization
Access Token URL: https://www.linkedin.com/oauth/v2/accessToken
```
**Setup:** https://www.linkedin.com/developers/apps

### Twitter API (Social Media)
**Purpose:** Post to Twitter
```
API Key: your-twitter-api-key
API Secret: your-twitter-api-secret
Access Token: your-access-token
Access Token Secret: your-access-token-secret
```
**Setup:** https://developer.twitter.com/en/portal/dashboard

---

## 🛠️ Step 4: Configure Each Workflow

### WORKFLOW E: Content Distribution
**Safe to Import As-Is** ✅

**Configuration Steps:**
1. Import the workflow JSON
2. Configure credentials:
   - OpenAI API (for content generation)
   - LinkedIn OAuth2 (for posting)
   - Twitter API (for posting)
   - Gmail SMTP (for newsletter)
3. Set up RSS feed URL (your blog feed)
4. Configure posting schedule
5. Test with a sample blog post

**Expected Behavior:**
- Monitors RSS feed for new blog posts
- Generates social media content
- Posts to LinkedIn, Twitter, Facebook
- Sends newsletter email

---

### WORKFLOW F: Referral Program (NEEDS CLEANUP)
**Remove Business Logic** ⚠️

**BEFORE Import - Edit JSON:**
1. **Remove nodes that:**
   - Generate referral codes
   - Calculate referral points
   - Determine reward tiers
   - Update user databases

2. **Keep nodes that:**
   - Send referral success emails
   - Send SMS notifications
   - Format email templates

**AFTER Import - Configuration:**
1. Configure Gmail SMTP (emails)
2. Configure MSG91 API (SMS)
3. Set up webhook trigger URL
4. Test email templates

**Expected Behavior:**
- Receives webhook from your backend with referral data
- Sends success email to referrer
- Sends notification SMS

---

### WORKFLOW G: LinkedIn Lead Gen (Safe) ✅
**Safe to Import As-Is**

**Configuration Steps:**
1. Import the workflow JSON
2. Configure LinkedIn OAuth2 credentials
3. Set target audience parameters
4. Configure connection message templates
5. Set daily limits for connections
6. Test with a small batch first

**Expected Behavior:**
- Sends LinkedIn connection requests
- Follows up with messages
- Tracks connection status

---

### WORKFLOW H: Competitor Intelligence (Safe) ✅
**Safe to Import As-Is**

**Configuration Steps:**
1. Import the workflow JSON
2. Configure web scraping nodes
3. Set up competitor URLs to monitor
4. Configure email alerts
5. Set schedule (daily recommended)
6. Test scraping functionality

**Expected Behavior:**
- Scrapes competitor websites daily
- Collects pricing, product updates
- Sends email alerts on changes
- Stores data for analysis

---

### WORKFLOW I: Churn Prevention (NEEDS CLEANUP)
**Remove Decision Logic** ⚠️

**BEFORE Import - Edit JSON:**
1. **Remove nodes that:**
   - Calculate churn risk scores
   - Analyze user behavior
   - Make retention decisions
   - Update user status

2. **Keep nodes that:**
   - Send re-engagement emails
   - Send win-back SMS
   - Format email templates
   - A/B test campaigns

**AFTER Import - Configuration:**
1. Configure Gmail SMTP (emails)
2. Configure MSG91 API (SMS)
3. Set up webhook trigger
4. Configure email templates
5. Set up A/B testing

**Expected Behavior:**
- Receives user data from your backend
- Sends targeted re-engagement campaigns
- Tracks email open rates
- Sends follow-up messages

---

### WORKFLOW J: Gamification (NEEDS CLEANUP)
**Remove Scoring Logic** ⚠️

**BEFORE Import - Edit JSON:**
1. **Remove nodes that:**
   - Calculate achievement points
   - Determine badge eligibility
   - Update leaderboards
   - Validate achievements

2. **Keep nodes that:**
   - Send achievement notifications
   - Post leaderboard updates
   - Format congratulatory messages

**AFTER Import - Configuration:**
1. Configure Gmail SMTP (emails)
2. Configure social media credentials
3. Set up webhook trigger
4. Test notification templates

**Expected Behavior:**
- Receives achievement data from your backend
- Sends achievement emails
- Posts to social media (optional)
- Sends push notifications

---

## 🧪 Step 5: Testing Each Workflow

### Safe Testing Methods:

1. **Use Test Data**
   - Create test users with fake emails
   - Use your own email for testing
   - Send to small test groups first

2. **Enable Test Mode**
   - Many APIs have test/sandbox modes
   - Use n8n's "Test workflow" feature
   - Check execution logs carefully

3. **Monitor Execution**
   - Watch n8n execution logs
   - Check email delivery status
   - Verify API response codes

### Test Checklist for Each Workflow:
- [ ] Webhook trigger receives data correctly
- [ ] Data transformation works properly
- [ ] Email templates render correctly
- [ ] SMS messages send successfully
- [ ] Social media posts appear correctly
- [ ] No errors in execution logs
- [ ] Performance is acceptable

---

## 🚀 Step 6: Activating Workflows

### Activation Process:
1. **Activate switch** (top-right of workflow canvas)
2. **Set to "Active"** (green indicator)
3. **Monitor first executions** closely
4. **Check error logs** for any issues
5. **Verify expected behavior** in production

### Monitoring Active Workflows:
- **Execution log** (left sidebar)
- **Real-time status** indicators
- **Error notifications** (if configured)
- **Performance metrics** (execution times)

### Pausing Workflows:
- **Toggle switch** to "Inactive" (gray)
- **Workflow stops** processing new triggers
- **Current executions** complete normally
- **Safe to pause** for maintenance

---

## 🔗 Step 7: Connecting to Your Backend

### Backend Integration Code:
```typescript
// Example: Trigger n8n after payment success
import { triggerN8nWorkflow, N8N_WORKFLOWS } from '@/lib/n8n-trigger';

export async function handlePaymentSuccess(payment: any, user: any) {
  // Your business logic first
  await updatePaymentStatus(payment.id, 'completed');
  
  // Then trigger n8n for marketing emails
  const result = await triggerN8nWorkflow(N8N_WORKFLOWS.PAYMENT_SUCCESS, {
    userEmail: user.email,
    userName: user.name,
    amount: payment.amount,
    paymentId: payment.id,
    template: 'payment-success'
  });
  
  if (!result.success) {
    console.error('Failed to trigger payment email:', result.error);
    // Could implement fallback email here
  }
  
  return result;
}
```

### Webhook URLs for Your Backend:
```
Referral Program: http://165.232.187.195:5678/webhook/referral-success-email
Churn Prevention: http://165.232.187.195:5678/webhook/churn-prevention-campaign
Gamification: http://165.232.187.195:5678/webhook/gamification-notifications
Content Distribution: http://165.232.187.195:5678/webhook/content-distribution
LinkedIn Lead Gen: http://165.232.187.195:5678/webhook/linkedin-lead-generation
Competitor Intelligence: http://165.232.187.195:5678/webhook/competitor-intelligence-alerts
```

### Data Format for Webhooks:
```json
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "template": "welcome-email",
  "data": {
    "specific": "to each workflow"
  }
}
```

---

## 📊 Step 8: Monitoring and Maintenance

### Daily Monitoring:
- Check execution logs for errors
- Verify email delivery rates
- Monitor API rate limits
- Review workflow performance

### Weekly Maintenance:
- Update email templates
- Refresh API credentials
- Clean up old execution logs
- Update target audience lists

### Monthly Review:
- Analyze campaign effectiveness
- Update workflow logic if needed
- Refresh API keys for security
- Review and optimize performance

---

## 🆘 Troubleshooting Common Issues

### Workflow Not Triggering:
- Check webhook URL is correct
- Verify workflow is active
- Test webhook manually
- Check execution logs

### Emails Not Sending:
- Verify SMTP credentials
- Check email template syntax
- Test SMTP connection
- Review email sending limits

### API Errors:
- Check API credentials validity
- Verify rate limits not exceeded
- Test API endpoints manually
- Review error messages carefully

### Performance Issues:
- Check workflow complexity
- Optimize node configurations
- Review execution times
- Consider workflow splitting

---

**Remember:** n8n should only handle marketing automation - all business logic stays in your Next.js backend!