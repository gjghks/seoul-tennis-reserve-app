# Vercel 배포 가이드

## 1. 사전 준비

### 필요한 계정
- [Vercel](https://vercel.com) 계정
- [Supabase](https://supabase.com) 프로젝트 (이미 설정됨)
- [서울 열린데이터광장](https://data.seoul.go.kr) API 키

### 선택 사항
- Google Analytics 계정 (트래픽 분석용)
- 커스텀 도메인

---

## 2. Vercel 배포

### 방법 1: GitHub 연동 (권장)

1. GitHub에 프로젝트 Push
2. [Vercel Dashboard](https://vercel.com/new)에서 "Import Project"
3. GitHub 저장소 선택
4. 환경변수 설정 (아래 참조)
5. "Deploy" 클릭

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

## 3. 환경변수 설정

Vercel Dashboard > Project > Settings > Environment Variables에서 설정:

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (클라이언트용) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 역할 키 (서버용) | ✅ |
| `SEOUL_OPEN_DATA_KEY` | 서울 열린데이터 API 키 | ✅ |
| `CRON_SECRET` | Cron 작업 인증용 시크릿 | ✅ |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | ❌ |

### CRON_SECRET 생성

```bash
# 안전한 랜덤 시크릿 생성
openssl rand -base64 32
```

생성된 값을 Vercel 환경변수에 설정하세요.

---

## 4. Cron 작업 설정

프로젝트 루트의 `vercel.json`을 확인하세요:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-availability",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

> ⚠️ Vercel Cron은 Pro 플랜 이상에서만 사용 가능합니다.
> Hobby 플랜의 경우 외부 cron 서비스 (예: cron-job.org)를 사용하세요.

### 외부 Cron 서비스 사용 시

1. [cron-job.org](https://cron-job.org) 등에 가입
2. 새 cron job 생성:
   - URL: `https://your-domain.vercel.app/api/cron/check-availability`
   - Method: GET
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: 매 10분 (`*/10 * * * *`)

---

## 5. 커스텀 도메인 설정

1. Vercel Dashboard > Project > Settings > Domains
2. 도메인 입력 후 "Add"
3. DNS 레코드 설정:
   - A 레코드: `76.76.19.19`
   - 또는 CNAME: `cname.vercel-dns.com`

---

## 6. 배포 후 체크리스트

- [ ] 사이트 접속 확인 (`https://your-domain.vercel.app`)
- [ ] 로그인 기능 테스트
- [ ] 테니스장 데이터 로딩 확인
- [ ] Cron 작업 동작 확인 (Vercel Functions 로그)
- [ ] OG 이미지 확인 ([OpenGraph Debugger](https://www.opengraph.xyz/))
- [ ] Google Search Console 등록
- [ ] Google Analytics 데이터 수집 확인

---

## 7. 모니터링

### Vercel Analytics
- Dashboard > Project > Analytics에서 방문자 통계 확인
- Speed Insights로 성능 모니터링

### 함수 로그
- Dashboard > Project > Functions에서 API 로그 확인
- Cron 작업 실행 이력 확인

---

## 8. 트러블슈팅

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build
```

### 환경변수 문제
- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에서 접근 가능
- 서버 전용 변수는 접두사 없이 설정

### Cron 작업 실패
1. `CRON_SECRET` 값이 올바른지 확인
2. Vercel Functions 로그에서 에러 확인
3. 로컬에서 API 엔드포인트 테스트:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/check-availability
```

---

## 참고 링크

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 문서](https://supabase.com/docs)
