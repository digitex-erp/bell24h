# Quick DNS Fix Report for bell24h.com
Generated: 2025-09-17T16:48:19.331Z

## 🚨 IMMEDIATE ACTION REQUIRED

Your domains bell24h.com and www.bell24h.com are showing "DNS Change Recommended" 
in Vercel dashboard. Follow these steps to resolve:

## 📋 Required DNS Records

### Option 1: A Records (Recommended)
- **A Record**: @ → 76.76.19.61 (TTL: 3600)
  - Root domain pointing to Vercel

- **A Record**: www → 76.76.19.61 (TTL: 3600)
  - WWW subdomain pointing to Vercel

### Option 2: CNAME Records (Alternative)
- **CNAME Record**: www → cname.vercel-dns.com (TTL: 3600)
  - WWW subdomain via CNAME

- **CNAME Record**: @ → cname.vercel-dns.com (TTL: 3600)
  - Root domain via CNAME (if supported)

## 🔧 Step-by-Step Instructions by Registrar

### GoDaddy
1. Log into your GoDaddy account
2. Go to "My Products" → "All Products and Services"
3. Find bell24h.com and click "DNS"
4. Delete existing A records for @ and www
5. Add new A record: Type=A, Name=@, Value=76.76.19.61
6. Add new A record: Type=A, Name=www, Value=76.76.19.61
7. Save changes and wait 5-15 minutes

### Namecheap
1. Log into your Namecheap account
2. Go to "Domain List" and click "Manage" next to bell24h.com
3. Go to "Advanced DNS" tab
4. Delete existing A records for @ and www
5. Add new A record: Host=@, Value=76.76.19.61
6. Add new A record: Host=www, Value=76.76.19.61
7. Save changes and wait 5-15 minutes

### Cloudflare
1. Log into your Cloudflare dashboard
2. Select bell24h.com domain
3. Go to "DNS" → "Records"
4. Delete existing A records for @ and www
5. Add new A record: Type=A, Name=@, Content=76.76.19.61
6. Add new A record: Type=A, Name=www, Content=76.76.19.61
7. Save changes and wait 5-15 minutes

### Google Domains
1. Go to domains.google.com
2. Click on bell24h.com
3. Go to "DNS" tab
4. Delete existing A records for @ and www
5. Add new A record: Name=@, Type=A, Data=76.76.19.61
6. Add new A record: Name=www, Type=A, Data=76.76.19.61
7. Save changes and wait 5-15 minutes

## ✅ Verification Steps

1. **Update DNS Records** at your domain registrar (see instructions above)
2. **Wait 5-15 minutes** for DNS propagation
3. **Go to Vercel Dashboard**: https://vercel.com/vishaals-projects-892b178d/bell24h-v1/settings/domains
4. **Click "Refresh"** next to each domain
5. **Check Status**: Should change from "DNS Change Recommended" to "Valid Configuration"
6. **Test Website**: Visit https://bell24h.com and https://www.bell24h.com

## 🧪 Test Commands

Run these commands to verify DNS resolution:

```bash
# Check DNS resolution
nslookup bell24h.com
nslookup www.bell24h.com

# Test website accessibility
curl -I https://bell24h.com
curl -I https://www.bell24h.com

# Run DNS verification script
npm run dns:verify
```

## 🆘 If Issues Persist

1. **Check Nameservers**: Ensure your domain is using the correct nameservers
2. **Contact Registrar**: Some registrars have specific requirements
3. **Wait Longer**: DNS can take up to 48 hours to fully propagate
4. **Check Vercel Status**: Visit https://vercel.com/status for any ongoing issues

## 📞 Support Resources

- Vercel Documentation: https://vercel.com/docs/concepts/projects/domains
- Vercel Support: https://vercel.com/support
- DNS Checker: https://dnschecker.org

---
**Note**: This is an automated report. Always verify DNS records in your Vercel dashboard.
