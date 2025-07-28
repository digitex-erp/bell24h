# Bell24H.com Mobile Support & Readiness Guide

## Mobile Readiness Checklist
- [ ] All pages/components use responsive layouts (Flexbox/Grid, CSS breakpoints)
- [ ] Mobile navigation (hamburger/bottom nav) is present and tested
- [ ] Touch targets (buttons, links) are large enough and accessible
- [ ] All forms and modals are mobile-friendly
- [ ] Images and videos are responsive and optimized
- [ ] Mobile E2E tests cover all critical flows (see `tests/e2e/mobile-app.e2e.test.ts`)
- [ ] Performance tested on 3G/4G networks
- [ ] No horizontal scrolling or overflow on mobile
- [ ] Mobile SEO and PWA best practices followed

## Best Practices
- Use `hooks/use-mobile.tsx` to detect device and adapt UI
- Use `MobileOptimizationBanner.tsx` to prompt users to install/use the mobile app
- Reference `components/Navigation.tsx` and `components/ui/navigation-menu.tsx` for navigation patterns

## Mobile UI/UX E2E Test Coverage

## Touch Optimization & Mobile Accessibility
- [ ] All touch targets (buttons, links, form fields) are at least 48x48px
- [ ] No interactive element is too close to another (min 8px spacing)
- [ ] All gestures (swipe, tap, long-press) are supported where relevant
- [ ] Mobile keyboard navigation and focus states are clear
- [ ] Accessibility tested with jest-axe and screen readers
- [ ] No fixed-position elements block content or controls
- [ ] Color contrast and font sizes are mobile-friendly

- [ ] Login flow on mobile (Playwright)
- [ ] Mobile navigation via MobileNav
- [ ] RFQ creation/view on mobile
- [ ] Payment flow on mobile
- [ ] Notification interaction on mobile
  
See [`tests/e2e/mobile-ui.e2e.test.ts`](../tests/e2e/mobile-ui.e2e.test.ts) for implementation.

## How to Expand
- Add new mobile E2E tests for each major user flow
- Refactor legacy components to be mobile-first
- Document new mobile patterns/components here

---
For questions or improvements, contact mobile@bell24h.com.
