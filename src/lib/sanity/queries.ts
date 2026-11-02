import { client } from "./client";

/* ── Site Settings ── */
export async function getSiteSettings() {
  return client.fetch(
    `*[_id == "siteSettings" || _type == "siteSettings"][0] {
      heroVideoUrl,
      "heroVideoFiles": heroVideos[].video.asset->url,
      "heroLinkedWorks": heroVideos[]{
        "slug": linkedWork->slug.current
      }
    }`
  );
}

/** 문구·연락처·SEO (어드민 "사이트 설정") */
export async function getSiteContentRaw() {
  return client.fetch(
    `*[_type == "siteSettings"][0] {
      heroTitleKo, heroTitleEn,
      email, phone, address, instagramHandle, instagramUrl, contactMessage,
      seoTitle, seoDescription, seoKeywords,
      "ogImageUrl": ogImage.asset->url,
      googleSiteVerification, naverSiteVerification
    }`
  );
}

/* ── Sitemap ── */
export async function getSitemapEntries() {
  return client.fetch(
    `{
      "works": *[_type == "work" && defined(slug.current)]{ "slug": slug.current, _updatedAt },
      "notes": *[_type == "note" && published == true && defined(slug.current)]{ "slug": slug.current, _updatedAt }
    }`
  );
}

/* ── Work ── */
export async function getWorks(category?: string) {
  const filter = category ? `&& category == $category` : "";
  return client.fetch(
    `*[_type == "work" ${filter}] | order(coalesce(sortOrder, 0) desc, _createdAt desc) {
      _id, title, slug, client, category, thumbnail, year, featured
    }`,
    category ? { category } : {}
  );
}

export async function getWork(slug: string) {
  return client.fetch(
    `*[_type == "work" && slug.current == $slug][0] {
      _id, title, slug, client, category, youtubeUrl, thumbnail,
      year, description, stills, featured, _createdAt,
      "plainDescription": pt::text(description)
    }`,
    { slug }
  );
}

export async function getFeaturedWorks() {
  return client.fetch(
    `*[_type == "work" && featured == true] | order(coalesce(sortOrder, 0) desc, _createdAt desc) {
      _id, title, slug, client, category, thumbnail, year
    }`
  );
}

/* ── About Page ── */
export async function getAboutPage() {
  return client.fetch(
    `*[_type == "aboutPage"][0] {
      headline,
      body,
      processSteps[]{ step, desc }
    }`
  );
}

/* ── Note ── */
export async function getNoteCategories() {
  return client.fetch(
    `*[_type == "noteCategory"] | order(sortOrder asc) {
      _id, name, slug, color
    }`
  );
}

export async function getNotes(categorySlug?: string) {
  const filter = categorySlug
    ? `&& category->slug.current == $categorySlug`
    : "";
  return client.fetch(
    `*[_type == "note" && published == true ${filter}] | order(publishedAt desc) {
      _id, title, slug, thumbnail, publishedAt,
      "categoryName": category->name,
      "categoryColor": category->color,
      "categorySlug": category->slug.current
    }`,
    categorySlug ? { categorySlug } : {}
  );
}

export async function getNote(slug: string) {
  return client.fetch(
    `*[_type == "note" && slug.current == $slug][0] {
      _id, title, slug, thumbnail, publishedAt, body, _updatedAt,
      "categoryName": category->name,
      "categoryColor": category->color,
      "plainBody": pt::text(body)
    }`,
    { slug }
  );
}
