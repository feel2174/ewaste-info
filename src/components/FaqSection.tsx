import type { Faq } from "@/lib/seo";

/**
 * FAQ는 JSON-LD로만 넣으면 안 되고(구글 구조화 데이터 정책) 화면에도 같은
 * 내용이 보여야 한다. 서버 컴포넌트로 렌더해 초기 HTML에 그대로 담기게 한다.
 * <details>를 쓰면 접혀 있어도 본문이 DOM에 남아 크롤러가 읽을 수 있다.
 */
export default function FaqSection({
  faqs,
  heading,
  id = "faq",
}: {
  faqs: Faq[];
  heading: string;
  id?: string;
}) {
  return (
    <section className="mt-10" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="text-2xl font-bold text-burgundy">
        {heading}
      </h2>
      <div className="mt-4 space-y-2">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="overflow-hidden rounded-xl border-2 border-burgundy bg-white"
          >
            <summary className="cursor-pointer list-none px-4 py-3 text-lg font-bold text-charcoal hover:bg-cream">
              <span className="mr-2 text-copper">Q.</span>
              {f.q}
            </summary>
            <p className="border-t-2 border-cream px-4 py-3 text-lg text-zinc-700">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
