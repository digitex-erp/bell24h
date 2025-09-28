import Link from 'next/link';

export default function Footer() {
  return (
    <>
      <style jsx>{`
        .footer {
          background: #1a237e;
          color: white;
          margin-top: 80px;
        }
        
        .trust-section {
          background: #0d47a1;
          padding: 30px 0;
        }
        
        .trust-section .container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .trust-item {
          text-align: center;
        }
        
        .trust-item img {
          height: 60px;
          margin-bottom: 10px;
        }
        
        .trust-item p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        
        .main-footer {
          padding: 60px 0;
        }
        
        .main-footer .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 40px;
        }
        
        .footer-section h3,
        .footer-section h4 {
          margin-bottom: 20px;
          font-size: 18px;
        }
        
        .footer-section p {
          margin-bottom: 15px;
          opacity: 0.8;
          line-height: 1.6;
        }
        
        .social-links {
          display: flex;
          gap: 10px;
        }
        
        .social-link {
          background: white;
          color: #1a237e;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-weight: bold;
          transition: transform 0.3s;
        }
        
        .social-link:hover {
          transform: scale(1.1);
        }
        
        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .footer-section li {
          margin-bottom: 10px;
        }
        
        .footer-section a {
          color: white;
          text-decoration: none;
          opacity: 0.8;
          transition: opacity 0.3s;
        }
        
        .footer-section a:hover {
          opacity: 1;
          text-decoration: underline;
        }
        
        .payment-section {
          background: #0d47a1;
          padding: 20px 0;
        }
        
        .payment-section .container {
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .payment-section p {
          margin-bottom: 15px;
          opacity: 0.9;
        }
        
        .payment-partners {
          display: flex;
          justify-content: center;
          gap: 30px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .payment-partners img {
          height: 30px;
          opacity: 0.8;
          transition: opacity 0.3s;
        }
        
        .payment-partners img:hover {
          opacity: 1;
        }
        
        .copyright {
          background: #001970;
          padding: 15px 0;
          text-align: center;
          font-size: 14px;
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }
          
          .trust-section .container {
            flex-direction: column;
            gap: 30px;
          }
          
          .payment-partners {
            gap: 20px;
          }
        }
      `}</style>

      <footer className="footer">
        {/* Trust Badges Section */}
        <div className="trust-section">
          <div className="container">
            <div className="trust-item">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontSize: '24px'
              }}>
                ✅
              </div>
              <p>ISO 9001:2015</p>
            </div>
            <div className="trust-item">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontSize: '24px'
              }}>
                🇮🇳
              </div>
              <p>Startup India</p>
            </div>
            <div className="trust-item">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontSize: '24px'
              }}>
                🏭
              </div>
              <p>Make in India</p>
            </div>
            <div className="trust-item">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontSize: '24px'
              }}>
                📋
              </div>
              <p>MSME Registered</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="main-footer">
          <div className="container">
            <div className="footer-grid">
              {/* Company Info */}
              <div className="footer-section">
                <h3>About Bell24h</h3>
                <p>
                  India's largest B2B marketplace connecting buyers with verified suppliers. 
                  Trusted by 45,000+ businesses across India.
                </p>
                <div className="social-links">
                  <a href="#" className="social-link">f</a>
                  <a href="#" className="social-link">t</a>
                  <a href="#" className="social-link">in</a>
                  <a href="#" className="social-link">yt</a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/contact">Contact Us</Link></li>
                  <li><Link href="/careers">Careers</Link></li>
                  <li><Link href="/testimonials">Testimonials</Link></li>
                  <li><Link href="/media">Media</Link></li>
                </ul>
          </div>

              {/* Services */}
              <div className="footer-section">
                <h4>Our Services</h4>
                <ul>
                  <li><Link href="/services/rfq">RFQ Service</Link></li>
                  <li><Link href="/services/verified-suppliers">Verified Suppliers</Link></li>
                  <li><Link href="/services/trade-assurance">Trade Assurance</Link></li>
                  <li><Link href="/services/logistics">Logistics Service</Link></li>
                  <li><Link href="/advertising">Advertise with Us</Link></li>
            </ul>
          </div>

              {/* Help & Support */}
              <div className="footer-section">
                <h4>Help & Support</h4>
                <ul>
                  <li><Link href="/help/faq">FAQs</Link></li>
                  <li><Link href="/help/how-to-buy">How to Buy</Link></li>
                  <li><Link href="/help/how-to-sell">How to Sell</Link></li>
                  <li><Link href="/help/payment">Payment Options</Link></li>
                  <li><Link href="/help/safety">Safety Center</Link></li>
            </ul>
          </div>

              {/* Legal & Compliance */}
              <div className="footer-section">
                <h4>Legal</h4>
                <ul>
                  <li><Link href="/terms">Terms of Use</Link></li>
                  <li><Link href="/privacy">Privacy Policy</Link></li>
                  <li><Link href="/compliance/razorpay">Razorpay Compliance</Link></li>
                  <li><Link href="/compliance/gst">GST Compliance</Link></li>
                  <li><Link href="/report-issue">Report Issue</Link></li>
            </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Partners */}
        <div className="payment-section">
          <div className="container">
            <p>Secure Payments Powered By</p>
            <div className="payment-partners">
              <div style={{ fontSize: '24px' }}>💳</div>
              <div style={{ fontSize: '24px' }}>📱</div>
              <div style={{ fontSize: '24px' }}>🏦</div>
              <div style={{ fontSize: '24px' }}>💰</div>
              <div style={{ fontSize: '24px' }}>🏪</div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="copyright">
          <p>&copy; 2024 Bell24h.com. All rights reserved. | CIN: U74999MH2024PTC123456</p>
      </div>
    </footer>
    </>
  );
}