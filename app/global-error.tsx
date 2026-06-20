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
          <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">🎾</div>
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
