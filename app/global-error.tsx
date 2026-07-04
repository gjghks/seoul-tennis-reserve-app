'use client';

// Root error boundary: catches throws in the root layout / providers, where the
// normal app chrome + theme context are unavailable. Renders its own <html>/<body>
// with inline styles so it never depends on Tailwind/theme providers.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#dfe5f2',
          color: '#000',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: 420,
            width: '100%',
            textAlign: 'center',
            background: '#fff',
            border: '3px solid #000',
            borderRadius: 10,
            boxShadow: '6px 6px 0 0 #000',
            padding: 32,
          }}
        >
          <div style={{ marginBottom: 12, display: 'flex' }} aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="21" fill="#d7ff2e" stroke="#000" strokeWidth="3.5" />
              <path
                d="M24 3 C9.7 8.9 9.7 18.8 24 24 C38.3 29.3 38.3 39.1 24 45"
                fill="none"
                stroke="#000"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>
            일시적인 오류가 발생했습니다
          </h1>
          <p style={{ fontSize: 14, color: '#444', margin: '0 0 24px', lineHeight: 1.5 }}>
            페이지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: '#22c55e',
              color: '#000',
              border: '2px solid #000',
              borderRadius: 5,
              boxShadow: '4px 4px 0 0 #000',
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
