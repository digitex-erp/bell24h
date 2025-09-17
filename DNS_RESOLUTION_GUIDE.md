# DNS Resolution Guide for bell24h.com

## Current Issue
Your domains `bell24h.com` and `www.bell24h.com` are showing "DNS Change Recommended" status in Vercel dashboard.

## Root Cause
The DNS records for your domains are not properly configured to point to Vercel's servers, causing the "DNS Change Recommended" warning.

## Solution Steps

### Step 1: Get Vercel DNS Records
1. Go to your Vercel dashboard: https://vercel.com/vishaals-projects-892b178d/bell24h-v1/settings/domains
2. Click on "View DNS Records & More for bell24h.com →" for each domain
3. Note down the required DNS records (usually A records pointing to Vercel's IP addresses)

### Step 2: Update DNS Records at Your Domain Registrar
You need to update DNS records at your domain registrar (where you purchased bell24h.com). Common registrars include:
- GoDaddy
- Namecheap
- Cloudflare
- Google Domains
- Route 53

#### Required DNS Records:
```
Type: A
Name: @ (or leave blank for root domain)
Value: 76.76.19.61 (Vercel's IP - verify in Vercel dashboard)

Type: A
Name: www
Value: 76.76.19.61 (Vercel's IP - verify in Vercel dashboard)

Type: CNAME
Name: www
Value: cname.vercel-dns.com (alternative method)
```

### Step 3: Alternative Method - Use CNAME Records
If your registrar doesn't support A records for the root domain, use:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### Step 4: Verify DNS Propagation
After updating DNS records:
1. Wait 5-15 minutes for DNS propagation
2. Use online tools to check DNS propagation:
   - https://dnschecker.org
   - https://whatsmydns.net
3. Check if your domain resolves to Vercel's IP

### Step 5: Refresh in Vercel Dashboard
1. Go back to Vercel dashboard
2. Click "Refresh" button next to each domain
3. The status should change from "DNS Change Recommended" to "Valid Configuration"

## Common Issues and Solutions

### Issue 1: DNS Not Propagating
- **Solution**: Wait longer (up to 48 hours for full propagation)
- **Check**: Use multiple DNS checking tools

### Issue 2: Wrong IP Address
- **Solution**: Verify the correct Vercel IP in your dashboard
- **Note**: Vercel IPs can change, always check current values

### Issue 3: Registrar Doesn't Support A Records for Root
- **Solution**: Use CNAME records or contact registrar support

### Issue 4: Multiple DNS Providers
- **Solution**: Ensure you're updating the correct DNS provider (check nameservers)

## Verification Commands

### Check DNS Records
```bash
# Check A records
nslookup bell24h.com
nslookup www.bell24h.com

# Check with specific DNS server
nslookup bell24h.com 8.8.8.8
```

### Test Domain Resolution
```bash
# Test if domain resolves to Vercel
curl -I https://bell24h.com
curl -I https://www.bell24h.com
```

## Expected Results
After successful DNS configuration:
- ✅ `bell24h.com` status: "Valid Configuration"
- ✅ `www.bell24h.com` status: "Valid Configuration"
- ✅ Both domains redirect properly to your Vercel deployment
- ✅ SSL certificates are automatically provisioned

## Next Steps After DNS Fix
1. Test your website functionality
2. Verify SSL certificates are working
3. Update any hardcoded URLs in your code
4. Test mobile responsiveness
5. Run performance tests

## Support
If you continue having issues:
1. Check Vercel's documentation: https://vercel.com/docs/concepts/projects/domains
2. Contact your domain registrar support
3. Check Vercel's status page for any ongoing issues

---
**Note**: DNS changes can take up to 48 hours to fully propagate worldwide, but usually work within 15-30 minutes.