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
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Noto Sans KR"',
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
              fontSize: 40,
            }}
          >
            🎾
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#000',
            }}
          >
            서울 테니스
          </span>
        </div>
        <div
          style={{
            display: 'flex',
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
          <div style={{ background: '#000', color: '#facc15', padding: '12px 24px', borderRadius: 8, fontSize: 20, fontWeight: 700 }}>강남구</div>
          <div style={{ background: '#000', color: '#facc15', padding: '12px 24px', borderRadius: 8, fontSize: 20, fontWeight: 700 }}>송파구</div>
          <div style={{ background: '#000', color: '#facc15', padding: '12px 24px', borderRadius: 8, fontSize: 20, fontWeight: 700 }}>마포구</div>
          <div style={{ background: '#000', color: '#facc15', padding: '12px 24px', borderRadius: 8, fontSize: 20, fontWeight: 700 }}>서초구</div>
          <div style={{ background: '#000', color: '#facc15', padding: '12px 24px', borderRadius: 8, fontSize: 20, fontWeight: 700 }}>영등포구</div>
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
