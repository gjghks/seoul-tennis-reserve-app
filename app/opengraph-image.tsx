import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = '서울 테니스 - 공공 테니스장 예약';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fontData = await fetch(
    'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-700-normal.woff'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          background: '#facc15',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '"Noto Sans KR"',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            background: '#84cc16',
            borderRadius: '50%',
            opacity: 0.3,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            background: '#84cc16',
            borderRadius: '50%',
            opacity: 0.2,
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '48px 60px',
            gap: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                background: '#000',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                border: '3px solid #000',
                boxShadow: '4px 4px 0px 0px #000',
              }}
            >
              🎾
            </div>
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: '#000',
                letterSpacing: '-1px',
              }}
            >
              서울 테니스
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#000',
              opacity: 0.75,
              marginBottom: 36,
            }}
          >
            서울시 공공 테니스장 실시간 예약 현황
          </div>

          <div
            style={{
              display: 'flex',
              gap: 24,
              marginBottom: 36,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#000',
                color: '#facc15',
                padding: '20px 44px',
                borderRadius: 12,
                border: '3px solid #000',
                boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>25</span>
              <span style={{ fontSize: 18, opacity: 0.85, marginTop: 4 }}>개구 전체</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#000',
                color: '#84cc16',
                padding: '20px 44px',
                borderRadius: 12,
                border: '3px solid #000',
                boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>276+</span>
              <span style={{ fontSize: 18, opacity: 0.85, marginTop: 4 }}>테니스 시설</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#000',
                color: '#fff',
                padding: '20px 44px',
                borderRadius: 12,
                border: '3px solid #000',
                boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>실시간</span>
              <span style={{ fontSize: 18, opacity: 0.85, marginTop: 4 }}>예약 현황</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,0,0,0.08)',
              padding: '10px 28px',
              borderRadius: 8,
              border: '2px solid rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: 22, color: '#000', fontWeight: 700 }}>
              seoul-tennis.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Noto Sans KR',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
}
