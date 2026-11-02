import Link from "next/link";
import Image from "next/image";
import { getFeaturedWorks, getWorks, getSiteSettings, getSiteContentRaw } from "@/lib/sanity/queries";
import { resolveSiteContent } from "@/lib/site";
import { urlFor } from "@/lib/sanity/image";
import HeroVideo, { HeroCarousel } from "@/components/video/HeroVideo";
import HeroYouTube from "@/components/video/HeroYouTube";
import { getYouTubeId } from "@/lib/youtube";

type Work = {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  category: string;
  thumbnail?: { asset: { _ref: string } };
  year?: number;
};

export const revalidate = 60;

export default async function Home() {
  const [featuredWorks, allWorks, settings, siteRaw] = await Promise.all([
    getFeaturedWorks() as Promise<Work[]>,
    getWorks() as Promise<Work[]>,
    getSiteSettings(),
    getSiteContentRaw().catch(() => null),
  ]);
  const site = resolveSiteContent(siteRaw);

  // 대표작이 있으면 대표작, 없으면 전체 작업물에서 정렬순으로 최대 6개
  const displayWorks =
    featuredWorks.length > 0 ? featuredWorks.slice(0, 6) : allWorks.slice(0, 6);

  // 우선순위: 업로드한 MP4(복수) → YouTube 링크.
  // 숨김 처리된 레거시 단일 영상(heroVideo)은 어드민에서 보이지도 지워지지도 않아 사용하지 않는다.
  const heroVideoFiles: string[] = settings?.heroVideoFiles?.filter(Boolean) || [];
  const heroYouTubeId: string | null = settings?.heroVideoUrl
    ? getYouTubeId(settings.heroVideoUrl)
    : null;

  // 히어로에 연결된 Works (Sanity에서 가져옴)
  const heroLinkedWorks: Array<{ slug: string }> = settings?.heroLinkedWorks || [];

  return (
    <>
      {/* ━━━ 슬로건 (국문 + 영문 각 1줄) ━━━ */}
      <section className="pt-36 md:pt-40 pb-4 md:pb-6">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="text-[clamp(16px,2vw,20px)] font-semibold leading-snug tracking-tight">
              {site.heroTitleKo}
            </p>
            <h1 className="font-display text-[clamp(28px,4.5vw,44px)] font-semibold tracking-tight leading-[1.15] mt-1">
              {site.heroTitleEn}
            </h1>
          </div>
        </div>
      </section>

      {/* ━━━ 히어로 ━━━ */}
      <section>
        <div className="container-page">
          {/* 영상 종류와 화면 크기에 관계없이 히어로를 16:9로 표시한다. */}
          <div className="relative aspect-video overflow-hidden bg-bg-dark">
            {heroVideoFiles.length > 1 ? (
              <HeroCarousel sources={heroVideoFiles} linkedWorks={heroLinkedWorks} />
            ) : heroVideoFiles.length === 1 ? (
              <HeroVideo src={heroVideoFiles[0]} linkedWork={heroLinkedWorks[0]?.slug} />
            ) : heroYouTubeId ? (
              <HeroYouTube videoId={heroYouTubeId} />
            ) : (
              <div className="absolute inset-0 bg-bg-dark" />
            )}
          </div>
        </div>
      </section>

      {/* ━━━ WORKS 최대 6개 ━━━ */}
      <div className="container-page">
        <div className="border-b border-ink my-8 md:my-12" />
      </div>

      <section className="pb-8 md:pb-12">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-[clamp(20px,3vw,28px)] font-semibold tracking-tight">
              WORKS
            </h2>
            <Link
              href="/work"
              className="font-display text-xs tracking-[0.08em] uppercase text-ink/40 hover:text-ink border-b border-ink/20 hover:border-ink pb-0.5 transition-colors duration-200"
            >
              VIEW ALL
            </Link>
          </div>

          {displayWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {displayWorks.map((work) => {
                const accentBg =
                  work.category === "documentary"
                    ? "hover:bg-accent-doc/20"
                    : work.category === "social"
                      ? "hover:bg-accent-social/20"
                      : work.category === "branded"
                        ? "hover:bg-accent-branded/20"
                        : "hover:bg-accent-etc/20";
                return (
                  <Link
                    key={work._id}
                    href={`/work/${work.slug.current}`}
                    className={`group transition-colors duration-300 ${accentBg}`}
                  >
                    <div className="aspect-video overflow-hidden bg-ink/5 mb-4">
                      {work.thumbnail ? (
                        <Image
                          src={urlFor(work.thumbnail)
                            .width(600)
                            .height(338)
                            .url()}
                          alt={work.title}
                          width={600}
                          height={338}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink/15">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm">{work.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {work.client && (
                        <span className="text-xs text-ink/40">
                          {work.client}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                          work.category === "documentary"
                            ? "bg-accent-doc"
                            : work.category === "social"
                              ? "bg-accent-social"
                              : work.category === "branded"
                                ? "bg-accent-branded"
                                : "bg-accent-etc"
                        }`}
                      >
                        {work.category}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="border border-ink/10 p-12 text-center">
              <p className="text-ink/30">작업물이 등록되면 표시됩니다.</p>
            </div>
          )}
        </div>
      </section>

    </>
  );
}
