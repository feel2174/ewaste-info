# 네이버 서치어드바이저 제출 체크리스트

콘솔: https://searchadvisor.naver.com/console/board

대상 사이트: `https://ewaste-info.zucca100.com`

---

## 0. 먼저 배포부터 — 순서를 지킬 것

**존재하지 않는 URL을 제출하면 "수집 실패"로 기록되고 재제출까지 시간이 걸린다.**
반드시 `배포 → 200 확인 → 제출` 순서로 진행한다.

이 문서를 쓴 시점의 프로덕션은 커밋 `e99bf2a`(시도 페이지·llms.txt 추가) **이전**
빌드가 서비스되고 있었다. 실측:

| URL | 배포 전 (측정값) | 배포 후 기대값 |
|---|---|---|
| `/` | 200 | 200 |
| `/robots.txt` | 200 | 200 |
| `/sitemap.xml` | 200 (URL 226개) | 200 (URL **243개**) |
| `/rss.xml` | **404** | 200 (item **243개**) |
| `/llms.txt` | **404** | 200 |
| `/서울특별시` (시도 페이지) | **404** | 200 |
| `/서울특별시/마포구` (시군구 페이지) | 200 | 200 |

즉 **지금 상태로 시도 페이지나 rss.xml을 제출하면 전부 수집 실패로 기록된다.**
아래 1단계를 먼저 끝낸다.

### 1. 배포 후 라이브 검증

```bash
SITE="https://ewaste-info.zucca100.com"

# 응답코드 — 아래 6줄이 전부 200이어야 제출 가능
for p in / /robots.txt /sitemap.xml /rss.xml /llms.txt \
         /%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C; do
  printf "%-16s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' "$SITE$p")"
done

# RSS Content-Type이 application/rss+xml 인지
curl -sI "$SITE/rss.xml" | grep -iE "^(http/|content-type)"

# RSS item 개수 (243이어야 함)
curl -s "$SITE/rss.xml" | grep -c "<item>"

# robots.txt에 sitemap.xml과 rss.xml 두 줄이 다 있는지
curl -s "$SITE/robots.txt" | grep -i sitemap

# 네이버 봇(Yeti)이 일반 UA와 같은 응답을 받는지 — 둘 다 200이어야 정상
curl -s -o /dev/null -w "Yeti:   %{http_code}\n" \
  -A "Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/spd)" "$SITE/"
curl -s -o /dev/null -w "normal: %{http_code}\n" "$SITE/"
```

---

## 2. 소유확인 — 메타태그만으로는 끝난 게 아니다

`<meta name="naver-site-verification" content="787f94d9...">`는 이미 라이브
HTML에 들어가 있다(실측 확인함). 하지만 **콘솔에서 "소유확인" 버튼을 눌러야
등록이 완료된다.** 메타태그만 넣고 방치하는 것이 가장 흔한 누락 지점이다.

- [ ] 서치어드바이저 > 웹마스터 도구 > 사이트 관리에 `ewaste-info.zucca100.com`이 있는지
- [ ] 없다면 사이트 추가 → 소유확인(HTML 태그 방식) 클릭 → "확인" 상태가 되는지
- [ ] 이미 등록돼 있다면 소유확인 상태가 만료되지 않았는지

> 이 사이트의 `naver-site-verification` 값은 이 도메인 전용이다.
> 다른 프로젝트 값을 재사용하면 소유확인이 실패한다.

---

## 3. 사이트맵 / RSS 제출

`요청 > 사이트맵 제출` 과 `요청 > RSS 제출`.

**입력란에는 전체 URL이 아니라 경로만 넣는다.** 도메인이 이미 등록돼 있어
전체 URL을 넣으면 중복 경로로 실패한다.

| 메뉴 | 입력할 값 |
|---|---|
| 사이트맵 제출 | `sitemap.xml` |
| RSS 제출 | `rss.xml` |

- [ ] `sitemap.xml` 제출
- [ ] `rss.xml` 제출

> 네이버는 사이트맵과 RSS를 **별개 수집 경로**로 취급한다. 사이트맵이 이미
> 등록돼 있어도 RSS를 따로 제출해야 수집 경로가 하나 더 열린다. 두 파일은
> 같은 243개 URL을 담고 있고, item의 title/description은 각 페이지가 실제로
> 렌더링하는 `<title>`·`meta description`과 같은 함수(`lib/seo.ts`)에서 나온다.

---

## 4. 수동 수집요청 (`요청 > 웹페이지 수집`)

수집요청은 **하루 제출 한도가 있다(통상 50건).** 아래는 검색 수요 우선순위
순서다 — 홈 → 시도 → 시군구(수거함 수 상위 순). 하루 50개씩 끊어서 넣는다.

시군구 순서는 **수거함 수를 검색 수요의 대리 지표로 쓴 것**이다. 실제 검색량
데이터는 아니므로, 아는 지역이 있으면 앞으로 당겨도 된다.

URL은 한글 그대로 붙여넣어도 되고 퍼센트 인코딩해도 된다 — 같은 페이지로
resolve되고, 페이지의 canonical은 인코딩된 형태로 통일돼 있다.

### 1일차 (50건)

1. https://ewaste-info.zucca100.com/  ← 최우선

### A. 시도 페이지 17개 (수집요청 1일차)

2. https://ewaste-info.zucca100.com/경기도  — 수거함 2,265곳
3. https://ewaste-info.zucca100.com/서울특별시  — 수거함 1,594곳
4. https://ewaste-info.zucca100.com/부산광역시  — 수거함 710곳
5. https://ewaste-info.zucca100.com/인천광역시  — 수거함 711곳
6. https://ewaste-info.zucca100.com/대구광역시  — 수거함 1,132곳
7. https://ewaste-info.zucca100.com/대전광역시  — 수거함 601곳
8. https://ewaste-info.zucca100.com/광주광역시  — 수거함 715곳
9. https://ewaste-info.zucca100.com/경상남도  — 수거함 755곳
10. https://ewaste-info.zucca100.com/경상북도  — 수거함 1,321곳
11. https://ewaste-info.zucca100.com/충청남도  — 수거함 777곳
12. https://ewaste-info.zucca100.com/충청북도  — 수거함 724곳
13. https://ewaste-info.zucca100.com/울산광역시  — 수거함 260곳
14. https://ewaste-info.zucca100.com/전북특별자치도  — 수거함 301곳
15. https://ewaste-info.zucca100.com/전라남도  — 수거함 367곳
16. https://ewaste-info.zucca100.com/강원특별자치도  — 수거함 230곳
17. https://ewaste-info.zucca100.com/제주특별자치도  — 수거함 266곳
18. https://ewaste-info.zucca100.com/세종특별자치시  — 수거함 75곳

### B. 시군구 페이지 — 수거함 수 상위 32개 (수집요청 1일차 나머지)

19. https://ewaste-info.zucca100.com/충청북도/청주시  — 547곳
20. https://ewaste-info.zucca100.com/경상남도/창원시  — 387곳
21. https://ewaste-info.zucca100.com/대구광역시/달서구  — 313곳
22. https://ewaste-info.zucca100.com/경상북도/구미시  — 267곳
23. https://ewaste-info.zucca100.com/충청남도/천안시  — 261곳
24. https://ewaste-info.zucca100.com/대구광역시/수성구  — 258곳
25. https://ewaste-info.zucca100.com/경기도/화성시  — 231곳
26. https://ewaste-info.zucca100.com/경기도/성남시  — 215곳
27. https://ewaste-info.zucca100.com/광주광역시/광산구  — 187곳
28. https://ewaste-info.zucca100.com/경상북도/경주시  — 184곳
29. https://ewaste-info.zucca100.com/제주특별자치도/제주시  — 181곳
30. https://ewaste-info.zucca100.com/광주광역시/남구  — 179곳
31. https://ewaste-info.zucca100.com/인천광역시/연수구  — 176곳
32. https://ewaste-info.zucca100.com/경기도/수원시  — 170곳
33. https://ewaste-info.zucca100.com/경기도/고양시  — 169곳
34. https://ewaste-info.zucca100.com/대구광역시/동구  — 164곳
35. https://ewaste-info.zucca100.com/대구광역시/북구  — 160곳
36. https://ewaste-info.zucca100.com/대전광역시/유성구  — 159곳
37. https://ewaste-info.zucca100.com/전북특별자치도/전주시  — 158곳
38. https://ewaste-info.zucca100.com/광주광역시/서구  — 148곳
39. https://ewaste-info.zucca100.com/인천광역시/남동구  — 146곳
40. https://ewaste-info.zucca100.com/인천광역시/서구  — 145곳
41. https://ewaste-info.zucca100.com/충청남도/아산시  — 138곳
42. https://ewaste-info.zucca100.com/경기도/부천시  — 137곳
43. https://ewaste-info.zucca100.com/경기도/김포시  — 136곳
44. https://ewaste-info.zucca100.com/경상북도/경산시  — 136곳
45. https://ewaste-info.zucca100.com/대전광역시/중구  — 136곳
46. https://ewaste-info.zucca100.com/광주광역시/북구  — 133곳
47. https://ewaste-info.zucca100.com/충청남도/부여군  — 129곳
48. https://ewaste-info.zucca100.com/경상북도/봉화군  — 128곳
49. https://ewaste-info.zucca100.com/서울특별시/마포구  — 126곳
50. https://ewaste-info.zucca100.com/대전광역시/서구  — 124곳

### C. 시군구 페이지 33~132위 (2~3일차, 하루 50개씩)

<details><summary>펼쳐보기 (100개)</summary>

33. https://ewaste-info.zucca100.com/대구광역시/달성군  — 114곳
34. https://ewaste-info.zucca100.com/경기도/용인시  — 108곳
35. https://ewaste-info.zucca100.com/경기도/안산시  — 107곳
36. https://ewaste-info.zucca100.com/서울특별시/강남구  — 102곳
37. https://ewaste-info.zucca100.com/대전광역시/동구  — 101곳
38. https://ewaste-info.zucca100.com/부산광역시/부산진구  — 100곳
39. https://ewaste-info.zucca100.com/경기도/남양주시  — 96곳
40. https://ewaste-info.zucca100.com/서울특별시/송파구  — 95곳
41. https://ewaste-info.zucca100.com/서울특별시/강서구  — 94곳
42. https://ewaste-info.zucca100.com/경상남도/김해시  — 93곳
43. https://ewaste-info.zucca100.com/충청북도/제천시  — 93곳
44. https://ewaste-info.zucca100.com/경기도/이천시  — 90곳
45. https://ewaste-info.zucca100.com/인천광역시/부평구  — 86곳
46. https://ewaste-info.zucca100.com/서울특별시/노원구  — 85곳
47. https://ewaste-info.zucca100.com/제주특별자치도/서귀포시  — 85곳
48. https://ewaste-info.zucca100.com/울산광역시/남구  — 83곳
49. https://ewaste-info.zucca100.com/경상북도/칠곡군  — 82곳
50. https://ewaste-info.zucca100.com/경상남도/진주시  — 82곳
51. https://ewaste-info.zucca100.com/대전광역시/대덕구  — 81곳
52. https://ewaste-info.zucca100.com/경기도/의정부시  — 80곳
53. https://ewaste-info.zucca100.com/경기도/평택시  — 79곳
54. https://ewaste-info.zucca100.com/경상북도/포항시  — 79곳
55. https://ewaste-info.zucca100.com/경기도/군포시  — 79곳
56. https://ewaste-info.zucca100.com/경상북도/김천시  — 79곳
57. https://ewaste-info.zucca100.com/경기도/시흥시  — 79곳
58. https://ewaste-info.zucca100.com/경상북도/영주시  — 78곳
59. https://ewaste-info.zucca100.com/경기도/안양시  — 77곳
60. https://ewaste-info.zucca100.com/부산광역시/해운대구  — 76곳
61. https://ewaste-info.zucca100.com/서울특별시/관악구  — 75곳
62. https://ewaste-info.zucca100.com/세종특별자치시/세종특별자치시  — 74곳
63. https://ewaste-info.zucca100.com/서울특별시/은평구  — 74곳
64. https://ewaste-info.zucca100.com/서울특별시/영등포구  — 72곳
65. https://ewaste-info.zucca100.com/전라남도/순천시  — 72곳
66. https://ewaste-info.zucca100.com/울산광역시/울주군  — 71곳
67. https://ewaste-info.zucca100.com/서울특별시/서초구  — 69곳
68. https://ewaste-info.zucca100.com/광주광역시/동구  — 68곳
69. https://ewaste-info.zucca100.com/서울특별시/강동구  — 68곳
70. https://ewaste-info.zucca100.com/서울특별시/광진구  — 67곳
71. https://ewaste-info.zucca100.com/강원특별자치도/원주시  — 67곳
72. https://ewaste-info.zucca100.com/전라남도/목포시  — 67곳
73. https://ewaste-info.zucca100.com/서울특별시/성북구  — 66곳
74. https://ewaste-info.zucca100.com/부산광역시/동래구  — 65곳
75. https://ewaste-info.zucca100.com/전라남도/여수시  — 65곳
76. https://ewaste-info.zucca100.com/경상남도/양산시  — 64곳
77. https://ewaste-info.zucca100.com/전라남도/나주시  — 63곳
78. https://ewaste-info.zucca100.com/경기도/파주시  — 61곳
79. https://ewaste-info.zucca100.com/강원특별자치도/춘천시  — 61곳
80. https://ewaste-info.zucca100.com/부산광역시/북구  — 61곳
81. https://ewaste-info.zucca100.com/인천광역시/미추홀구  — 61곳
82. https://ewaste-info.zucca100.com/서울특별시/양천구  — 60곳
83. https://ewaste-info.zucca100.com/경상북도/성주군  — 59곳
84. https://ewaste-info.zucca100.com/부산광역시/사하구  — 59곳
85. https://ewaste-info.zucca100.com/경상북도/의성군  — 58곳
86. https://ewaste-info.zucca100.com/전북특별자치도/익산시  — 56곳
87. https://ewaste-info.zucca100.com/충청남도/당진시  — 56곳
88. https://ewaste-info.zucca100.com/서울특별시/종로구  — 55곳
89. https://ewaste-info.zucca100.com/대구광역시/중구  — 55곳
90. https://ewaste-info.zucca100.com/서울특별시/구로구  — 54곳
91. https://ewaste-info.zucca100.com/서울특별시/중구  — 53곳
92. https://ewaste-info.zucca100.com/서울특별시/중랑구  — 53곳
93. https://ewaste-info.zucca100.com/경기도/광명시  — 52곳
94. https://ewaste-info.zucca100.com/충청남도/서산시  — 51곳
95. https://ewaste-info.zucca100.com/서울특별시/동작구  — 51곳
96. https://ewaste-info.zucca100.com/부산광역시/남구  — 49곳
97. https://ewaste-info.zucca100.com/부산광역시/금정구  — 49곳
98. https://ewaste-info.zucca100.com/경상북도/영천시  — 47곳
99. https://ewaste-info.zucca100.com/서울특별시/강북구  — 47곳
100. https://ewaste-info.zucca100.com/인천광역시/계양구  — 47곳
101. https://ewaste-info.zucca100.com/서울특별시/도봉구  — 45곳
102. https://ewaste-info.zucca100.com/경기도/하남시  — 44곳
103. https://ewaste-info.zucca100.com/부산광역시/사상구  — 43곳
104. https://ewaste-info.zucca100.com/경상남도/거제시  — 42곳
105. https://ewaste-info.zucca100.com/서울특별시/동대문구  — 42곳
106. https://ewaste-info.zucca100.com/울산광역시/중구  — 42곳
107. https://ewaste-info.zucca100.com/경상북도/예천군  — 42곳
108. https://ewaste-info.zucca100.com/서울특별시/금천구  — 41곳
109. https://ewaste-info.zucca100.com/강원특별자치도/강릉시  — 40곳
110. https://ewaste-info.zucca100.com/부산광역시/중구  — 40곳
111. https://ewaste-info.zucca100.com/충청북도/충주시  — 39곳
112. https://ewaste-info.zucca100.com/전북특별자치도/군산시  — 38곳
113. https://ewaste-info.zucca100.com/울산광역시/북구  — 38곳
114. https://ewaste-info.zucca100.com/서울특별시/서대문구  — 37곳
115. https://ewaste-info.zucca100.com/부산광역시/연제구  — 37곳
116. https://ewaste-info.zucca100.com/경기도/양주시  — 37곳
117. https://ewaste-info.zucca100.com/대구광역시/남구  — 36곳
118. https://ewaste-info.zucca100.com/경기도/구리시  — 36곳
119. https://ewaste-info.zucca100.com/부산광역시/수영구  — 34곳
120. https://ewaste-info.zucca100.com/전라남도/광양시  — 34곳
121. https://ewaste-info.zucca100.com/서울특별시/성동구  — 33곳
122. https://ewaste-info.zucca100.com/부산광역시/기장군  — 33곳
123. https://ewaste-info.zucca100.com/대구광역시/서구  — 31곳
124. https://ewaste-info.zucca100.com/경상북도/안동시  — 31곳
125. https://ewaste-info.zucca100.com/서울특별시/용산구  — 30곳
126. https://ewaste-info.zucca100.com/경상남도/통영시  — 30곳
127. https://ewaste-info.zucca100.com/충청남도/계룡시  — 30곳
128. https://ewaste-info.zucca100.com/경기도/오산시  — 29곳
129. https://ewaste-info.zucca100.com/경기도/광주시  — 28곳
130. https://ewaste-info.zucca100.com/경기도/안성시  — 27곳
131. https://ewaste-info.zucca100.com/인천광역시/중구  — 27곳
132. https://ewaste-info.zucca100.com/울산광역시/동구  — 26곳

</details>

### D. 나머지 시군구 133~225위 (4~5일차)

<details><summary>펼쳐보기 (93개)</summary>

133. https://ewaste-info.zucca100.com/경기도/여주시  — 26곳
134. https://ewaste-info.zucca100.com/충청남도/예산군  — 26곳
135. https://ewaste-info.zucca100.com/경상북도/상주시  — 24곳
136. https://ewaste-info.zucca100.com/경상남도/사천시  — 23곳
137. https://ewaste-info.zucca100.com/부산광역시/강서구  — 21곳
138. https://ewaste-info.zucca100.com/경기도/포천시  — 20곳
139. https://ewaste-info.zucca100.com/충청남도/홍성군  — 18곳
140. https://ewaste-info.zucca100.com/전라남도/무안군  — 18곳
141. https://ewaste-info.zucca100.com/충청남도/논산시  — 18곳
142. https://ewaste-info.zucca100.com/경기도/의왕시  — 17곳
143. https://ewaste-info.zucca100.com/충청남도/보령시  — 17곳
144. https://ewaste-info.zucca100.com/부산광역시/영도구  — 16곳
145. https://ewaste-info.zucca100.com/충청남도/공주시  — 16곳
146. https://ewaste-info.zucca100.com/부산광역시/동구  — 16곳
147. https://ewaste-info.zucca100.com/인천광역시/동구  — 16곳
148. https://ewaste-info.zucca100.com/경기도/동두천시  — 13곳
149. https://ewaste-info.zucca100.com/전북특별자치도/정읍시  — 13곳
150. https://ewaste-info.zucca100.com/충청북도/음성군  — 12곳
151. https://ewaste-info.zucca100.com/강원특별자치도/삼척시  — 12곳
152. https://ewaste-info.zucca100.com/강원특별자치도/속초시  — 12곳
153. https://ewaste-info.zucca100.com/충청북도/진천군  — 11곳
154. https://ewaste-info.zucca100.com/충청남도/태안군  — 11곳
155. https://ewaste-info.zucca100.com/부산광역시/서구  — 11곳
156. https://ewaste-info.zucca100.com/강원특별자치도/동해시  — 10곳
157. https://ewaste-info.zucca100.com/전북특별자치도/남원시  — 10곳
158. https://ewaste-info.zucca100.com/경상남도/밀양시  — 9곳
159. https://ewaste-info.zucca100.com/충청북도/증평군  — 9곳
160. https://ewaste-info.zucca100.com/경상북도/문경시  — 9곳
161. https://ewaste-info.zucca100.com/경기도/양평군  — 9곳
162. https://ewaste-info.zucca100.com/전북특별자치도/김제시  — 8곳
163. https://ewaste-info.zucca100.com/전라남도/화순군  — 8곳
164. https://ewaste-info.zucca100.com/경상북도/청도군  — 8곳
165. https://ewaste-info.zucca100.com/강원특별자치도/홍천군  — 7곳
166. https://ewaste-info.zucca100.com/전북특별자치도/완주군  — 6곳
167. https://ewaste-info.zucca100.com/강원특별자치도/태백시  — 6곳
168. https://ewaste-info.zucca100.com/경기도/과천시  — 6곳
169. https://ewaste-info.zucca100.com/경상북도/울진군  — 6곳
170. https://ewaste-info.zucca100.com/전라남도/고흥군  — 5곳
171. https://ewaste-info.zucca100.com/경기도/가평군  — 5곳
172. https://ewaste-info.zucca100.com/전북특별자치도/고창군  — 5곳
173. https://ewaste-info.zucca100.com/전라남도/해남군  — 5곳
174. https://ewaste-info.zucca100.com/인천광역시/강화군  — 4곳
175. https://ewaste-info.zucca100.com/경상남도/거창군  — 4곳
176. https://ewaste-info.zucca100.com/전라남도/영암군  — 4곳
177. https://ewaste-info.zucca100.com/전라남도/함평군  — 4곳
178. https://ewaste-info.zucca100.com/전북특별자치도/부안군  — 4곳
179. https://ewaste-info.zucca100.com/경상남도/하동군  — 4곳
180. https://ewaste-info.zucca100.com/강원특별자치도/철원군  — 4곳
181. https://ewaste-info.zucca100.com/전라남도/영광군  — 3곳
182. https://ewaste-info.zucca100.com/인천광역시/남구  — 3곳
183. https://ewaste-info.zucca100.com/충청북도/영동군  — 3곳
184. https://ewaste-info.zucca100.com/전라남도/강진군  — 3곳
185. https://ewaste-info.zucca100.com/경상남도/고성군  — 3곳
186. https://ewaste-info.zucca100.com/충청북도/보은군  — 3곳
187. https://ewaste-info.zucca100.com/강원특별자치도/평창군  — 3곳
188. https://ewaste-info.zucca100.com/경상남도/남해군  — 3곳
189. https://ewaste-info.zucca100.com/충청북도/옥천군  — 3곳
190. https://ewaste-info.zucca100.com/경상남도/함안군  — 3곳
191. https://ewaste-info.zucca100.com/전라남도/보성군  — 3곳
192. https://ewaste-info.zucca100.com/경기도/연천군  — 2곳
193. https://ewaste-info.zucca100.com/충청남도/청양군  — 2곳
194. https://ewaste-info.zucca100.com/경상남도/산청군  — 2곳
195. https://ewaste-info.zucca100.com/강원특별자치도/영월군  — 2곳
196. https://ewaste-info.zucca100.com/충청남도/금산군  — 2곳
197. https://ewaste-info.zucca100.com/전라남도/장성군  — 2곳
198. https://ewaste-info.zucca100.com/충청북도/괴산군  — 2곳
199. https://ewaste-info.zucca100.com/전라남도/장흥군  — 2곳
200. https://ewaste-info.zucca100.com/경상남도/창녕군  — 2곳
201. https://ewaste-info.zucca100.com/전라남도/담양군  — 2곳
202. https://ewaste-info.zucca100.com/전라남도/완도군  — 2곳
203. https://ewaste-info.zucca100.com/충청남도/서천군  — 2곳
204. https://ewaste-info.zucca100.com/전라남도/곡성군  — 2곳
205. https://ewaste-info.zucca100.com/충청북도/단양군  — 2곳
206. https://ewaste-info.zucca100.com/경상남도/합천군  — 2곳
207. https://ewaste-info.zucca100.com/전라남도/구례군  — 2곳
208. https://ewaste-info.zucca100.com/경상북도/고령군  — 1곳
209. https://ewaste-info.zucca100.com/전북특별자치도/무주군  — 1곳
210. https://ewaste-info.zucca100.com/경상남도/함양군  — 1곳
211. https://ewaste-info.zucca100.com/강원특별자치도/인제군  — 1곳
212. https://ewaste-info.zucca100.com/강원특별자치도/화천군  — 1곳
213. https://ewaste-info.zucca100.com/전북특별자치도/순창군  — 1곳
214. https://ewaste-info.zucca100.com/강원특별자치도/양양군  — 1곳
215. https://ewaste-info.zucca100.com/전북특별자치도/장수군  — 1곳
216. https://ewaste-info.zucca100.com/대구광역시/군위군  — 1곳
217. https://ewaste-info.zucca100.com/경상남도/의창구  — 1곳
218. https://ewaste-info.zucca100.com/경상북도/군위군  — 1곳
219. https://ewaste-info.zucca100.com/강원특별자치도/정선군  — 1곳
220. https://ewaste-info.zucca100.com/강원특별자치도/양구군  — 1곳
221. https://ewaste-info.zucca100.com/강원특별자치도/횡성군  — 1곳
222. https://ewaste-info.zucca100.com/경상북도/영덕군  — 1곳
223. https://ewaste-info.zucca100.com/세종특별자치시/장군  — 1곳
224. https://ewaste-info.zucca100.com/경상북도/청송군  — 1곳
225. https://ewaste-info.zucca100.com/전라남도/진도군  — 1곳

</details>

---

## 5. 제출하면 안 되는 URL

측정한 실제 응답코드 기준. 추측이 아니라 `curl`로 확인한 값이다.

| URL | 코드 | 제출 금지 이유 |
|---|---|---|
| `/서울특별시/` (끝 슬래시) | **308** | Vercel/Next.js가 슬래시 없는 형태로 리다이렉트한다. 리다이렉트되는 URL은 수집 실패로 기록된다. `vercel.json`의 `"permanent": true`는 301이 아니라 308을 반환한다 |
| `/favicon.ico` | 200 | `robots.txt`에서 `Disallow: /favicon.ico`로 막아 둔 경로 |
| `/manifest.webmanifest` | 200 | 검색 결과에 노출될 콘텐츠가 아님 |
| `/icon`, `/apple-icon`, `/opengraph-image` | 200 | 이미지 엔드포인트. 웹문서 수집 대상이 아님 |
| `/llms.txt` | 배포 후 200 | LLM 에이전트용 규약 파일. 네이버 웹문서 수집 대상이 아니고, 제출해도 순위 가치가 없다 |
| 수거함 데이터가 없는 17개 시군구 | **404** | `data/by_region`의 242개 파일 중 `e_waste` 키가 있는 225개만 페이지로 생성된다. 나머지는 의도적으로 404이며 sitemap·RSS에도 들어있지 않다 |

끝 슬래시 확인 방법:

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  "https://ewaste-info.zucca100.com/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C/"
# → 308 https://ewaste-info.zucca100.com/%ec%84%9c%ec%9a%b8...  (슬래시 없는 형태)
```

---

## 6. 제출 후 확인

- [ ] `요청 > 웹페이지 수집` 목록에서 상태가 "성공"인지 (실패면 응답코드부터 다시 확인)
- [ ] `리포트 > 사이트 최적화`에서 경고가 없는지
- [ ] `리포트 > 수집 현황`에서 수집된 문서 수가 올라가는지
- [ ] 2~4주 뒤 `site:ewaste-info.zucca100.com`을 네이버에서 검색해 색인 여부 확인

---

## 7. 기대치 — 기술 세팅은 필요조건이지 충분조건이 아니다

위 작업을 다 끝내도 네이버 상위 노출이 보장되지 않는다. 이유는 세 가지다.

1. **수집 → 색인 → 노출은 각각 다른 단계다.** 수집 성공이 곧 검색 노출은
   아니며, 신규 사이트는 검색 반영까지 통상 **2~4주**가 걸린다.

2. **네이버 통합검색에서 웹문서 영역의 지분이 작다.** 지면은 파워링크 →
   스마트블록/VIEW(블로그·카페) → 지식iN 순으로 채워지고, 이 사이트 같은
   웹문서는 그 아래에 붙는다. "폐가전 수거함", "폐휴대폰 버리는 곳"처럼
   상업성이 섞인 키워드는 첫 화면 진입이 특히 어렵다.

3. **실제 유입의 본체는 블로그·지식iN이다.** 네이버에서 트래픽을 원한다면
   기술 SEO와 **병행해서** 다음을 권한다.
   - 네이버 블로그에 지역별 수거함 안내 글을 쓰고 본문에서 해당 시군구
     페이지로 링크 (예: "마포구 폐휴대폰 어디에 버리나요" → `/서울특별시/마포구`)
   - 지식iN에서 "폐가전 어디에 버리나요" 류 질문에 답하며 근거 링크로 제시
   - 네이버 플레이스/지도는 이 사이트가 오프라인 사업장이 아니라 해당 없음

한편 **구글·Bing 쪽 기대치는 다르다.** 이 사이트는 공공데이터 기반의 지역별
고유 콘텐츠 225개 + FAQ 구조화 데이터를 갖고 있어, 롱테일 지역 키워드
("○○구 폐휴대폰 수거함")에서는 구글이 훨씬 빨리 반응할 가능성이 높다.
네이버 대응과 별개로 Search Console 쪽 색인 현황을 함께 보는 것이 좋다.

---

## 관련 파일

| 파일 | 역할 |
|---|---|
| `src/app/rss.xml/route.ts` | RSS 2.0 피드 생성. `Content-Type: application/rss+xml; charset=utf-8` 명시 |
| `src/app/sitemap.ts` | XML 사이트맵 |
| `src/app/robots.txt` | Yeti·Daumoa 허용, `Sitemap:` 2줄 (sitemap.xml, rss.xml) |
| `src/lib/seo.ts` | 페이지 title/description 빌더. 페이지와 RSS가 같은 함수를 쓴다 |
| `src/app/layout.tsx` | `naver-site-verification` 메타태그 |
