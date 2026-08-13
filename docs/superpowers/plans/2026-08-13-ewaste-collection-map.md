# 우리동네 폐가전 수거함 (ewaste-info) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `ewaste-info`, a text-search-based site (mirroring `dongne-info`'s architecture) that lets users find 폐휴대폰/중소폐가전 collection points by region, sourced from a new `local-data-pipeline` ingestion script for the 한국환경공단 CSV, styled with a burgundy/cream, senior-readability-first design system completely distinct from `dongne-info` (green/yellow) and `parking-lot` (navy/yellow).

**Architecture:** Two repositories change. (1) `local-data-pipeline` (existing Python repo, sibling directory) gets a new source (`sources/e_waste.py` + `load_e_waste.py`) that parses the CSV and writes into `data/by_region/*.json` under a new `"e_waste"` key, reusing the existing `merge_region_file`/`region_key` helpers and a new loose address parser for the CSV's inconsistent 시도 abbreviations. (2) `ewaste-info` (new Next.js 16 + Tailwind 4 repo, already git-initialized with the design spec) is scaffolded to match `dongne-info`'s conventions (SSG per region, `npm run sync-data` to pull the pipeline's output) but with entirely new components, colors, and a self-hosted accessibility-focused font.

**Tech Stack:** Python 3 (stdlib `csv` only, no new deps) for the pipeline; Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript for the site; KoddiUD OnGothic (self-hosted via `next/font/local`) for typography.

## Global Constraints

- Site domain: `https://ewaste-info.zucca100.com`; site name: `우리동네 폐가전 수거함` (spec: `2026-08-13-ewaste-collection-map-design.md`)
- No map UI — the CSV has no lat/lng columns; region navigation is text search only, same as `dongne-info`
- Color palette (A안, already approved): background `#FBF6EE` (cream), header/accent text `#6B1E2E` (burgundy), body text `#2B2320` (charcoal), CTA/buttons `#9C5B33` (copper), borders `#E4D7C3` (tan)
- Font: KoddiUD OnGothic self-hosted via `next/font/local`, NOT Noto Sans, NOT next/font/google — body text minimum 18px, line-height 1.7–1.8
- Never distinguish information by color alone — pair every color-coded badge with an icon and/or text label (colorblind accessibility requirement from spec)
- Minimum touch target 48px (`min-h-12` in Tailwind) on all interactive elements
- Follow `dongne-info`/`parking-lot` file conventions exactly where this doc doesn't say otherwise (same `package.json` scripts, same `tsconfig.json`/`eslint.config.mjs`/`postcss.config.mjs`, same `sync-data` copy pattern)
- `local-data-pipeline` has no test framework installed (no pytest, no test files anywhere in the repo) — verification steps in this plan use ad hoc `python3 -c` assertion scripts and real script runs against the actual CSV, not a new test framework
- `ewaste-info`'s sibling sites have no JS test framework either — verification steps use `npm run build` + `curl`/`grep` against the dev server, not jest/vitest

---

## Part A — Data pipeline (`local-data-pipeline`)

### Task 1: Loose sido/sigungu parser for messy CSV addresses

**Files:**
- Modify: `/Users/mac/Downloads/local-data-pipeline/utils/regions.py` (append after `parse_sido_sigungu`, before `region_key`)

**Interfaces:**
- Consumes: existing `parse_sido_sigungu(address) -> tuple[str,str] | None` and `SIDO_NAMES` (both already in this file)
- Produces: `parse_sido_sigungu_loose(address: str) -> tuple[str, str] | None` — same contract as `parse_sido_sigungu` (returns `(sido, sigungu)` or `None`). `load_e_waste.py` (Task 3) calls this.

This CSV's addresses mix full 시도명 ("경기도"), abbreviations ("경기", "경북"), and — for a handful of well-known cities — omit the 시도 entirely ("김포시 김포대로 1121"). Verified against the actual 12,830-row CSV: full names + abbreviations + the sigungu-only exception table below bring unparseable rows from 45 down to 3 (all genuine data gaps missing 시군구 entirely, e.g. `"인천광역시 가정로 237-1"`).

- [ ] **Step 1: Write a verification script and confirm it fails (function doesn't exist yet)**

Run:
```bash
cd /Users/mac/Downloads/local-data-pipeline
python3 -c "
from utils.regions import parse_sido_sigungu_loose
assert parse_sido_sigungu_loose('경기 부천시 오정구 삼작로 109 신흥동 행정복지센터') == ('경기도', '부천시')
"
```
Expected: `ImportError: cannot import name 'parse_sido_sigungu_loose'`

- [ ] **Step 2: Add the abbreviation tables and loose parser to `utils/regions.py`**

Insert this block immediately after the `parse_sido_sigungu` function definition (which ends at the `return None` on the line before `def region_key`):

```python
# 폐전자제품 수거함 CSV처럼 시도명이 약칭이거나("경기", "경북") 아예 생략된
# ("김포시 김포대로 1121"처럼 시군구명으로 바로 시작) 주소를 위한 느슨한 매칭.
# 표준데이터(xls) 소스들은 시도명이 항상 정식 명칭이라 parse_sido_sigungu만으로
# 충분했지만, 이 CSV는 원본부터 표기가 뒤섞여 있어 별도 처리가 필요함.
SIDO_ABBR = {
    "서울": "서울특별시", "서울시": "서울특별시",
    "부산": "부산광역시", "부산시": "부산광역시",
    "대구": "대구광역시", "대구시": "대구광역시",
    "인천": "인천광역시", "인천시": "인천광역시",
    "광주": "광주광역시", "광주시": "광주광역시",
    "대전": "대전광역시", "대전시": "대전광역시",
    "울산": "울산광역시", "울산시": "울산광역시",
    "세종": "세종특별자치시", "세종시": "세종특별자치시",
    "경기": "경기도",
    "강원": "강원특별자치도", "강원도": "강원특별자치도",
    "충북": "충청북도", "충남": "충청남도",
    "전북": "전북특별자치도", "전남": "전라남도",
    "전라북도": "전북특별자치도",
    "경북": "경상북도", "경남": "경상남도",
    "제주": "제주특별자치도", "제주도": "제주특별자치도",
}

# 시도명이 아예 생략되고 시군구명으로 바로 시작하는 주소용. 전국에서 이름이
# 겹치지 않는 시/군만 등록 — 이 CSV에서 실제로 관측된 케이스 기준
# (김포/안양/용인/남양주/창원/김천/제주시/서귀포시).
SIGUNGU_ONLY_SIDO = {
    "김포시": "경기도", "안양시": "경기도", "용인시": "경기도", "남양주시": "경기도",
    "창원시": "경상남도", "김천시": "경상북도",
    "제주시": "제주특별자치도", "서귀포시": "제주특별자치도",
}


def parse_sido_sigungu_loose(address):
    """parse_sido_sigungu의 느슨한 버전.

    다음 순서로 시도한다 (반드시 이 순서 — "제주시"가 "제주" 약칭에 먼저
    걸려버리면 잘못 잘리므로 시군구 단독 매칭을 항상 먼저 확인해야 함):
    1. SIGUNGU_ONLY_SIDO에 등록된 시군구명으로 바로 시작하는지
    2. parse_sido_sigungu로 정식 시도명 매칭 (세종 예외 처리 포함, 그대로 위임)
    3. SIDO_ABBR 약칭을 정식명으로 치환한 뒤 parse_sido_sigungu 재시도
       (약칭은 긴 것부터 검사 — "서울시"가 "서울"보다 먼저 매칭돼야 함)

    매칭 실패 시 None 반환 (parse_sido_sigungu와 동일 계약).
    """
    if not address:
        return None
    address = address.strip()

    for sigungu, sido in SIGUNGU_ONLY_SIDO.items():
        if address.startswith(sigungu):
            return sido, sigungu

    direct = parse_sido_sigungu(address)
    if direct:
        return direct

    for abbr, full in sorted(SIDO_ABBR.items(), key=lambda kv: -len(kv[0])):
        if address.startswith(abbr):
            normalized = full + address[len(abbr):]
            return parse_sido_sigungu(normalized)

    return None
```

- [ ] **Step 3: Run the verification script and confirm it passes, then add broader assertions**

Run:
```bash
cd /Users/mac/Downloads/local-data-pipeline
python3 -c "
from utils.regions import parse_sido_sigungu_loose as p

assert p('경기 부천시 오정구 삼작로 109 신흥동 행정복지센터') == ('경기도', '부천시')
assert p('경상북도 구미시 인의동 ...') == ('경상북도', '구미시')
assert p('세종 한누리대로 2143') == ('세종특별자치시', '세종특별자치시')
assert p('세종시 노을3로 19') == ('세종특별자치시', '세종특별자치시')
assert p('김포시 김포대로 1121') == ('경기도', '김포시')
assert p('제주시 삼무로 18') == ('제주특별자치도', '제주시')
assert p('창원시 성산구 마디미로73번길 25') == ('경상남도', '창원시')
assert p('인천광역시 가정로 237-1') is None  # 시군구 자체가 원본에 없음 — 스킵 대상
print('all assertions passed')
"
```
Expected: `all assertions passed`

- [ ] **Step 4: Commit**

```bash
cd /Users/mac/Downloads/local-data-pipeline
git add utils/regions.py
git commit -m "Add loose sido/sigungu parser for e-waste CSV's inconsistent addresses"
```

---

### Task 2: CSV parser for the e-waste source

**Files:**
- Create: `/Users/mac/Downloads/local-data-pipeline/sources/e_waste.py`

**Interfaces:**
- Produces: `parse(csv_path: str) -> list[dict]` — each dict has keys `순번, 상호명, 수거종류, 수거방법, 수거장소(주소), 장소구분, 수거비용`. Consumed by `load_e_waste.py` (Task 3).

- [ ] **Step 1: Write a verification script against the real file and confirm it fails**

Run:
```bash
cd /Users/mac/Downloads/local-data-pipeline
python3 -c "
from sources.e_waste import parse
rows = parse('raw_data/한국환경공단_폐전자제품 수거함 위치정보_20241028.csv')
assert len(rows) == 12830, len(rows)
"
```
Expected: `ModuleNotFoundError: No module named 'sources.e_waste'`

- [ ] **Step 2: Create `sources/e_waste.py`**

```python
"""한국환경공단 폐전자제품 수거함 위치정보 CSV 파서.

data.go.kr에서 내려받은 원본 CSV는 CP949(EUC-KR) 인코딩. 컬럼: 순번, 상호명,
수거종류, 수거방법, 수거장소(주소), 장소구분, 수거비용. 위도/경도 컬럼 없음.
수거방법(전 행 "수거함 설치")과 수거비용(전 행 "무상")은 값이 하나뿐이라
사이트에는 노출하지 않지만, 원본 그대로 dict에 담아 반환한다.
"""
import csv


def parse(csv_path):
    with open(csv_path, encoding="cp949") as f:
        return list(csv.DictReader(f))
```

- [ ] **Step 3: Run the verification script and confirm it passes**

Run:
```bash
cd /Users/mac/Downloads/local-data-pipeline
python3 -c "
from sources.e_waste import parse
rows = parse('raw_data/한국환경공단_폐전자제품 수거함 위치정보_20241028.csv')
assert len(rows) == 12830, len(rows)
assert rows[0]['상호명'] == '신흥동 행정복지센터'
assert set(rows[0].keys()) == {'순번','상호명','수거종류','수거방법','수거장소(주소)','장소구분','수거비용'}
print('ok', len(rows))
"
```
Expected: `ok 12830`

- [ ] **Step 4: Commit**

```bash
cd /Users/mac/Downloads/local-data-pipeline
git add sources/e_waste.py
git commit -m "Add CSV parser for e-waste collection point source"
```

---

### Task 3: Load script — group by region and write to `data/by_region`

**Files:**
- Create: `/Users/mac/Downloads/local-data-pipeline/load_e_waste.py`

**Interfaces:**
- Consumes: `sources.e_waste.parse` (Task 2), `utils.regions.parse_sido_sigungu_loose` (Task 1), `utils.regions.merge_region_file`/`region_key` (existing)
- Produces: `data/by_region/<sido>_<sigungu>.json` files with an `"e_waste"` key holding the list of raw row dicts. `ewaste-info`'s `lib/regions.ts` (Task 8) reads these after `sync-data`.

- [ ] **Step 1: Create `load_e_waste.py`**

```python
"""한국환경공단 폐전자제품 수거함 위치정보(CSV)를 읽어 지역별 JSON으로 저장한다.

실행: python3 load_e_waste.py
필요 조건: raw_data/ 폴더에 data.go.kr에서 받은 CSV 원본이 있을 것.
"""
from pathlib import Path

from sources.e_waste import parse
from utils.regions import merge_region_file, region_key, parse_sido_sigungu_loose

RAW_DIR = Path(__file__).parent / "raw_data"
OUT_DIR = Path(__file__).parent / "data" / "by_region"

CSV_NAME = "한국환경공단_폐전자제품 수거함 위치정보_20241028.csv"


def main():
    csv_path = RAW_DIR / CSV_NAME
    if not csv_path.exists():
        raise SystemExit(f"{csv_path} 를 찾을 수 없습니다. raw_data/ 폴더를 확인하세요.")

    rows = parse(str(csv_path))
    print(f"폐전자제품 수거함 row 수: {len(rows)}")

    grouped = {}
    skipped = 0
    for row in rows:
        address = row.get("수거장소(주소)") or ""
        parsed = parse_sido_sigungu_loose(address)
        if not parsed:
            skipped += 1
            continue
        sido, sigungu = parsed
        key = region_key(sido, sigungu)
        grouped.setdefault(key, []).append(row)

    for key, items in grouped.items():
        merge_region_file(OUT_DIR, key, "e_waste", items)

    print(f"지역 {len(grouped)}개 처리 완료 (지역 매칭 실패로 스킵: {skipped}건) → {OUT_DIR}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run it for real and verify the printed counts match the verified expectation**

Run:
```bash
cd /Users/mac/Downloads/local-data-pipeline
python3 load_e_waste.py
```
Expected output:
```
폐전자제품 수거함 row 수: 12830
지역 225개 처리 완료 (지역 매칭 실패로 스킵: 3건) → /Users/mac/Downloads/local-data-pipeline/data/by_region
```

- [ ] **Step 3: Spot-check one output file**

Run:
```bash
cd /Users/mac/Downloads/local-data-pipeline
python3 -c "
import json
data = json.load(open('data/by_region/경기도_부천시.json', encoding='utf-8'))
assert 'e_waste' in data
assert len(data['e_waste']) > 0
print('e_waste entries for 경기도_부천시:', len(data['e_waste']))
print(data['e_waste'][0])
"
```
Expected: prints a count > 0 and one sample row dict with keys `순번, 상호명, 수거종류, 수거방법, 수거장소(주소), 장소구분, 수거비용`.

- [ ] **Step 4: Commit**

Note: `data/by_region/*.json` files are regenerated output, not itself a code change worth reviewing line-by-line, but the README convention in this repo's sibling sites commits `data/` for deployment — however `local-data-pipeline` itself is the *source* repo, and `ewaste-info` will pull via `sync-data`, so only the loader script needs committing here (data output stays untracked, matching how `load_parking.py`/`load_bag_stores.py` are committed without their `data/by_region` diffs bundled in the same commit — check `git status` first).

```bash
cd /Users/mac/Downloads/local-data-pipeline
git status
git add load_e_waste.py
git commit -m "Add e-waste collection point loader script"
```

---

## Part B — Site scaffold (`ewaste-info`)

`ewaste-info/` already exists at `/Users/mac/Downloads/ewaste-info/` (git-initialized, contains `docs/superpowers/specs/` and this plan file). All paths below are relative to that directory.

### Task 4: Project scaffold — package.json, TS/lint/build config

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/package.json`
- Create: `/Users/mac/Downloads/ewaste-info/tsconfig.json`
- Create: `/Users/mac/Downloads/ewaste-info/eslint.config.mjs`
- Create: `/Users/mac/Downloads/ewaste-info/postcss.config.mjs`
- Create: `/Users/mac/Downloads/ewaste-info/next.config.ts`
- Create: `/Users/mac/Downloads/ewaste-info/.gitignore`
- Create: `/Users/mac/Downloads/ewaste-info/AGENTS.md`
- Create: `/Users/mac/Downloads/ewaste-info/CLAUDE.md`

**Interfaces:**
- Produces: `npm run dev|build|start|lint|sync-data` scripts that every later task's verification step relies on.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "ewaste-info",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "sync-data": "rm -rf data/by_region && cp -R ../local-data-pipeline/data/by_region data/by_region"
  },
  "dependencies": {
    "@vercel/analytics": "^2.0.1",
    "next": "16.3.0",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.0",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `eslint.config.mjs`**

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 5: Create `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

- [ ] **Step 6: Create `.gitignore`**

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 7: Create `AGENTS.md` and `CLAUDE.md`**

`AGENTS.md`:
```markdown
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
```

`CLAUDE.md`:
```markdown
@AGENTS.md
```

- [ ] **Step 8: Install dependencies and verify**

Run:
```bash
cd /Users/mac/Downloads/ewaste-info
npm install
```
Expected: completes without error, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 9: Commit**

```bash
cd /Users/mac/Downloads/ewaste-info
git add package.json package-lock.json tsconfig.json eslint.config.mjs postcss.config.mjs next.config.ts .gitignore AGENTS.md CLAUDE.md
git commit -m "Scaffold ewaste-info Next.js project config"
```

---

### Task 5: Pull region data from the pipeline

**Files:**
- Create (via script, not hand-written): `/Users/mac/Downloads/ewaste-info/data/by_region/*.json`

**Interfaces:**
- Consumes: `../local-data-pipeline/data/by_region/*.json` written by Task 3
- Produces: local `data/by_region/*.json` that `lib/regions.ts` (Task 8) reads at build time

- [ ] **Step 1: Run sync-data and verify**

Run:
```bash
cd /Users/mac/Downloads/ewaste-info
npm run sync-data
ls data/by_region | wc -l
```
Expected: `225` (matching Task 3's region count).

- [ ] **Step 2: Commit**

Deployment builds only this repo, so the data must be committed here (same reasoning as `dongne-info`'s README: "배포 환경은 이 프로젝트만 보고 빌드하므로 data/는 git에 커밋").

```bash
cd /Users/mac/Downloads/ewaste-info
git add data/by_region
git commit -m "Sync e-waste collection point data from local-data-pipeline"
```

---

### Task 6: Design tokens + self-hosted accessibility font

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/src/app/fonts/KoddiUDOnGothic-Regular.woff2`
- Create: `/Users/mac/Downloads/ewaste-info/src/app/fonts/KoddiUDOnGothic-Bold.woff2`
- Create: `/Users/mac/Downloads/ewaste-info/src/app/globals.css`

**Interfaces:**
- Produces: CSS custom properties `--color-background`, `--color-foreground`, `--color-burgundy`, `--color-burgundy-dark`, `--color-cream`, `--color-charcoal`, `--color-copper`, `--color-tan` (used as Tailwind classes `bg-burgundy`, `text-copper`, etc. throughout later tasks) and the `--font-koddiud` CSS variable (wired into `<html>` by Task 13's `layout.tsx`, which imports the font files created here via `next/font/local`).

KoddiUD OnGothic is a universal-design typeface co-developed by 한국장애인개발원 and 윤디자인그룹 specifically for low-vision/elderly readability — free for commercial use, cannot be resold. Verified download source (`fonts-archive/KoddiUDOnGothic` on GitHub, served via jsDelivr CDN) confirmed reachable with `curl -I` returning `200`/`content-type: font/woff2` at plan-writing time.

- [ ] **Step 1: Create the fonts directory and download both weights**

Run:
```bash
mkdir -p /Users/mac/Downloads/ewaste-info/src/app/fonts
curl -sL -o /Users/mac/Downloads/ewaste-info/src/app/fonts/KoddiUDOnGothic-Regular.woff2 \
  "https://cdn.jsdelivr.net/gh/fonts-archive/KoddiUDOnGothic@main/KoddiUDOnGothic-Regular.woff2"
curl -sL -o /Users/mac/Downloads/ewaste-info/src/app/fonts/KoddiUDOnGothic-Bold.woff2 \
  "https://cdn.jsdelivr.net/gh/fonts-archive/KoddiUDOnGothic@main/KoddiUDOnGothic-Bold.woff2"
ls -la /Users/mac/Downloads/ewaste-info/src/app/fonts/
```
Expected: both files present, each several hundred KB (Regular ~869KB, Bold ~854KB).

- [ ] **Step 2: Verify the downloaded files are valid woff2 (not an HTML error page)**

Run:
```bash
file /Users/mac/Downloads/ewaste-info/src/app/fonts/*.woff2
```
Expected: both report as `Web Open Font Format (Version 2)` data, not `HTML document text`.

- [ ] **Step 3: Create `src/app/globals.css`**

```css
@import "tailwindcss";

:root {
  --background: #fbf6ee;
  --foreground: #2b2320;
  --card: #ffffff;
  --burgundy: #6b1e2e;
  --burgundy-dark: #4f1521;
  --cream: #fbf6ee;
  --charcoal: #2b2320;
  --copper: #9c5b33;
  --tan: #e4d7c3;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-burgundy: var(--burgundy);
  --color-burgundy-dark: var(--burgundy-dark);
  --color-cream: var(--cream);
  --color-charcoal: var(--charcoal);
  --color-copper: var(--copper);
  --color-tan: var(--tan);
  --font-sans: var(--font-koddiud);
}

/* 시스템 다크모드와 무관하게 항상 크림/버건디 톤으로 고정 (시니어 대상,
   저대비 다크모드보다 일관된 밝은 화면이 가독성에 유리) */

body {
  background: var(--background);
  color: var(--foreground);
  /* dongne-info의 globals.css는 --font-sans 토큰을 정의만 해두고 body에는
     "Arial, Helvetica, sans-serif"를 하드코딩해서 실제로는 Geist가 본문에
     전혀 적용되지 않는 잠재 버그가 있었음 (Tailwind 4 preflight가 --font-sans를
     body에 자동 적용하지 않으므로 명시적으로 써줘야 함). 이 프로젝트의 핵심
     요구사항이 "코디 온고딕 폰트 적용"이므로 여기서는 반드시 명시한다.
     KoddiUD 로딩 실패 시를 대비한 폴백은 시스템 UD 폰트 계열로 지정. */
  font-family: var(--font-sans), "Malgun Gothic", "맑은 고딕", sans-serif;
  font-size: 18px;
  line-height: 1.75;
  letter-spacing: 0.01em;
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/mac/Downloads/ewaste-info
git add src/app/fonts src/app/globals.css
git commit -m "Add burgundy/cream design tokens and self-hosted KoddiUD OnGothic font"
```

---

### Task 7: Site metadata constants

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/src/lib/site.ts`
- Create: `/Users/mac/Downloads/ewaste-info/src/lib/sidoAlias.ts`

**Interfaces:**
- Produces: `SITE_URL: string`, `SITE_NAME: string` (consumed by `layout.tsx`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx` in Tasks 13–14), `sidoAlias(sido: string): string | null` (consumed by `app/[sido]/[sigungu]/page.tsx` in Task 12)

- [ ] **Step 1: Create `src/lib/site.ts`**

```typescript
export const SITE_URL = "https://ewaste-info.zucca100.com";
export const SITE_NAME = "우리동네 폐가전 수거함";
```

- [ ] **Step 2: Create `src/lib/sidoAlias.ts`**

```typescript
// 사람들이 실제로 검색할 때 흔히 쓰는 축약형 시도명.
// "서울특별시"만 페이지에 있으면 "서울시 마포구 폐가전 수거함" 같은
// 검색어와 텍스트 매칭이 약해질 수 있어 별칭을 본문/메타에 같이 노출한다.
export const SIDO_ALIAS: Record<string, string> = {
  서울특별시: "서울시",
  부산광역시: "부산시",
  대구광역시: "대구시",
  인천광역시: "인천시",
  광주광역시: "광주시",
  대전광역시: "대전시",
  울산광역시: "울산시",
  세종특별자치시: "세종시",
  경기도: "경기",
  강원특별자치도: "강원도",
  충청북도: "충북",
  충청남도: "충남",
  전북특별자치도: "전라북도",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주도",
};

export function sidoAlias(sido: string): string | null {
  return SIDO_ALIAS[sido] ?? null;
}
```

- [ ] **Step 3: Verify both files typecheck**

Run:
```bash
cd /Users/mac/Downloads/ewaste-info
npx tsc --noEmit
```
Expected: no errors (this will re-run for the whole project on every later task too — at this point there are only these two files plus config, so it should pass cleanly).

- [ ] **Step 4: Commit**

```bash
cd /Users/mac/Downloads/ewaste-info
git add src/lib/site.ts src/lib/sidoAlias.ts
git commit -m "Add site metadata constants and sido alias table"
```

---

### Task 8: Region data layer

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/src/lib/regions.ts`

**Interfaces:**
- Consumes: `data/by_region/*.json` (Task 5)
- Produces:
  - `interface CollectionPoint { 순번: string; 상호명: string; 수거종류: string; 수거방법: string; "수거장소(주소)": string; 장소구분: string; 수거비용: string; }`
  - `interface RegionSummary { sido: string; sigungu: string; slug: { sido: string; sigungu: string }; pointCount: number; }`
  - `getAllRegionSummaries(): RegionSummary[]` — consumed by `app/page.tsx` (Task 11) and `app/[sido]/[sigungu]/page.tsx`'s `generateStaticParams` (Task 12)
  - `getRegionData(sido: string, sigungu: string): { e_waste?: CollectionPoint[] } | null` — consumed by `app/[sido]/[sigungu]/page.tsx` (Task 12)

- [ ] **Step 1: Create `src/lib/regions.ts`**

```typescript
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "by_region");

export interface CollectionPoint {
  순번: string;
  상호명: string;
  수거종류: string;
  수거방법: string;
  "수거장소(주소)": string;
  장소구분: string;
  수거비용: string;
}

export interface RegionFile {
  e_waste?: CollectionPoint[];
}

export interface RegionSummary {
  sido: string;
  sigungu: string;
  slug: { sido: string; sigungu: string };
  pointCount: number;
}

function parseKey(fileStem: string): { sido: string; sigungu: string } {
  const idx = fileStem.indexOf("_");
  if (idx === -1) return { sido: fileStem, sigungu: fileStem };
  return { sido: fileStem.slice(0, idx), sigungu: fileStem.slice(idx + 1) };
}

let cachedFiles: string[] | null = null;

function listRegionFiles(): string[] {
  if (!cachedFiles) {
    cachedFiles = fs.existsSync(DATA_DIR)
      ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))
      : [];
  }
  return cachedFiles;
}

export function getAllRegionSummaries(): RegionSummary[] {
  return listRegionFiles().map((file) => {
    const stem = file.replace(/\.json$/, "");
    const { sido, sigungu } = parseKey(stem);
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    const parsed: RegionFile = JSON.parse(raw);
    return {
      sido,
      sigungu,
      slug: { sido, sigungu },
      pointCount: parsed.e_waste?.length ?? 0,
    };
  });
}

// 원본 CSV에 상호명+주소+수거종류가 완전히 같은 행이 소수(약 20건) 중복돼
// 있어서 그대로 노출하면 같은 수거함이 목록에 두 번 뜬다. 세 필드 기준으로
// 대표 1건만 남긴다.
function dedupePoints(items: CollectionPoint[]): CollectionPoint[] {
  const seen = new Set<string>();
  const result: CollectionPoint[] = [];
  for (const item of items) {
    const key = `${item.상호명}|${item["수거장소(주소)"]}|${item.수거종류}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function getRegionData(sido: string, sigungu: string): RegionFile | null {
  const file = path.join(DATA_DIR, `${sido}_${sigungu}.json`);
  if (!fs.existsSync(file)) return null;
  const parsed: RegionFile = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (parsed.e_waste) {
    parsed.e_waste = dedupePoints(parsed.e_waste);
  }
  return parsed;
}
```

- [ ] **Step 2: Verify against the real synced data**

Run:
```bash
cd /Users/mac/Downloads/ewaste-info
npx tsx -e "
import { getAllRegionSummaries, getRegionData } from './src/lib/regions';
const summaries = getAllRegionSummaries();
console.log('regions:', summaries.length);
if (summaries.length !== 225) throw new Error('expected 225 regions, got ' + summaries.length);
const bucheon = getRegionData('경기도', '부천시');
if (!bucheon || !bucheon.e_waste || bucheon.e_waste.length === 0) throw new Error('부천시 data missing');
console.log('부천시 points:', bucheon.e_waste.length);
console.log('sample:', bucheon.e_waste[0]);
console.log('ok');
" 2>&1 || npx --yes tsx -e "console.log('tsx not available, falling back')"
```
If `tsx` isn't available as a devDependency, install it as a one-off dev tool for this check only: `npm install --no-save tsx`, then re-run the same command. Expected: `regions: 225`, a 부천시 point count > 0, and `ok`.

- [ ] **Step 3: Commit**

```bash
cd /Users/mac/Downloads/ewaste-info
git add src/lib/regions.ts
git commit -m "Add region data layer for e-waste collection points"
```

---

### Task 9: Home search component

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/src/components/RegionSearch.tsx`

**Interfaces:**
- Consumes: `RegionSummary` from `@/lib/regions` (Task 8)
- Produces: `export default function RegionSearch({ regions }: { regions: RegionSummary[] })` — consumed by `app/page.tsx` (Task 11)

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useMemo, useState } from "react";
import type { RegionSummary } from "@/lib/regions";

export default function RegionSearch({ regions }: { regions: RegionSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().replace(/\s/g, "");
    if (!q) return [];
    return regions.filter((r) => `${r.sido}${r.sigungu}`.includes(q));
  }, [query, regions]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="mt-6">
      <label htmlFor="region-search" className="sr-only">
        동네 이름 검색
      </label>
      <input
        id="region-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="동네 이름으로 검색 (예: 안양, 해운대구)"
        className="w-full rounded-2xl border-2 border-burgundy bg-white px-5 py-5 text-xl font-medium text-charcoal outline-none placeholder:text-zinc-400 focus:border-copper focus:ring-2 focus:ring-copper"
      />

      {hasQuery && (
        <div className="mt-4">
          <p className="text-lg font-bold text-burgundy">{filtered.length}개 지역 찾음</p>
          <div className="mt-2 max-h-72 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-lg text-zinc-500">일치하는 지역이 없어요.</p>
            )}
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filtered.map((r) => (
                <li key={`${r.sido}_${r.sigungu}`}>
                  <a
                    href={`/${encodeURIComponent(r.sido)}/${encodeURIComponent(r.sigungu)}`}
                    className="block min-h-12 rounded-xl border-2 border-copper bg-cream px-4 py-3 text-lg font-semibold text-burgundy hover:bg-copper/20"
                  >
                    <span className="block">{r.sigungu}</span>
                    <span className="block text-base font-normal text-zinc-500">{r.sido}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `cd /Users/mac/Downloads/ewaste-info && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/mac/Downloads/ewaste-info
git add src/components/RegionSearch.tsx
git commit -m "Add home region search component"
```

---

### Task 10: Collection point list — type filter + dong accordion

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/src/components/CollectionPointList.tsx`

**Interfaces:**
- Consumes: `CollectionPoint` from `@/lib/regions` (Task 8)
- Produces: `export default function CollectionPointList({ items }: { items: CollectionPoint[] })` — consumed by `app/[sido]/[sigungu]/page.tsx` (Task 12)

Adapts `parking-lot`'s `AddressGroupedList` dong-extraction + accordion pattern (address grouping is more useful here than grouping by 장소구분, since 민팃ATM alone is 56% of rows and would dominate a single flat group) but adds a 수거종류 filter on top, swaps every color class to the burgundy palette, and shows 장소구분 as a per-item tag rather than a grouping key.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useMemo, useState } from "react";
import type { CollectionPoint } from "@/lib/regions";

const TYPES = ["전체", "폐휴대폰", "중소폐가전"] as const;
type TypeFilter = (typeof TYPES)[number];

const TYPE_ICON: Record<string, string> = {
  폐휴대폰: "📱",
  중소폐가전: "🔌",
};

function extractDong(address: string): string {
  const inline = address.match(/(?:시|군|구)\s+([가-힣0-9]{1,4}(동|읍|면|리|가))/);
  if (inline) return inline[1];
  return "기타";
}

function naverMapUrl(address: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(address.trim())}`;
}

export default function CollectionPointList({ items }: { items: CollectionPoint[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("전체");
  const [query, setQuery] = useState("");
  const [openDong, setOpenDong] = useState<string | null>(null);

  const typeFiltered = useMemo(
    () => (typeFilter === "전체" ? items : items.filter((i) => i.수거종류 === typeFilter)),
    [items, typeFilter]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, CollectionPoint[]>();
    for (const item of typeFiltered) {
      const dong = extractDong(item["수거장소(주소)"]);
      if (!map.has(dong)) map.set(dong, []);
      map.get(dong)!.push(item);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [typeFiltered]);

  const hasQuery = query.trim().length > 0;

  const filteredGrouped = useMemo(() => {
    const q = query.trim();
    if (!q) return grouped;
    return grouped
      .map(([dong, list]): [string, CollectionPoint[]] => [
        dong,
        list.filter(
          (item) =>
            item.상호명.includes(q) ||
            item["수거장소(주소)"].includes(q) ||
            dong.includes(q)
        ),
      ])
      .filter(([, list]) => list.length > 0);
  }, [grouped, query]);

  const hasApartment = typeFiltered.some((i) => i.장소구분.includes("공동주택"));

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="수거종류 선택">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            aria-pressed={typeFilter === t}
            className={
              typeFilter === t
                ? "min-h-12 rounded-xl border-2 border-burgundy bg-burgundy px-5 py-3 text-lg font-bold text-cream"
                : "min-h-12 rounded-xl border-2 border-burgundy bg-cream px-5 py-3 text-lg font-bold text-burgundy hover:bg-burgundy/10"
            }
          >
            {t !== "전체" ? `${TYPE_ICON[t]} ` : ""}
            {t}
          </button>
        ))}
      </div>

      <label htmlFor="point-search" className="sr-only">
        상호명이나 동네 이름으로 검색
      </label>
      <input
        id="point-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="상호명이나 동네 이름으로 검색 (예: 하이마트, 삼성동)"
        className="mt-4 w-full rounded-xl border-2 border-burgundy bg-white px-5 py-4 text-lg font-medium text-charcoal outline-none placeholder:text-zinc-400 focus:border-copper focus:ring-2 focus:ring-copper"
      />

      {hasApartment && (
        <p className="mt-3 rounded-xl border-2 border-copper bg-copper/10 px-4 py-3 text-base font-medium text-charcoal">
          🏢 공동주택(아파트) 수거함은 단지명까지만 확인되며, 외부인 이용이 제한될 수 있습니다.
        </p>
      )}

      <p className="mt-3 text-base font-semibold text-burgundy">
        {grouped.length}개 동네에 총 {typeFiltered.length}곳
      </p>

      <div className="mt-3 space-y-2">
        {filteredGrouped.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-lg text-zinc-500">일치하는 수거함이 없어요.</p>
        )}
        {filteredGrouped.map(([dong, list]) => {
          const isOpen = hasQuery || openDong === dong;
          return (
            <div key={dong} className="overflow-hidden rounded-xl border-2 border-burgundy bg-white">
              <button
                type="button"
                onClick={() => setOpenDong(openDong === dong ? null : dong)}
                aria-expanded={isOpen}
                className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-cream"
              >
                <span className="min-w-0 break-words text-xl font-bold text-charcoal">{dong}</span>
                <span className="shrink-0 text-lg text-burgundy">
                  {list.length}곳 {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <ul className="divide-y-2 divide-cream border-t-2 border-cream">
                  {list.map((item, i) => (
                    <li key={i}>
                      <a
                        href={naverMapUrl(item["수거장소(주소)"])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 hover:bg-cream"
                      >
                        <p className="text-lg font-bold text-charcoal">
                          {TYPE_ICON[item.수거종류] ?? ""} {item.상호명}
                        </p>
                        <p className="mt-1 text-base text-zinc-600">{item["수거장소(주소)"]}</p>
                        <p className="mt-1 inline-block rounded-full border border-copper px-2 py-0.5 text-sm font-semibold text-copper">
                          {item.장소구분}
                        </p>
                        <p className="mt-1 text-sm font-bold text-copper">네이버지도에서 보기 ↗</p>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `cd /Users/mac/Downloads/ewaste-info && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/mac/Downloads/ewaste-info
git add src/components/CollectionPointList.tsx
git commit -m "Add collection point list with type filter and dong accordion"
```

---

### Task 11: Home page

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/src/app/page.tsx`

**Interfaces:**
- Consumes: `getAllRegionSummaries` (Task 8), `RegionSearch` (Task 9)

- [ ] **Step 1: Create the page**

```tsx
import { getAllRegionSummaries } from "@/lib/regions";
import RegionSearch from "@/components/RegionSearch";

export default function Home() {
  const regions = getAllRegionSummaries();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl bg-burgundy px-6 py-8 text-center text-cream">
        <h1 className="text-3xl font-extrabold sm:text-4xl">우리동네 폐가전 수거함</h1>
        <p className="mt-3 text-xl">폐휴대폰, 폐가전 버리는 수거함 위치를 동네 이름으로 찾아보세요</p>
      </div>

      <h2 className="mt-8 text-center text-2xl font-bold text-burgundy">지역을 검색해보세요</h2>
      <RegionSearch regions={regions} />
    </main>
  );
}
```

- [ ] **Step 2: Commit** (verification deferred to Task 15's full build check, since `layout.tsx`/`globals.css` wiring from Task 13 is needed for a real render)

```bash
cd /Users/mac/Downloads/ewaste-info
git add src/app/page.tsx
git commit -m "Add home page"
```

---

### Task 12: Region detail page

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/src/app/[sido]/[sigungu]/page.tsx`

**Interfaces:**
- Consumes: `getAllRegionSummaries`, `getRegionData` (Task 8), `sidoAlias` (Task 7), `CollectionPointList` (Task 10)

- [ ] **Step 1: Create the page**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllRegionSummaries, getRegionData } from "@/lib/regions";
import { sidoAlias } from "@/lib/sidoAlias";
import CollectionPointList from "@/components/CollectionPointList";

export async function generateStaticParams() {
  return getAllRegionSummaries().map((r) => ({
    sido: r.sido,
    sigungu: r.sigungu,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; sigungu: string }>;
}): Promise<Metadata> {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);
  const data = getRegionData(sido, sigungu);
  if (!data) return { title: "지역 정보 없음" };

  const alias = sidoAlias(sido);
  const aliasSuffix = alias ? `(${alias})` : "";

  const title = `${sido}${aliasSuffix} ${sigungu} 폐가전 수거함 · 폐휴대폰 수거함 위치`;
  const description = `${sido}${aliasSuffix} ${sigungu}의 폐휴대폰·중소폐가전 수거함 위치를 한눈에 확인하세요.`;
  const keywords = [
    `${sido} ${sigungu} 폐가전 수거함`,
    `${sido} ${sigungu} 폐휴대폰 수거함`,
    ...(alias ? [`${alias} ${sigungu} 폐가전 수거함`, `${alias} ${sigungu} 폐휴대폰 수거함`] : []),
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/${sido}/${sigungu}` },
    openGraph: { title, description, locale: "ko_KR", type: "website" },
  };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ sido: string; sigungu: string }>;
}) {
  const raw = await params;
  const sido = decodeURIComponent(raw.sido);
  const sigungu = decodeURIComponent(raw.sigungu);
  const data = getRegionData(sido, sigungu);
  if (!data) notFound();

  const points = data.e_waste ?? [];
  const alias = sidoAlias(sido);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-4 text-lg font-medium text-zinc-500">
        <a href="/" className="text-burgundy hover:underline">
          우리동네 폐가전 수거함
        </a>{" "}
        / {sido} / {sigungu}
      </nav>

      <div className="rounded-2xl bg-burgundy px-6 py-6 text-cream">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {sido} {sigungu}
        </h1>
        <p className="mt-1 text-xl">
          {alias ? `${alias} ${sigungu} ` : ""}폐휴대폰 · 폐가전 수거함
        </p>
      </div>

      <section className="mt-8">
        {points.length === 0 ? (
          <p className="mt-3 rounded-xl bg-white p-4 text-lg text-zinc-500">등록된 수거함이 없습니다.</p>
        ) : (
          <CollectionPointList items={points} />
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Commit** (verification deferred to Task 15)

```bash
cd /Users/mac/Downloads/ewaste-info
git add "src/app/[sido]/[sigungu]/page.tsx"
git commit -m "Add region detail page"
```

---

### Task 13: Root layout — font wiring, metadata, footer credits

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/src/app/layout.tsx`

**Interfaces:**
- Consumes: `SITE_URL`, `SITE_NAME` (Task 7), font files (Task 6)
- Produces: applies `--font-koddiud` CSS variable used by `globals.css`'s `--font-sans` (Task 6)

- [ ] **Step 1: Create `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const koddiUD = localFont({
  src: [
    { path: "./fonts/KoddiUDOnGothic-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/KoddiUDOnGothic-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-koddiud",
  display: "swap",
});

const TITLE = `${SITE_NAME} | 폐휴대폰 · 폐가전 수거함 위치`;
const DESCRIPTION = "전국 시군구별 폐휴대폰·중소폐가전 수거함 위치를 확인하세요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: "ko-KR",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${koddiUD.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
        <footer className="mt-auto border-t-4 border-burgundy bg-white px-4 py-6 text-center text-sm text-zinc-500">
          <p className="max-w-2xl mx-auto">
            <span className="font-bold text-zinc-700">면책조항:</span> 본 사이트가 제공하는
            수거함 위치 정보는 공공데이터포털이 제공하는 공공데이터를 가공하여 보여주는
            참고용 정보이며, 실제 정보와 다를 수 있습니다. 방문 전 운영 여부를 다시 확인해
            주세요. 본 사이트는 정보의 정확성, 최신성에 대해 어떠한 법적 책임도 지지
            않습니다.
          </p>
          <p className="mt-3">
            데이터 출처: 한국환경공단 폐전자제품 수거함 위치정보 (공공데이터포털) · 폰트:
            KoddiUD 온고딕 (한국장애인개발원 · 윤디자인그룹)
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit** (verification deferred to Task 15)

```bash
cd /Users/mac/Downloads/ewaste-info
git add src/app/layout.tsx
git commit -m "Add root layout with KoddiUD OnGothic font and burgundy footer"
```

---

### Task 14: Sitemap, robots, manifest, icons, OG image

**Files:**
- Create: `/Users/mac/Downloads/ewaste-info/src/app/sitemap.ts`
- Create: `/Users/mac/Downloads/ewaste-info/src/app/robots.txt`
- Create: `/Users/mac/Downloads/ewaste-info/src/app/manifest.ts`
- Create: `/Users/mac/Downloads/ewaste-info/src/app/icon.tsx`
- Create: `/Users/mac/Downloads/ewaste-info/src/app/apple-icon.tsx`
- Create: `/Users/mac/Downloads/ewaste-info/src/app/opengraph-image.tsx`

**Interfaces:**
- Consumes: `getAllRegionSummaries` (Task 8), `SITE_URL`/`SITE_NAME` (Task 7)

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```typescript
import type { MetadataRoute } from "next";
import { getAllRegionSummaries } from "@/lib/regions";
import { SITE_URL as baseUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const regions = getAllRegionSummaries();

  const home: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  };

  const regionPages: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${baseUrl}/${encodeURIComponent(r.sido)}/${encodeURIComponent(r.sigungu)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [home, ...regionPages];
}
```

- [ ] **Step 2: Create `src/app/robots.txt`**

```
User-Agent: *
Allow: /
Disallow: /favicon.ico

Sitemap: https://ewaste-info.zucca100.com/sitemap.xml
```

- [ ] **Step 3: Create `src/app/manifest.ts`**

```typescript
import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "전국 시군구별 폐휴대폰·중소폐가전 수거함 위치를 확인하세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#6b1e2e",
    lang: "ko",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
```

- [ ] **Step 4: Create `src/app/icon.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6b1e2e",
          borderRadius: 7,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fbf6ee", display: "flex" }}>폐</div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 5: Create `src/app/apple-icon.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6b1e2e",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 800, color: "#fbf6ee", display: "flex" }}>폐</div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 6: Create `src/app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#6b1e2e",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            width: 140,
            height: 140,
            borderRadius: "9999px",
            background: "#9c5b33",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 70,
            right: 100,
            width: 100,
            height: 100,
            borderRadius: "9999px",
            background: "#e4d7c3",
          }}
        />
        <div style={{ fontSize: 88, fontWeight: 800, color: "#fbf6ee", display: "flex" }}>
          {SITE_NAME}
        </div>
        <div style={{ marginTop: 24, fontSize: 40, fontWeight: 600, color: "#e4d7c3", display: "flex" }}>
          폐휴대폰 · 폐가전 수거함 위치
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 7: Commit** (verification deferred to Task 15)

```bash
cd /Users/mac/Downloads/ewaste-info
git add src/app/sitemap.ts src/app/robots.txt src/app/manifest.ts src/app/icon.tsx src/app/apple-icon.tsx src/app/opengraph-image.tsx
git commit -m "Add sitemap, robots, manifest, and icon/OG image generation"
```

---

### Task 15: Full build verification and manual accessibility smoke test

**Files:** none (verification only)

**Interfaces:** none — this task exercises everything built in Tasks 4–14.

- [ ] **Step 1: Production build**

Run:
```bash
cd /Users/mac/Downloads/ewaste-info
npm run build
```
Expected: build succeeds, reports 225 static region pages generated (226 including home) with no errors. Watch for any per-page size warnings — given the max region size verified in Task 3 is 547 rows of short 7-field records (no lat/lng), no page should approach Vercel's ISR size limits (the issue `parking-lot` hit with resident-parking dedup was ~thousands of rows per region; this dataset's ceiling is far lower).

- [ ] **Step 2: Lint**

Run: `cd /Users/mac/Downloads/ewaste-info && npm run lint`
Expected: no errors.

- [ ] **Step 3: Confirm the font files were actually bundled into the build**

Run:
```bash
find /Users/mac/Downloads/ewaste-info/.next/static/media -iname "*.woff2" 2>/dev/null
```
Expected: at least 2 hashed `.woff2` files listed (Next.js content-hashes local font files into `.next/static/media/` during `next build` — their presence confirms `next/font/local` actually picked up and processed the KoddiUD files from Task 6, not just that the source files exist on disk).

- [ ] **Step 4: Start the production server and smoke-test the home page**

Run:
```bash
cd /Users/mac/Downloads/ewaste-info
npm run start &
sleep 2
curl -s http://localhost:3000/ | grep -o "우리동네 폐가전 수거함" | head -1
```
Expected: prints `우리동네 폐가전 수거함` (confirms burgundy hero renders).

- [ ] **Step 5: Smoke-test a populated region page**

Run:
```bash
curl -s "http://localhost:3000/%EA%B2%BD%EA%B8%B0%EB%8F%84/%EB%B6%80%EC%B2%9C%EC%8B%9C" -o /tmp/bucheon.html
grep -c "폐휴대폰\|중소폐가전" /tmp/bucheon.html
grep -c "공동주택" /tmp/bucheon.html || true
```
Expected: first grep returns a count > 0 (region page renders collection point data); second confirms the apartment notice appears if 부천시 has any 공동주택 entries (check Task 3's output for `경기도_부천시.json` to know whether to expect this).

- [ ] **Step 6: Manual browser check for accessibility requirements**

Open `http://localhost:3000` in a browser and confirm, per the spec's Global Constraints:
- Body text renders in KoddiUD OnGothic (inspect via browser devtools → computed font-family should show the font, not a fallback)
- Burgundy/cream/copper colors match the approved palette, no green/yellow/navy bleeding in from copy-pasted sibling code
- All buttons/links are comfortably tappable (visually at least 48px tall)
- The 수거종류 filter buttons and 장소구분 tags are distinguishable without relying on color alone (icon/text present)
- Tab through the page with keyboard only — focus rings should be visible (copper ring from Task 9/10's `focus:ring-copper`)

Stop the server afterward: `kill %1` (or find and kill the `next start` process).

- [ ] **Step 7: Stop server, final commit if any fixes were made during this task**

```bash
cd /Users/mac/Downloads/ewaste-info
git status
# if Step 1-5 required any fixes, stage and commit them here with a specific message
```

---

## Deployment (not part of this plan — separate follow-up)

Once this plan's tasks are all verified, deploying to Vercel with the `ewaste-info.zucca100.com` domain (Gabia DNS CNAME, `vercel domains verify`, possible `vercel project protection disable ewaste-info --sso`) follows the exact same steps `parking-lot`'s README documents and is intentionally left out of this plan since it requires interactive account access.
