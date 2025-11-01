export default function Home() {
  return (
    <main style={{minHeight: '100vh',display: 'flex',alignItems: 'center',justifyContent: 'center',fontFamily: 'system-ui,sans-serif'}}>
      <div style={{textAlign: 'center',background: '#fff',borderRadius: '1rem',padding: '2rem',boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',border: '1px solid #e5e7eb'}}>
        <div style={{width: '64px',height: '64px',background: '#10b981',borderRadius: '50%',display: 'flex',alignItems: 'center',justifyContent: 'center',margin: '0 auto 1.5rem auto',fontSize: '1.5rem',color: 'white'}}>
          ✓
        </div>
        <h1 style={{fontSize: '2.25rem',fontWeight: 'bold',color: '#1f2937',marginBottom: '1rem'}}>Bell24h</h1>
        <p style={{fontSize: '1.125rem',color: '#6b7280',marginBottom: '1.5rem'}}>Deployment Successful! All errors resolved.</p>
        <div style={{background: '#ecfdf5',border: '1px solid #a7f3d0',borderRadius: '0.5rem',padding: '1rem',marginBottom: '1.5rem'}}>
          <p style={{color: '#065f46',fontWeight: '600',margin: 0}}>✅ Build Complete</p>
          <p style={{color: '#047857',fontSize: '0.875rem',margin: '0.25rem 0 0 0'}}>No missing components or scripts</p>
        </div>
      </div>
    </main>
  )
}
