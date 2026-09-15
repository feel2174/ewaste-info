/** 버건디 히어로 안의 핵심 숫자 타일. 문장 속에 묻혀 있던 개수를 한눈에 보이게 한다. */
export default function HeroStats({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="mt-5 grid grid-cols-3 gap-2">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl bg-cream/10 px-2 py-3 text-center ring-1 ring-cream/30">
          <dt className="text-sm text-cream/90 sm:text-base">{s.label}</dt>
          <dd className="mt-0.5 text-2xl font-extrabold sm:text-3xl">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
