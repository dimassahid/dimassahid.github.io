import { credentials, languageMeta, site, siteUrl, type Lang } from "../data/site";

/** Absolute URL for any site-relative path. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${siteUrl}/`).toString();
}

export function ogImageUrl(path?: string): string {
  return absoluteUrl(path ?? site.ogImage);
}

export function formatPageTitle(title?: string): string {
  if (!title) return `${site.name} - ${site.role.en}`;
  return `${title} | ${site.name}`;
}

export interface AlternateLink {
  hreflang: string;
  href: string;
}

/**
 * hreflang links for a page that exists in both languages.
 * `paths` maps a language to the site-relative path of the same content.
 */
export function alternateLinks(paths: Partial<Record<Lang, string>>): AlternateLink[] {
  const links: AlternateLink[] = [];
  for (const [lang, path] of Object.entries(paths)) {
    if (!path) continue;
    links.push({ hreflang: languageMeta[lang as Lang].htmlLang, href: absoluteUrl(path) });
  }
  const fallback = paths.en ?? paths.id;
  if (fallback) {
    links.push({ hreflang: "x-default", href: absoluteUrl(fallback) });
  }
  return links;
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role.en,
    url: `${siteUrl}/`,
    email: site.email,
    description: site.description.en,
    sameAs: site.socials.map((social) => social.url),
    hasCredential: credentials.map((credential) => ({
      "@type": "EducationalOccupationalCredential",
      name: credential.fullName,
      credentialCategory: "certification",
      ...(credential.credentialId ? { identifier: credential.credentialId } : {}),
      ...(credential.verifyUrl ? { url: credential.verifyUrl } : {}),
      recognizedBy: { "@type": "Organization", name: credential.issuer }
    }))
  };
}

export function websiteJsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: `${siteUrl}/${lang}/`,
    inLanguage: languageMeta[lang].htmlLang,
    description: site.description[lang],
    publisher: { "@type": "Person", name: site.name }
  };
}

export interface ArticleJsonLdInput {
  title: string;
  description: string;
  url: string;
  lang: Lang;
  publishDate: Date;
  updatedDate?: Date;
  author?: string;
  tags?: string[];
  image?: string;
}

export function articleJsonLd(input: ArticleJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.url),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(input.url) },
    inLanguage: languageMeta[input.lang].htmlLang,
    datePublished: input.publishDate.toISOString(),
    dateModified: (input.updatedDate ?? input.publishDate).toISOString(),
    image: ogImageUrl(input.image),
    keywords: input.tags?.join(", "),
    author: { "@type": "Person", name: input.author ?? site.name, url: `${siteUrl}/` },
    publisher: { "@type": "Person", name: site.name }
  };
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.path ? { item: absoluteUrl(item.path) } : {})
    }))
  };
}
