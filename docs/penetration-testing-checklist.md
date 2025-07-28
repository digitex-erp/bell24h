# Bell24H Penetration Testing Checklist

## Before Testing
- [ ] Obtain written authorization for penetration testing
- [ ] Notify DevOps and Security teams
- [ ] Prepare isolated staging environment (if possible)

## Application Security
- [ ] Test all API endpoints for authentication/authorization flaws
- [ ] Test rate limiting and brute-force protections
- [ ] Attempt SQL injection, XSS, CSRF, and SSRF attacks
- [ ] Check for open redirects and insecure direct object references
- [ ] Review CORS, CSP, and HTTP security headers
- [ ] Test session management and cookie security
- [ ] Test file upload and download endpoints for vulnerabilities
- [ ] Test password reset and MFA flows

## Infrastructure Security
- [ ] Scan open ports and cloud resources (AWS, S3, DB)
- [ ] Test firewall and network segmentation
- [ ] Attempt privilege escalation in cloud roles
- [ ] Check for exposed secrets and credentials

## Post-Test
- [ ] Document all findings and remediation steps
- [ ] Retest after fixes
- [ ] Share report with `security@bell24h.com`

---
For full compliance, see `COMPLIANCE.md` and `SECURITY.md`.
