import React from 'react';

// Matches: 02-1234-5678, 010-1234-5678, 031)1234-5678
const PHONE_REGEX = /0\d{1,2}[-)]\d{3,4}[-)]\d{4}/g;

export function extractPhoneNumbers(text: string): string[] {
  return text.match(PHONE_REGEX) ?? [];
}

function cleanForTel(phone: string): string {
  return phone.replace(/\)/g, '-');
}

export function renderPhoneLinks(
  telno: string,
  className = 'text-green-600 font-medium text-sm hover:underline'
): React.ReactNode {
  if (!telno) return null;

  const phones = extractPhoneNumbers(telno);
  if (phones.length === 0) return telno;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(PHONE_REGEX.source, 'g');

  for (let match = regex.exec(telno); match !== null; match = regex.exec(telno)) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {telno.slice(lastIndex, match.index)}
        </span>
      );
    }

    const phone = match[0];
    parts.push(
      <a
        key={`tel-${match.index}`}
        href={`tel:${cleanForTel(phone)}`}
        className={className}
      >
        {phone}
      </a>
    );

    lastIndex = match.index + phone.length;
  }

  if (lastIndex < telno.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {telno.slice(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}

export function renderSinglePhoneLink(
  phone: string,
  key: string | number,
  className = 'px-1.5 py-0.5 bg-pink-100 text-pink-700 rounded font-mono text-xs hover:bg-pink-200 hover:underline transition-colors'
): React.ReactNode {
  return (
    <a
      key={key}
      href={`tel:${cleanForTel(phone)}`}
      className={className}
    >
      {phone}
    </a>
  );
}
