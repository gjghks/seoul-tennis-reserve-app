import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '서울 테니스 - 공공 테니스장 예약';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#facc15',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: '#000',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#84cc16"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2C12 12 12 12 22 12" />
              <path d="M12 22C12 12 12 12 2 12" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            서울 테니스
          </span>
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#000',
            opacity: 0.8,
          }}
        >
          서울시 공공 테니스장 예약 현황을 실시간으로
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 48,
          }}
        >
          {['강남', '송파', '마포', '서초', '영등포'].map((gu) => (
            <div
              key={gu}
              style={{
                background: '#000',
                color: '#facc15',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 'bold',
              }}
            >
              {gu}구
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
