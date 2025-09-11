# 🚀 **Cursor Prompt – Day 3: Production Testing & Payment Reliability**

Act as a **senior Next.js/TypeScript engineer**. Based on the **stable deployment from Day 2**, now implement **Day 3 tasks** focused on **production testing** and **payment reliability** for Bell24h.com.

---

## **Primary Objective:**

Test and optimize **all critical systems** under production load to ensure **100% reliability** when real users start using the platform.

---

## **Day 3 Tasks**

### **1. Payment System Load Testing**

* Test **Razorpay integration** with sandbox keys:
  * Payment link creation under 50+ concurrent requests
  * Payment verification with race conditions
  * Refund processing and error handling
  * Test with different payment methods (cards, UPI, net banking)
* Fix any payment failures or timeouts.

### **2. Phone OTP Load Testing**

* Test **Phone OTP system** under high load:
  * Send OTP to 100+ phone numbers simultaneously
  * Test OTP verification with concurrent requests
  * Test expired OTP handling
  * Test rate limiting and error recovery
* Ensure **99%+ success rate** under load.

### **3. Database Performance Testing**

* Test **Neon.tech connection pooling**:
  * Run 200+ concurrent database queries
  * Test connection timeout and retry logic
  * Test database under high write load
  * Monitor memory usage and performance
* Optimize queries and connection management.

### **4. API Endpoint Stress Testing**

* Test all **API endpoints** under load:
  * `/api/auth/*` - Authentication endpoints
  * `/api/payment/*` - Payment processing
  * `/api/campaigns` - Campaign management
  * `/api/leads/*` - Lead submission
  * `/api/transactions` - Transaction tracking
* Ensure **all APIs respond within 2 seconds**.

### **5. Mobile Performance Testing**

* Test **mobile responsiveness** under load:
  * Test on different screen sizes
  * Test touch interactions
  * Test mobile payment flows
  * Test mobile navigation
* Ensure **mobile experience is flawless**.

---

## **Deliverables**

1. ✅ **Payment system tested (50+ concurrent users)**
2. ✅ **Phone OTP tested (100+ concurrent users)**
3. ✅ **Database performance optimized**
4. ✅ **All APIs stress tested**
5. ✅ **Mobile performance verified**
6. ✅ **Day 3 Production Testing Report**

---

## **Final Report Format**

1. **✅ Payment System Status** (load test results, success rate)
2. **✅ Phone OTP Status** (concurrent user testing, success rate)
3. **✅ Database Performance** (connection pooling, query optimization)
4. **✅ API Performance** (response times, error rates)
5. **✅ Mobile Performance** (responsiveness, touch interactions)
6. **🎯 Ready for Day 4** (next tasks)

---

⚡ This prompt ensures **all critical systems are production-ready** and can handle real user load without failures.

---

## **Day 3 Success Metrics**

- **Payment Success Rate**: >99% under load
- **Phone OTP Success Rate**: >99% under load
- **Database Response Time**: <500ms average
- **API Response Time**: <2 seconds average
- **Mobile Performance**: 100% responsive and functional

---

## **Testing Tools to Use**

- **Load Testing**: Use `scripts/dbLoadTest.js` and create new load tests
- **Payment Testing**: Use Razorpay sandbox environment
- **Mobile Testing**: Test on actual devices and browser dev tools
- **Performance Monitoring**: Use browser dev tools and server logs

---

**This prompt ensures your platform is ready for real users and can handle production load reliably!** 🚀
