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
            <span style={{ color: 'var(--primary-color)' }}>테니스 코트</span><br />
            빠르게 예약하세요.
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            서울시 공공 테니스장 실시간 알림 서비스. 빈 자리가 나면 바로 알려드립니다.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/dashboard" className="btn-primary">
              시작하기
            </Link>
            <Link href="/#features" style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid var(--primary-color)',
              color: 'var(--primary-color)'
            }}>
              더 알아보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px' }}>
            왜 이 서비스를 사용해야 할까요?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>⚡ 실시간 알림</h3>
              <p>서울시 공공서비스 예약 시스템을 24시간 모니터링하여 빈 자리가 나면 즉시 알려드립니다.</p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>📍 지역 기반 필터</h3>
              <p>원하는 구(區)를 선택하면 해당 지역의 테니스장 알림만 받을 수 있습니다.</p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>📱 모바일 최적화</h3>
              <p>모바일에서도 편리하게 사용할 수 있어 알림을 받자마자 바로 예약할 수 있습니다.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '40px 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>&copy; {new Date().getFullYear()} 서울 테니스 예약 알림. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
