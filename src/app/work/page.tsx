import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { getWorks } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import CategoryFilter from "@/components/work/CategoryFilter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Works",
  description:
    "스튜디오에그비의 작업물. 브랜드 다큐멘터리, 소셜 콘텐츠, 브랜디드 영상 포트폴리오.",
  alternates: { canonical: "/work" },
};

type Work = {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  category: string;
  thumbnail?: { asset: { _ref: string } };
  year?: number;
  featured?: boolean;
};

const CATEGORY_COLORS: Record<string, { bg: string; hover: string }> = {
  documentary: { bg: "bg-accent-doc", hover: "hover:bg-accent-doc/20" },
  social: { bg: "bg-accent-social", hover: "hover:bg-accent-social/20" },
  branded: { bg: "bg-accent-branded", hover: "hover:bg-accent-branded/20" },
  etc: { bg: "bg-accent-etc", hover: "hover:bg-accent-etc/20" },
};

export const revalidate = 60;

function getPageRange(count: number, perPage: number, requestedPage: number) {
  const totalPages = Math.max(1, Math.ceil(count / perPage));
  const page = Math.max(1, Math.min(totalPages, requestedPage));
  const start = (page - 1) * perPage;
  return { page, totalPages, start, end: start + perPage };
}

function WorkPagination({
  page, totalPages, category, display,
}: {
  page: number;
  totalPages: number;
  category?: string;
  display: string;
}) {
  if (totalPages <= 1) return null;

  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((number) => number >= 1 && number <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav aria-label="작업물 목록 페이지" className={`mt-8 items-center justify-center gap-1 ${display}`}>
      {pages.map((number, index) => (
        <Fragment key={number}>
          {index > 0 && number - pages[index - 1] > 1 && (
            <span aria-hidden="true" className="px-1 text-ink/40">…</span>
          )}
          <Link
            href={{
              pathname: "/work",
              query: { ...(category && { category }), ...(number > 1 && { page: number }) },
            }}
            aria-label={`${number}페이지`}
            aria-current={number === page ? "page" : undefined}
            className={`inline-flex h-11 min-w-11 items-center justify-center border px-2 text-sm ${
              number === page ? "border-ink bg-ink text-bg" : "border-ink/20 hover:border-ink"
            }`}
          >
            {number}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string | string[] }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const works: Work[] = await getWorks(category);
  const requestedPage = typeof pageParam === "string" && /^\d+$/.test(pageParam) ? Number(pageParam) : 1;
  const mobile = getPageRange(works.length, 6, requestedPage);
  const desktop = getPageRange(works.length, 12, requestedPage);
  // 두 화면에 공통인 카드는 한 번만 렌더링한다.
  const visibleWorks = works.flatMap((work, index) => {
    const onMobile = index >= mobile.start && index < mobile.end;
    const onDesktop = index >= desktop.start && index < desktop.end;
    if (onMobile && onDesktop) return [{ work, display: "" }];
    if (onMobile) return [{ work, display: "md:hidden" }];
    if (onDesktop) return [{ work, display: "hidden md:block" }];
    return [];
  });

  return (
    <>
      {/* 헤드라인 */}
      <section className="pt-28 md:pt-32 pb-4">
        <div className="container-page">
          <h1 className="font-display text-[clamp(32px,5vw,56px)] font-semibold tracking-tight">
            WORKS
          </h1>
        </div>
      </section>

      {/* 라인 */}
      <div className="container-page">
        <div className="border-b border-ink" />
      </div>

      {/* 필터 */}
      <section className="py-4">
        <div className="container-page">
          <CategoryFilter current={category} />
        </div>
      </section>

      {/* 라인 */}
      <div className="container-page">
        <div className="border-b border-ink/10" />
      </div>

      {/* 그리드 */}
      <section className="py-8 md:py-12">
        <div className="container-page">
          {works.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-ink/30">등록된 작업물이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10">
              {visibleWorks.map(({ work, display }) => {
                const colors = CATEGORY_COLORS[work.category] || CATEGORY_COLORS.etc;
                return (
                  <Link
                    key={work._id}
                    href={`/work/${work.slug.current}`}
                    className={`group bg-bg p-4 md:p-5 transition-colors duration-300 ${colors.hover} ${display}`}
                  >
                    <div className="aspect-video overflow-hidden bg-ink/5 mb-3">
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
                    <h3 className="font-semibold text-[15px]">{work.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      {work.client && (
                        <span className="text-sm text-ink/40">{work.client}</span>
                      )}
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full capitalize ${colors.bg}`}
                      >
                        {work.category}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <WorkPagination page={mobile.page} totalPages={mobile.totalPages} category={category} display="flex md:hidden" />
          <WorkPagination page={desktop.page} totalPages={desktop.totalPages} category={category} display="hidden md:flex" />
        </div>
      </section>
    </>
  );
}
