import Link from "next/link";
import { ALL_GUIDES } from "@/lib/seo";

/**
 * 모든 페이지에서 정보성 가이드로 보내는 교차링크. 깊은 지역 페이지에서 가이드로
 * 내부링크를 흘려보내 색인·순위에 도움을 주고, 사용자에게 다음 단계를 제시한다.
 * `exclude`로 현재 보고 있는 가이드 자신은 목록에서 뺀다.
 */
export default function GuideLinks({
  exclude,
  heading = "버리는 법 가이드",
}: {
  exclude?: string;
  heading?: string;
}) {
  const guides = ALL_GUIDES.filter((g) => g.path !== exclude);
  if (guides.length === 0) return null;

  return (
    <nav className="mt-10" aria-label={heading}>
      <h2 className="text-2xl font-bold text-burgundy">{heading}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {guides.map((g) => (
          <li key={g.path}>
            <Link
              href={g.path}
              className="flex min-h-12 items-start gap-3 rounded-xl border-2 border-copper bg-cream px-4 py-3 hover:bg-copper/20"
            >
              <span aria-hidden="true" className="text-2xl">
                {g.emoji}
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold text-burgundy">{g.title}</span>
                <span className="mt-0.5 block text-base text-zinc-700">{g.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
