/**
 * JSON-LD를 <script type="application/ld+json">으로 심는다.
 * 페이지마다 dangerouslySetInnerHTML을 반복해서 쓰지 않도록 한 군데로 모았다.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
