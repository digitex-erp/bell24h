'use client';

import Head from 'next/head';

const LandingPage = () => {
  return (
    <div>
      <Head>
        <title>Bell24H - Your B2B Marketplace</title>
        <meta name="description" content="Connecting businesses worldwide through our secure and efficient B2B marketplace platform." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* Navigation Bar */}
        <nav style={{ backgroundColor: '#1a202c', color: '#e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Bell24H</h1>
          <div>
            <a href="#" style={{ color: '#e2e8f0', textDecoration: 'none', marginLeft: '1.5rem' }}>Home</a>
            <a href="#" style={{ color: '#e2e8f0', textDecoration: 'none', marginLeft: '1.5rem' }}>Features</a>
            <a href="#" style={{ color: '#e2e8f0', textDecoration: 'none', marginLeft: '1.5rem' }}>About Us</a>
            <a href="#" style={{ backgroundColor: '#4299e1', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', marginLeft: '1.5rem' }}>Sign Up</a>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{ backgroundColor: '#2d3748', color: 'white', textAlign: 'center', padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'extrabold', marginBottom: '1rem' }}>
            Connect, Collaborate, Conquer.
          </h2>
          <p style={{ fontSize: '1.25rem', maxWidth: '600px', marginBottom: '2rem' }}>
            The ultimate B2B marketplace for seamless transactions and powerful partnerships.
          </p>
          <button style={{ backgroundColor: '#63b3ed', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            Get Started Today
          </button>
        </section>

        {/* Features Section (Placeholder) */}
        <section style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#f7fafc' }}>
          <h3 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '2rem' }}>Key Features</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
            <div style={{ width: '300px', margin: '1rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 'semibold', marginBottom: '0.75rem' }}>AI Matching</h4>
              <p style={{ color: '#4a5568' }}>Intelligent algorithms connect you with the perfect suppliers and buyers.</p>
            </div>
            <div style={{ width: '300px', margin: '1rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 'semibold', marginBottom: '0.75rem' }}>Secure Transactions</h4>
              <p style={{ color: '#4a5568' }}>Blockchain-powered security for every deal, ensuring trust and transparency.</p>
            </div>
            <div style={{ width: '300px', margin: '1rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 'semibold', marginBottom: '0.75rem' }}>Real-time RFQs</h4>
              <p style={{ color: '#4a5568' }}>Engage with suppliers and buyers through live voice and video requests for quotes.</p>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section style={{ backgroundColor: '#4299e1', color: 'white', textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ready to Transform Your Business?</h3>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>Join Bell24H today and experience the future of B2B commerce.</p>
          <button style={{ backgroundColor: 'white', color: '#4299e1', padding: '1rem 2rem', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            Sign Up for Free
          </button>
        </section>

        {/* Footer */}
        <footer style={{ backgroundColor: '#1a202c', color: '#cbd5e0', textAlign: 'center', padding: '2rem 2rem' }}>
          <p>&copy; {new Date().getFullYear()} Bell24H. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage; 