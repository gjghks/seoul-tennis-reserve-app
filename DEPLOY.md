# 배포 / 운영 가이드 (자체 호스팅)

2026-11-10부터 seoul-tennis.com은 **Oracle Cloud ARM VM + Cloudflare Tunnel**에서 운영된다.
(이전: Vercel Hobby — 사용량 한도 초과로 계정 정지, AdSense 사용 시 Hobby 약관상 불가)

## 구성

```
브라우저 ─HTTPS─▶ Cloudflare (DNS·CDN·TLS, Free) ─Tunnel─▶ cloudflared ─▶ app:3000 (Next.js standalone)
                                                         └─ Oracle VM (ap-osaka-1, A1 ARM, Ubuntu 24.04)
```

| 항목 | 값 |
|------|----|
| 서버 | Oracle Cloud `seoul-tennis-app` (VM.Standard.A1.Flex, Always Free 범위), 공인 IP는 GitHub secret `ORACLE_HOST` |
| 인바운드 | SSH(22)만 허용. 웹 트래픽은 Tunnel(아웃바운드 연결)로만 들어옴 |
| 앱 경로 | `/opt/seoul-tennis` (이 저장소의 clone) |
| 컨테이너 | `deploy/docker-compose.yml` — `app`(127.0.0.1:3000) + `cloudflared` |
| 도메인 | 등록: Vercel registrar / 네임서버: Cloudflare |
| 크론 | cron-job.org → `https://seoul-tennis.com/api/cron/*` (`Authorization: Bearer $CRON_SECRET`) |

### Cloudflare 캐시 규칙 (zone `seoul-tennis.com`)

`http_request_cache_settings` 1개 규칙: **GET + 공용 데이터 API 8개 경로**만 엣지 캐시 허용
(`/api/tennis`, `air-quality`, `city-data`, `dust-alert`, `living-weather`, `popular-courts`, `trends`, `visit`).
Edge TTL은 `bypass_by_default` — 원본 `Cache-Control`(s-maxage)을 따르고, 헤더가 없으면 캐시하지 않는다.
사용자별 API는 헤더가 없으므로 `DYNAMIC` 유지. **새 API에 `public, s-maxage`를 붙일 때는 사용자별 데이터가 아닌지 확인하고,
엣지 캐시가 필요하면 이 규칙의 경로 목록에 추가**한다. 존 API 토큰: 로컬 `~/.oci/cloudflare-ops.env`(Cache Rules·Zone Settings·DNS Edit).

### 서버에만 있는 파일 (git에 없음, 권한 600)

| 파일 | 용도 |
|------|------|
| `/opt/seoul-tennis/.env.production` | 앱 환경변수. **빌드 시 `NEXT_PUBLIC_*` 인라인 + 런타임 `env_file`** 양쪽에 쓰임 |
| `/opt/seoul-tennis/.env.tunnel` | `TUNNEL_TOKEN=` (Cloudflare Tunnel `seoul-tennis`) |

> `NEXT_PUBLIC_*`(예: VAPID 공개키)를 바꾸면 **재빌드**가 필요하다 — 재시작만으로는 반영되지 않는다.
> VAPID 키는 반드시 기존 운영 값을 유지할 것(바꾸면 기존 푸시 구독이 모두 무효화됨).

## 배포

**`master`에 push하면 자동 배포된다.**

1. GitHub Actions `Deploy (Oracle)`(`.github/workflows/deploy-oracle.yml`)가 SSH로 서버에 접속
2. 서버의 `deploy/deploy.sh master` 실행:
   - `origin/master`로 동기화 → 현재 이미지를 `seoul-tennis:prev`로 태깅 → 빌드 → 재기동
   - `http://127.0.0.1:3000/robots.txt` 헬스체크(최대 60초)
   - **실패 시 `prev` 이미지로 자동 롤백** (빌드 실패면 기존 컨테이너가 계속 서비스)
3. 로그는 서버 `~/seoul-tennis-logs/`(build-<sha>.log, failed-<sha>.log)에만 남는다.
   공개 저장소라 Actions 로그에는 앱 로그를 출력하지 않는다.

- 배포 중 앱 재기동 동안 수 초간 502가 날 수 있다. 롤백까지 가면 약 60초.
- `deploy.sh` 자체를 수정하면 **다음 배포부터** 반영된다(실행 중인 건 이전 버전).
- GitHub 배포 키는 서버 `authorized_keys`의 forced command로 `deploy.sh master`만 실행 가능.

GitHub secrets: `ORACLE_HOST`, `ORACLE_SSH_KEY`, `ORACLE_HOST_FINGERPRINT`
(지문은 서버의 **ECDSA** 호스트 키 SHA256 — Actions의 Go SSH 클라이언트가 ECDSA를 우선 협상한다.)

### 수동 배포 / 롤백

```bash
ssh ubuntu@<ORACLE_HOST>                       # 운영자 키
/opt/seoul-tennis/deploy/deploy.sh master      # 수동 배포

# 직전 이미지로 즉시 되돌리기
cd /opt/seoul-tennis/deploy
docker tag seoul-tennis:prev seoul-tennis:latest
docker compose --env-file ../.env.tunnel up -d app
```

## 운영 점검

```bash
cd /opt/seoul-tennis/deploy
docker compose --env-file ../.env.tunnel ps
docker compose --env-file ../.env.tunnel logs --tail 100 app
docker compose --env-file ../.env.tunnel logs --tail 20 cloudflared   # "Registered tunnel connection" 확인
df -h / && free -h
```

| 증상 | 원인/조치 |
|------|-----------|
| Cloudflare **Error 1033 / 530** | Tunnel 미연결 → `cloudflared` 컨테이너 상태·`TUNNEL_TOKEN` 확인 |
| **502** | app 컨테이너 다운/재기동 중 → `logs app`, 필요 시 위 롤백 |
| 크론 401 | cron-job.org의 Bearer 값과 `.env.production`의 `CRON_SECRET` 불일치 |
| 크론 자동 비활성화 메일 | cron-job.org는 연속 실패 시 작업을 끈다 → 원인 해결 후 대시보드에서 Enable |

## 서버 새로 만들기 (재해 복구)

1. Oracle Cloud(ap-osaka-1)에서 Ubuntu 24.04 aarch64 A1 인스턴스 생성, 인바운드 22만 허용
2. `scp deploy/bootstrap.sh` 후 실행 → Docker·fail2ban·자동 보안 업데이트·SSH 하드닝·4GB swap·clone
3. 재로그인(docker 그룹 반영) 후 `.env.production`(`vercel env pull`/백업에서), `.env.tunnel`(Cloudflare Tunnel 토큰) 배치, `chmod 600`
4. `deploy/deploy.sh master`
5. GitHub 배포 키 공개키를 `authorized_keys`에 forced command로 등록하고 secrets(`ORACLE_HOST`, `ORACLE_HOST_FINGERPRINT`) 갱신

## 비용 가드

- Oracle 계정은 Pay As You Go(무료 범위 내 $0). 예산 `seoul-tennis-guard`: 월 $1, 실제 지출 1% / 예상 100% 초과 시 메일 알림.
- Always Free 범위: A1 월 1,500 OCPU-시간·9,000 GB-시간(상시 2 OCPU·12 GB 상당), 블록 스토리지 200 GB. 이 범위를 넘는 리소스는 과금된다.
