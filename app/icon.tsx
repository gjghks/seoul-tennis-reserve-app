import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          borderRadius: '5px',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          role="img"
          aria-label="서울 테니스"
        >
          <title>서울 테니스</title>
          <circle cx="12" cy="12" r="10" stroke="#84cc16" strokeWidth="2" />
          <path d="M12 2C12 12 12 12 22 12" stroke="#84cc16" strokeWidth="2" />
          <path d="M12 22C12 12 12 12 2 12" stroke="#84cc16" strokeWidth="2" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
