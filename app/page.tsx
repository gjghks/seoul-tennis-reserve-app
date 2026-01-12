import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a192f] via-transparent to-[#0a192f] z-10" />
          {/* Subtle grid or effect here */}
        </div>

        <div className="container relative z-20 text-center animate-fade-in" style={{ paddingTop: '100px' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '20px', lineHeight: '1.1' }}>
            Book Your <span style={{ color: 'var(--primary-color)' }}>Court</span><br />
            In Seconds.
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Get real-time alerts for Seoul's public tennis courts. Never miss a game again.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/dashboard" className="btn-primary">
              Get Started
            </Link>
            <Link href="/#features" style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid var(--primary-color)',
              color: 'var(--primary-color)'
            }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px' }}>
            Why Use Our Service?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>⚡ Real-time Alerts</h3>
              <p>We monitor the Seoul Public Service Reservation system 24/7 and notify you immediately when a slot opens up.</p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>📍 Location Based</h3>
              <p>Filter by your favorite districts (Gu) and only get alerts for courts near you.</p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>📱 Mobile Ready</h3>
              <p>Optimized for mobile experience so you can book on the go as soon as the alert pops.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '40px 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>&copy; {new Date().getFullYear()} Seoul Tennis Reserve. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
