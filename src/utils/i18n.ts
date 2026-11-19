import { defaultLanguage, languageMeta, languages as siteLanguages, type Lang } from "../data/site";

/**
 * Single source of truth for interface text.
 * Add a key to `en` first - TypeScript then requires it in `id`.
 */
const en = {
  common: {
    skipToContent: "Skip to content",
    menu: "Menu",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    mainNav: "Main navigation",
    footerNav: "Footer navigation",
    toggleTheme: "Toggle color theme",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    themeLight: "Switch to light theme",
    themeDark: "Switch to dark theme",
    switchLanguage: "Switch language",
    readArticle: "Read article",
    viewAll: "View all",
    home: "Home",
    copy: "Copy",
    copyCode: "Copy code",
    copied: "Copied",
    reset: "Reset",
    resetFilters: "Reset filters",
    sampleBadge: "Sample content",
    sampleContentNote: "Demonstration article shipped with this template. The scenario, evidence, and results are illustrative, so replace them with your own reviewed work before publishing.",
    minRead: "min read",
    published: "Published",
    updated: "Updated",
    category: "Category",
    tags: "Tags",
    rss: "RSS feed",
    external: "opens in a new tab",
    loading: "Loading",
    all: "All",
    close: "Close",
    backToTop: "Back to top"
  },
  home: {
    terminalTitle: "~/profile - zsh",
    terminalCommand: "whoami",
    terminalLines: [
      "Independent cybersecurity consultant",
      "Focus: web, API, and mobile application security",
      "Currently documenting what I break in the lab"
    ],
    availabilityLabel: "Availability",
    ctaWork: "Explore my work",
    ctaArticles: "Read my articles",
    ctaContact: "Contact me",
    aboutTitle: "Security work grounded in evidence",
    aboutLink: "More about me",
    expertiseTitle: "Where I can help",
    expertiseIntro: "Focused security services, each scoped to produce evidence your team can act on.",
    projectsTitle: "Projects & experiments",
    projectsIntro: "Lab research, tooling, and workflow experiments. Demonstration entries are clearly labelled.",
    projectsLink: "View portfolio",
    latestTitle: "Latest articles",
    latestIntro: "Technical writeups, field notes, and practical lessons.",
    latestLink: "All articles",
    contactTitle: "Have a security topic to discuss?",
    contactText: "I am open to conversations about application security, security research, and technical collaboration.",
    contactLink: "Get in touch"
  },
  about: {
    title: "About me",
    backgroundTitle: "Background",
    interestsTitle: "Security interests",
    focusTitle: "Technical focus",
    toolsTitle: "Tools & technologies",
    philosophyTitle: "How I work",
    contactTitle: "Let's work together",
    contactText: "If you are preparing an assessment, need a second pair of eyes on a design, or want to discuss a research idea, get in touch.",
    availabilityLabel: "Availability",
    placeholderNote: "Placeholder content: replace your name, location, biography, and links in src/data/site.ts. Nothing here claims a certification, employer, or client engagement."
  },
  portfolio: {
    title: "Portfolio",
    intro: "Projects, tooling experiments, and professional work. Anything sensitive or client-specific stays private.",
    filterLabel: "Filter projects by category",
    allCategories: "All",
    empty: "No projects in this category yet.",
    demoNote: "All projects on this page are demonstration entries. Replace them in src/data/projects.ts before publishing.",
    statusLabel: "Status",
    statusConcept: "Concept",
    statusActive: "Active",
    statusCompleted: "Completed",
    statusArchived: "Archived",
    techLabel: "Technologies",
    periodLabel: "Period",
    viewRepository: "Repository",
    viewProject: "Project page",
    detailNote: "Project detail pages are optional. Add one when you have sanitized material to publish."
  },
  listing: {
    searchLabel: "Search articles",
    searchPlaceholder: "Search title, excerpt, tags, or content...",
    clearSearch: "Clear search",
    categoryLabel: "Category",
    tagLabel: "Tag",
    allCategories: "All categories",
    allTags: "All tags",
    sortLabel: "Sort articles",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    results: "{count} articles",
    resultsOne: "1 article",
    noResults: "No articles match your filters.",
    noResultsHint: "Try a different keyword, pick another category, or reset the filters.",
    loadMore: "Load more",
    loadMoreHint: "Showing {shown} of {total}",
    showingAll: "Showing all {total} articles",
    availableIn: "Only available in {language}",
    bodySearchNote: "Content search loads on demand and stays in your browser.",
    sampleNote: "Articles marked 'Sample content' ship with this template and describe illustrative scenarios. Replace them with your own reviewed work before publishing."
  },
  notes: {
    title: "Notes",
    intro: "Short technical notes, learning logs, and observations from security work. Articles appear in the language they were written in unless a translation exists."
  },
  writeups: {
    title: "Writeups",
    intro: "In-depth analysis with scope, methodology, evidence, impact, and remediation.",
    disclosureTitle: "Responsible disclosure",
    disclosureText: "Every technique documented here was exercised in a lab or under explicit authorization. No client identity, credential, production endpoint, or confidential finding is published."
  },
  article: {
    authorLabel: "Author",
    readingTime: "{minutes} min read",
    tocTitle: "On this page",
    relatedTitle: "Related articles",
    previous: "Previous article",
    next: "Next article",
    backToSection: "Back to {section}",
    machineTranslationNote: "This translation was generated automatically and has not been fully reviewed. The original article remains authoritative.",
    reviewedTranslationNote: "This translation was reviewed manually.",
    missingTranslationNote: "A {language} version of this article is not available yet, so the original version is shown.",
    alsoAvailableIn: "Also available in",
    copyCode: "Copy code",
    copied: "Copied to clipboard",
    copyFailed: "Could not copy - select the code manually.",
    share: "Share this article",
    disclosure: "All testing was performed in authorized environments. No client data or confidential findings are published.",
    lastUpdated: "Last updated",
    tagsLabel: "Tags",
    publishedLabel: "Published"
  },
  contact: {
    title: "Let's connect",
    intro: "Open to security assessments, focused research, and technical collaborations. The fastest route is email.",
    emailLabel: "Email",
    socialLabel: "Professional profiles",
    availabilityLabel: "Availability",
    responseNote: "I usually reply within a few business days. Please include scope and timeline for project enquiries.",
    formTitle: "Draft a message",
    formNote: "This form does not submit to a server. It prepares a message in your own email client, so nothing is sent or stored by this website.",
    formName: "Your name",
    formEmail: "Your email",
    formSubject: "Subject",
    formMessage: "Message",
    formSubmit: "Open in email client",
    formError: "Add your name, email, and a message before continuing.",
    subjectPlaceholder: "Security assessment enquiry",
    mailtoFallback: "Prefer email? Write to {email}"
  },
  footer: {
    tagline: "Security research, technical writeups, and practical engineering notes.",
    builtWith: "Static site built with Astro. Content synchronized from Notion. Translations via Google Translate (Apps Script).",
    rights: "All rights reserved.",
    disclaimer: "Demonstration content is labelled. Opinions are my own.",
    navLabel: "Footer navigation",
    socialLabel: "Social profiles"
  },
  notFound: {
    title: "404 - page not found",
    text: "The page you are looking for moved, was renamed, or never existed. The notes archive is still here.",
    cta: "Return home",
    notesCta: "Browse notes"
  }
};
/** Indonesian interface text. */
const id: typeof en = {
  common: {
    skipToContent: "Lewati ke konten",
    menu: "Menu",
    openMenu: "Buka menu navigasi",
    closeMenu: "Tutup menu navigasi",
    mainNav: "Navigasi utama",
    footerNav: "Navigasi footer",
    toggleTheme: "Ubah tema warna",
    themeToLight: "Gunakan tema terang",
    themeToDark: "Gunakan tema gelap",
    themeLight: "Gunakan tema terang",
    themeDark: "Gunakan tema gelap",
    switchLanguage: "Ubah bahasa",
    readArticle: "Baca artikel",
    viewAll: "Lihat semua",
    home: "Beranda",
    copy: "Salin",
    copyCode: "Salin kode",
    copied: "Tersalin",
    reset: "Atur ulang",
    resetFilters: "Atur ulang filter",
    sampleBadge: "Konten contoh",
    sampleContentNote: "Artikel demonstrasi bawaan template ini. Skenario, bukti, dan hasilnya bersifat ilustratif, jadi ganti dengan karya Anda yang sudah ditinjau sebelum publikasi.",
    minRead: "menit baca",
    published: "Diterbitkan",
    updated: "Diperbarui",
    category: "Kategori",
    tags: "Tag",
    rss: "Feed RSS",
    external: "terbuka di tab baru",
    loading: "Memuat",
    all: "Semua",
    close: "Tutup",
    backToTop: "Kembali ke atas"
  },
  home: {
    terminalTitle: "~/profil - zsh",
    terminalCommand: "whoami",
    terminalLines: [
      "Konsultan keamanan siber independen",
      "Fokus: keamanan aplikasi web, API, dan mobile",
      "Sedang mendokumentasikan apa yang saya uji di lab"
    ],
    availabilityLabel: "Ketersediaan",
    ctaWork: "Lihat pekerjaan saya",
    ctaArticles: "Baca artikel saya",
    ctaContact: "Hubungi saya",
    aboutTitle: "Pekerjaan keamanan yang berbasis bukti",
    aboutLink: "Selengkapnya tentang saya",
    expertiseTitle: "Area yang dapat saya bantu",
    expertiseIntro: "Layanan keamanan yang terfokus, masing-masing dirancang untuk menghasilkan bukti yang dapat ditindaklanjuti tim Anda.",
    projectsTitle: "Proyek & eksperimen",
    projectsIntro: "Riset laboratorium, tooling, dan eksperimen alur kerja. Entri demonstrasi diberi label secara jelas.",
    projectsLink: "Lihat portofolio",
    latestTitle: "Artikel terbaru",
    latestIntro: "Technical writeup, catatan lapangan, dan pelajaran praktis.",
    latestLink: "Semua artikel",
    contactTitle: "Ada topik keamanan yang ingin didiskusikan?",
    contactText: "Saya terbuka untuk diskusi tentang keamanan aplikasi, riset keamanan, dan kolaborasi teknis.",
    contactLink: "Hubungi saya"
  },
  about: {
    title: "Tentang saya",
    backgroundTitle: "Latar belakang",
    interestsTitle: "Minat keamanan",
    focusTitle: "Fokus teknis",
    toolsTitle: "Tool & teknologi",
    philosophyTitle: "Cara saya bekerja",
    contactTitle: "Mari bekerja sama",
    contactText: "Jika Anda sedang menyiapkan asesmen, membutuhkan pendapat kedua atas sebuah desain, atau ingin mendiskusikan ide riset, silakan hubungi saya.",
    availabilityLabel: "Ketersediaan",
    placeholderNote: "Konten placeholder: ganti nama, kota, biografi, dan tautan Anda di src/data/site.ts. Tidak ada sertifikasi, perusahaan, atau keterlibatan klien yang diklaim di sini."
  },
  portfolio: {
    title: "Portofolio",
    intro: "Proyek, eksperimen tooling, dan pekerjaan profesional. Materi sensitif atau spesifik klien tetap privat.",
    filterLabel: "Filter proyek berdasarkan kategori",
    allCategories: "Semua",
    empty: "Belum ada proyek pada kategori ini.",
    demoNote: "Semua proyek di halaman ini adalah entri demonstrasi. Ganti dengan data Anda di src/data/projects.ts sebelum dipublikasikan.",
    statusLabel: "Status",
    statusConcept: "Konsep",
    statusActive: "Aktif",
    statusCompleted: "Selesai",
    statusArchived: "Diarsipkan",
    techLabel: "Teknologi",
    periodLabel: "Periode",
    viewRepository: "Repositori",
    viewProject: "Halaman proyek",
    detailNote: "Halaman detail proyek bersifat opsional. Tambahkan jika Anda memiliki materi yang sudah disanitasi."
  },
  listing: {
    searchLabel: "Cari artikel",
    searchPlaceholder: "Cari judul, ringkasan, tag, atau isi...",
    clearSearch: "Hapus pencarian",
    categoryLabel: "Kategori",
    tagLabel: "Tag",
    allCategories: "Semua kategori",
    allTags: "Semua tag",
    sortLabel: "Urutkan artikel",
    sortNewest: "Terbaru dulu",
    sortOldest: "Terlama dulu",
    results: "{count} artikel",
    resultsOne: "1 artikel",
    noResults: "Tidak ada artikel yang cocok dengan filter Anda.",
    noResultsHint: "Coba kata kunci lain, pilih kategori berbeda, atau atur ulang filter.",
    loadMore: "Muat lebih banyak",
    loadMoreHint: "Menampilkan {shown} dari {total}",
    showingAll: "Menampilkan seluruh {total} artikel",
    availableIn: "Hanya tersedia dalam {language}",
    bodySearchNote: "Pencarian isi dimuat sesuai permintaan dan tetap berada di browser Anda.",
    sampleNote: "Artikel bertanda 'Konten contoh' adalah bawaan template dan menggambarkan skenario ilustratif. Ganti dengan karya Anda sendiri yang sudah ditinjau sebelum publikasi."
  },
  notes: {
    title: "Catatan",
    intro: "Catatan teknis singkat, log pembelajaran, dan pengamatan dari pekerjaan keamanan. Artikel tampil dalam bahasa aslinya kecuali tersedia terjemahan."
  },
  writeups: {
    title: "Writeups",
    intro: "Analisis mendalam dengan ruang lingkup, metodologi, bukti, dampak, dan rekomendasi perbaikan.",
    disclosureTitle: "Pengungkapan yang bertanggung jawab",
    disclosureText: "Setiap teknik yang didokumentasikan di sini diuji di laboratorium atau berdasarkan izin eksplisit. Tidak ada identitas klien, kredensial, endpoint produksi, atau temuan rahasia yang dipublikasikan."
  },
  article: {
    authorLabel: "Penulis",
    readingTime: "{minutes} menit baca",
    tocTitle: "Di halaman ini",
    relatedTitle: "Artikel terkait",
    previous: "Artikel sebelumnya",
    next: "Artikel berikutnya",
    backToSection: "Kembali ke {section}",
    machineTranslationNote: "Terjemahan ini dihasilkan secara otomatis dan belum ditinjau sepenuhnya. Artikel asli tetap menjadi acuan.",
    reviewedTranslationNote: "Terjemahan ini telah ditinjau secara manual.",
    missingTranslationNote: "Versi {language} dari artikel ini belum tersedia, sehingga versi asli yang ditampilkan.",
    alsoAvailableIn: "Juga tersedia dalam",
    copyCode: "Salin kode",
    copied: "Tersalin ke clipboard",
    copyFailed: "Gagal menyalin - silakan pilih kode secara manual.",
    share: "Bagikan artikel ini",
    disclosure: "Semua pengujian dilakukan pada lingkungan yang sah. Tidak ada data klien atau temuan rahasia yang dipublikasikan.",
    lastUpdated: "Terakhir diperbarui",
    tagsLabel: "Tag",
    publishedLabel: "Diterbitkan"
  },
  contact: {
    title: "Mari terhubung",
    intro: "Terbuka untuk asesmen keamanan, riset terarah, dan kolaborasi teknis. Jalur tercepat adalah email.",
    emailLabel: "Email",
    socialLabel: "Profil profesional",
    availabilityLabel: "Ketersediaan",
    responseNote: "Saya biasanya membalas dalam beberapa hari kerja. Sertakan ruang lingkup dan jadwal untuk pertanyaan proyek.",
    formTitle: "Susun pesan",
    formNote: "Formulir ini tidak mengirim data ke server. Formulir hanya menyiapkan pesan di klien email Anda, sehingga tidak ada data yang dikirim atau disimpan oleh situs ini.",
    formName: "Nama Anda",
    formEmail: "Email Anda",
    formSubject: "Subjek",
    formMessage: "Pesan",
    formSubmit: "Buka di klien email",
    formError: "Isi nama, email, dan pesan sebelum melanjutkan.",
    subjectPlaceholder: "Pertanyaan asesmen keamanan",
    mailtoFallback: "Lebih suka email? Tulis ke {email}"
  },
  footer: {
    tagline: "Riset keamanan, technical writeup, dan catatan rekayasa yang praktis.",
    builtWith: "Situs statis dengan Astro. Konten disinkronkan dari Notion. Terjemahan melalui Google Translate (Apps Script).",
    rights: "Seluruh hak dilindungi.",
    disclaimer: "Konten demonstrasi diberi label. Opini adalah milik pribadi.",
    navLabel: "Navigasi footer",
    socialLabel: "Profil sosial"
  },
  notFound: {
    title: "404 - halaman tidak ditemukan",
    text: "Halaman yang Anda cari telah dipindahkan, diganti nama, atau memang tidak pernah ada. Arsip catatan masih tersedia.",
    cta: "Kembali ke beranda",
    notesCta: "Jelajahi catatan"
  }
};
export type Dictionary = typeof en;

export const dictionaries: Record<Lang, Dictionary> = { en, id };

export function useTranslations(lang: Lang): Dictionary {
  return dictionaries[lang] ?? dictionaries[defaultLanguage];
}

export function isLang(value: string | null | undefined): value is Lang {
  return typeof value === "string" && (siteLanguages as readonly string[]).includes(value);
}

export function otherLanguage(lang: Lang): Lang {
  return lang === "id" ? "en" : "id";
}

export function htmlLang(lang: Lang): string {
  return languageMeta[lang].htmlLang;
}

/** Turn a language-neutral route ("/notes/") into a localized one ("/en/notes/"). */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return clean === "" ? `/${lang}/` : `/${lang}/${clean}/`;
}

/** "/en/notes/my-note/" -> { lang: "en", path: "/notes/my-note/" } */
export function stripLanguagePrefix(pathname: string): { lang: Lang | null; path: string } {
  const match = pathname.match(/^\/(id|en)(\/.*)?$/);
  if (!match) return { lang: null, path: pathname };
  const rest = match[2] || "/";
  return { lang: match[1] as Lang, path: rest.startsWith("/") ? rest : `/${rest}` };
}

export function formatDate(value: string | Date | undefined, lang: Lang): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(htmlLang(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function formatMonth(value: string | Date | undefined, lang: Lang): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(`${value}-01T00:00:00Z`) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(htmlLang(lang), { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(htmlLang(lang)).format(value);
}

/** Replace {placeholder} tokens in a translated string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}




