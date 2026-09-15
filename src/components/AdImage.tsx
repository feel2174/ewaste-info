"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

// 페이지를 새로 열 때마다 한 번 뽑는다. 서버 스냅샷은 null이라 SSG HTML과
// 하이드레이션이 어긋나지 않고, 클라이언트에서만 무작위 소재가 채워진다.
// ponytail: 모듈 단위 시드라 같은 탭에서 <Link>로 이동하면 같은 소재가 유지된다. 이동마다 바꾸려면 마운트별 시드로.
const seed = Math.random();
const subscribe = () => () => {};

export default function AdImage({ srcs, alt }: { srcs: string[]; alt: string }) {
  const src = useSyncExternalStore(
    subscribe,
    () => srcs[Math.floor(seed * srcs.length)],
    () => null
  );
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 640px) 240px, 100vw"
      className="object-cover"
    />
  );
}
