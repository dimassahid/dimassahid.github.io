/**
 * Central personal branding + site configuration.
 *
 * Every value marked YOUR_* / example.com is a placeholder. Edit this file (and
 * src/data/projects.ts) to rebrand the site - no personal information should be
 * hardcoded inside components.
 */

export type Lang = "id" | "en";

export const languages = ["id", "en"] as const;

/**
 * Language used for the root redirect (/), x-default hreflang and for
 * translation fallbacks. Change to "en" if English is your primary language.
 */
export const defaultLanguage: Lang = "en";

export const languageMeta: Record<Lang, { label: string; short: string; htmlLang: string; ogLocale: string }> = {
  id: {
    label: "Bahasa Indonesia",
    short: "ID",
    htmlLang: "id-ID",
    ogLocale: "id_ID"
  },
  en: {
    label: "English",
    short: "EN",
    htmlLang: "en",
    ogLocale: "en_US"
  }
};

const FALLBACK_SITE_URL = "https://your-site.pages.dev";

/** Canonical site URL. Set SITE_URL in .env / Cloudflare Pages env variables. */
export const siteUrl = String(import.meta.env.SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, "");

export const site = {
  url: siteUrl,
  /** Display name. */
  name: "Dimas Sahid Abdullah",
  /** Short text mark kept as a fallback; navbar and footer render /images/logo-mark.png. */
  initials: "Sahid",
  role: {
    id: "Konsultan Keamanan Siber",
    en: "Cybersecurity Consultant"
  },
  /** Primary tagline used on the homepage and in metadata. */
  tagline: {
    id: "Menjelajah keamanan. Menguji asumsi. Membangun ketahanan.",
    en: "Exploring Security. Breaking Assumptions. Building Resilience."
  },
  taglineAlt: {
    id: "Riset keamanan siber, technical writeup, dan security engineering.",
    en: "Cybersecurity Research, Technical Writeups, and Security Engineering."
  },
  /** Short description used in meta tags, RSS and social cards. */
  description: {
    id: "Profesional keamanan siber yang membagikan riset, eksperimen teknis, wawasan application security, dan pengetahuan keamanan yang praktis.",
    en: "An independent cybersecurity professional sharing research, technical experiments, application security insights, and practical security knowledge."
  },
  /** Hero paragraph. */
  intro: {
    id: "Saya mendokumentasikan riset keamanan, metode pengujian, catatan rekayasa, dan pelajaran praktis dari laboratorium",
    en: "I document security research, testing methodology, engineering notes, and practical lessons from the lab"
  },
  /** About page biography. Add or remove paragraphs freely. */
  bio: {
    id: [
      "Saya seorang profesional keamanan siber yang berfokus pada pengujian keamanan aplikasi web, API, dan mobile. Pekerjaan saya menggabungkan pengujian ofensif, analisis akar masalah, dan rekomendasi perbaikan yang bisa langsung diterapkan oleh tim engineering.",
      "Di luar proyek pengujian, saya menulis tooling keamanan, mempelajari alur autentikasi yang rumit, dan mendokumentasikan proses reverse engineering aplikasi Android pada lingkungan lab yang sah.",
      "Situs ini adalah knowledge hub pribadi: tempat saya menyimpan catatan teknis, menulis ulang asumsi yang salah, dan berbagi metode yang dapat direproduksi oleh praktisi lain."
    ],
    en: [
      "I am an independent cybersecurity professional focused on web, API, and mobile application security testing. My work combines offensive testing, root-cause analysis, and remediation guidance that engineering teams can act on immediately.",
      "Outside of assessment work, I build security tooling, study complicated authentication flows, and document Android reverse engineering workflows in authorized lab environments.",
      "This site is a personal knowledge hub: a place to keep technical notes, challenge assumptions, and share reproducible methods with other practitioners."
    ]
  },
  /** Placeholder - replace with your own details. */
  location: "Jakarta, Indonesia",
  availability: {
    id: "Terbuka untuk asesmen keamanan, riset terarah, dan kolaborasi teknis.",
    en: "Available for security assessments, focused research, and technical collaboration."
  },
  /** Public contact address. Use an alias you are comfortable publishing. */
  email: "syahid354313@gmail.com",
  /** Social and professional profiles shown in the header/footer/contact page. */
  socials: [
    { key: "github", label: "GitHub", url: "https://github.com/YOUR-USERNAME" },
    { key: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/dimas-sahid-abdullah/" },
    { key: "x", label: "X / Twitter", url: "https://x.com/YOUR-USERNAME" }
  ],
  /** Open Graph image. Replace with a 1200x630 PNG for best results. */
  ogImage: "/images/og-default.svg",
  /** Optional: link to a downloadable CV (leave empty to hide). */
  resumeUrl: ""
} as const;

export const navigation = [
  { key: "home", path: "/", label: { id: "Beranda", en: "Home" } },
  { key: "about", path: "/about/", label: { id: "Tentang", en: "About" } },
  { key: "portfolio", path: "/portfolio/", label: { id: "Portofolio", en: "Portfolio" } },
  { key: "writeups", path: "/writeups/", label: { id: "Writeups", en: "Writeups" } },
  { key: "notes", path: "/notes/", label: { id: "Catatan", en: "Notes" } },
  { key: "contact", path: "/contact/", label: { id: "Kontak", en: "Contact" } }
] as const;

export type NavKey = (typeof navigation)[number]["key"];

export const expertise = [
  {
    code: "WEB",
    title: { id: "Keamanan Aplikasi Web", en: "Web Application Security" },
    description: {
      id: "Pengujian OWASP Top 10, analisis alur bisnis, kontrol akses, dan review konfigurasi keamanan.",
      en: "OWASP Top 10 testing, business-logic analysis, access control review, and security configuration checks."
    }
  },
  {
    code: "API",
    title: { id: "Pengujian Keamanan API", en: "API Security Testing" },
    description: {
      id: "Autentikasi, otorisasi objek-level, rate limiting, dan validasi schema pada REST maupun GraphQL.",
      en: "Authentication, object-level authorization, rate limiting, and schema validation for REST and GraphQL."
    }
  },
  {
    code: "MOB",
    title: { id: "Keamanan Aplikasi Mobile", en: "Mobile Application Security" },
    description: {
      id: "Analisis statis dan dinamis Android, penyimpanan data lokal, pinning, dan perlindungan runtime.",
      en: "Android static and dynamic analysis, local data storage, pinning, and runtime protections."
    }
  },
  {
    code: "PT",
    title: { id: "Penetration Testing", en: "Penetration Testing" },
    description: {
      id: "Metodologi pengujian terarah, validasi dampak, bukti yang dapat direproduksi, dan laporan yang jelas.",
      en: "Scoped testing methodology, impact validation, reproducible evidence, and clear reporting."
    }
  },
  {
    code: "RSCH",
    title: { id: "Riset Keamanan", en: "Security Research" },
    description: {
      id: "Eksperimen laboratorium, analisis akar masalah, dan dokumentasi temuan yang etis.",
      en: "Lab experiments, root-cause analysis, and ethical documentation of findings."
    }
  },
  {
    code: "RE",
    title: { id: "Reverse Engineering", en: "Reverse Engineering" },
    description: {
      id: "Membaca kembali logika aplikasi, protokol proprietary, dan mekanisme proteksi pada lingkungan yang diizinkan.",
      en: "Reading application logic, proprietary protocols, and protection mechanisms in authorized environments."
    }
  },
  {
    code: "AWARE",
    title: { id: "Kesadaran Keamanan", en: "Security Awareness" },
    description: {
      id: "Materi edukasi, simulasi phishing yang etis, dan program perubahan perilaku yang terukur.",
      en: "Educational material, ethical phishing simulations, and measurable behaviour-change programs."
    }
  },
  {
    code: "TOOLS",
    title: { id: "Burp Suite & Pengembangan Tool", en: "Burp Suite & Security Tool Development" },
    description: {
      id: "Ekstensi Burp Suite, otomasi pengujian, dan tool internal untuk pekerjaan yang berulang.",
      en: "Burp Suite extensions, testing automation, and internal tooling for repetitive work."
    }
  },
  {
    code: "INFRA",
    title: { id: "Keamanan Infrastruktur", en: "Infrastructure Security" },
    description: {
      id: "Hardening Linux, keamanan container, manajemen secret, dan review konfigurasi cloud.",
      en: "Linux hardening, container security, secret management, and cloud configuration review."
    }
  }
] as const;

export const skillGroups = [
  {
    title: { id: "Bahasa & Runtime", en: "Languages & Runtimes" },
    items: ["Python", "TypeScript / JavaScript", "Java", "Go", "Bash", "SQL"]
  },
  {
    title: { id: "Tool Keamanan", en: "Security Tooling" },
    items: ["Burp Suite", "MobSF", "Frida", "Nmap", "Wireshark", "sqlmap", "Semgrep"]
  },
  {
    title: { id: "Platform", en: "Platforms" },
    items: ["Linux", "Docker", "Android", "Cloudflare Pages", "GitHub Actions"]
  },
  {
    title: { id: "Praktik", en: "Practices" },
    items: ["OWASP ASVS", "OWASP Top 10", "Threat modeling", "Secure code review", "Responsible disclosure"]
  }
] as const;

export const philosophy = {
  id: [
    "Keamanan bukan checklist. Tujuannya bukan menemukan sebanyak mungkin temuan, tetapi mengurangi risiko nyata yang dihadapi organisasi.",
    "Bukti teknis harus bisa direproduksi, dampaknya dijelaskan dalam bahasa bisnis, dan rekomendasinya dapat diimplementasikan.",
    "Pengujian hanya dilakukan pada sistem yang dimiliki atau diizinkan secara eksplisit. Temuan sensitif tidak dipublikasikan tanpa persetujuan."
  ],
  en: [
    "Security is not a checklist. The goal is not to produce the largest possible list of findings, but to reduce the real risk an organization faces.",
    "Technical evidence must be reproducible, its impact explained in business language, and the remediation actionable.",
    "Testing is performed only on systems you own or are explicitly authorized to assess. Sensitive findings are never published without permission."
  ]
} as const;

