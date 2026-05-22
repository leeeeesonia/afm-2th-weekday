# Cardnews 배포 가이드

워크스페이스 Supabase DB 재사용 + 별도 Vercel 프로젝트.

## 1. Supabase — cardnews_projects 테이블 추가

워크스페이스에서 쓰고 있는 동일 Supabase 프로젝트에서:

1. Dashboard → SQL Editor → New query
2. `schema.sql` 내용 전체 붙여넣고 Run
3. Table Editor에서 `cardnews_projects` 테이블 생성 확인

## 2. Vercel 프로젝트 생성

워크스페이스(Novound)와 별도 프로젝트.

### 방법 A — vercel CLI (가장 빠름)

```sh
cd week-8/cardnews-app

# 첫 실행: 로그인 + 프로젝트 link
npx vercel
# - "Set up and deploy"
# - 새 프로젝트 이름 (예: cardnews)
# - Framework: Vite (자동 감지)
# - Build/Output: vercel.json 따라 자동

# 환경변수 설정 (워크스페이스 DATABASE_URL과 동일 값)
npx vercel env add DATABASE_URL production
# (Prompt에 워크스페이스 .env의 DATABASE_URL 값 붙여넣기)
npx vercel env add DATABASE_URL preview
npx vercel env add DATABASE_URL development

# 프로덕션 배포
npx vercel --prod
```

### 방법 B — Vercel Dashboard

1. https://vercel.com/new
2. afm-2th-weekday repo import
3. Root Directory = `week-8/cardnews-app`
4. Framework = Vite (자동)
5. Environment Variables → `DATABASE_URL` 추가 (워크스페이스 값과 동일)
6. Deploy

## 3. 배포 후 검증

```sh
# Health check
curl https://<your-cardnews>.vercel.app/api/health
# → { ok: true, db: true, ts: ... }

# 프로젝트 목록 (빈 배열)
curl https://<your-cardnews>.vercel.app/api/projects
# → { projects: [] }
```

## 4. 로컬 dev

```sh
cd week-8/cardnews-app
npm install
cp .env.example .env
# .env 편집해서 워크스페이스 DATABASE_URL 붙여넣기

# vite + api 동시 실행
npm run dev:all
# - 5173 → 카드뉴스 UI
# - 3001 → /api/* (Express)
# - vite proxy로 :5173/api → :3001 연결
```

## 메모

- **워크스페이스 DB 재사용**: 같은 Supabase. cardnews_projects만 별도 테이블. workspace의 다른 테이블과 충돌 없음.
- **별도 Vercel 프로젝트**: 워크스페이스(Novound) 배포와 무관. 카드뉴스 배포는 cardnews-app/만 영향.
- **Secrets 정책**: hardcoded fallback 금지. DATABASE_URL 없으면 서버 시작 시 throw.
- **Connection pooling**: serverless 환경이라 `max: 1` (cold-start당 1 connection). Supabase 6543 풀러 권장.
