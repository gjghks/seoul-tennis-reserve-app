# 소셜 로그인 설정 가이드

이 문서는 Google, Kakao 소셜 로그인을 활성화하기 위한 설정 방법을 안내합니다.

## 목차
1. [Google 로그인](#1-google-로그인)
2. [Kakao 로그인](#2-kakao-로그인)

---

## 1. Google 로그인

### Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성/선택
2. **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Authorized redirect URIs 추가:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
5. **Client ID**와 **Client Secret** 저장

### Supabase 설정

1. [Supabase Dashboard](https://supabase.com/dashboard) > **Authentication** > **Providers**
2. **Google** 활성화
3. Client ID와 Client Secret 입력

---

## 2. Kakao 로그인

Supabase는 Kakao를 직접 지원하지 않으므로, **Keycloak 프로바이더를 Kakao OIDC로 설정**합니다.

### Kakao Developers 설정

1. [Kakao Developers](https://developers.kakao.com/console/app)에서 애플리케이션 생성
2. **앱 키** > **REST API 키** 복사

#### 카카오 로그인 활성화
1. **카카오 로그인** > **활성화 설정** > **ON**
2. **Redirect URI** 추가:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

#### OpenID Connect 활성화
1. **카카오 로그인** > **OpenID Connect 활성화 설정** > **ON**

#### 동의 항목 설정
1. **카카오 로그인** > **동의 항목**
2. 필요한 항목 활성화:
   - 닉네임 (필수)
   - 프로필 사진
   - 카카오계정(이메일)

### Supabase 설정

1. [Supabase Dashboard](https://supabase.com/dashboard) > **Authentication** > **Providers**
2. **Keycloak** 활성화 (Kakao OIDC 용도로 사용)
3. 입력:
   - **Client ID**: Kakao REST API 키
   - **Client Secret**: 빈 값 또는 placeholder (Kakao는 필요 없음)
   - **Realm URL**: `https://kauth.kakao.com`

### Kakao OIDC 엔드포인트 참고

| 항목 | URL |
|------|-----|
| Issuer | `https://kauth.kakao.com` |
| Authorization | `https://kauth.kakao.com/oauth/authorize` |
| Token | `https://kauth.kakao.com/oauth/token` |
| UserInfo | `https://kapi.kakao.com/v1/oidc/userinfo` |
| JWKS | `https://kauth.kakao.com/.well-known/jwks.json` |

---

## Supabase Redirect URL 설정

**Authentication** > **URL Configuration**에서 다음 URL들을 허용 목록에 추가:

```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

---

## 환경 변수

`.env.local` 파일에 다음 변수가 설정되어 있는지 확인:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 테스트

1. `npm run dev`로 개발 서버 실행
2. `/login` 페이지에서 각 소셜 로그인 버튼 테스트
3. 로그인 성공 후 홈으로 리다이렉트 확인

---

## 문제 해결

### "Redirect URI mismatch" 오류
- 각 플랫폼의 Redirect URI 설정이 정확히 일치하는지 확인
- `https://<project-ref>.supabase.co/auth/v1/callback`

### "Invalid client" 오류
- Client ID/Secret이 올바른지 확인
- 프로바이더가 활성화되어 있는지 확인

### Kakao 로그인 실패
- OpenID Connect가 활성화되어 있는지 확인
- Keycloak의 Realm URL이 `https://kauth.kakao.com`인지 확인
