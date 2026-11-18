import type { Lang } from "./site";

export type ProjectStatus = "concept" | "active" | "completed" | "archived";

export interface Project {
  slug: string;
  name: string;
  category: string;
  status: ProjectStatus;
  /** ISO year-month, used for sorting and display. */
  date: string;
  technologies: string[];
  url?: string;
  repository?: string;
  description: Record<Lang, string>;
  highlights?: Record<Lang, string[]>;
  /** Every project below is demonstration content - replace with your own. */
  demo: boolean;
}

/**
 * Sample portfolio entries. These are clearly-labelled demonstrations and must
 * not be read as client work, certifications, or verified achievements.
 */
export const projects: Project[] = [
  {
    slug: "burp-request-signing",
    name: "Burp Suite Request Signing Automation",
    category: "security-tools",
    status: "concept",
    date: "2026-09",
    technologies: ["Java", "Burp Suite API", "HMAC-SHA256"],
    repository: "https://github.com/YOUR-USERNAME/burp-request-signer",
    description: {
      id: "Ekstensi Burp Suite untuk menghitung ulang timestamp dan signature HMAC pada setiap request selama pengujian yang sah, sehingga penguji dapat fokus pada logika aplikasi.",
      en: "A Burp Suite extension that recalculates timestamps and HMAC signatures on every request during authorized testing, letting testers focus on application logic."
    },
    highlights: {
      id: ["Menangani signature per-host", "Konfigurasi scope yang eksplisit", "Logging untuk audit trail"],
      en: ["Per-host signature handling", "Explicit scope configuration", "Audit-friendly logging"]
    },
    demo: true
  },
  {
    slug: "mobile-security-research",
    name: "Mobile Application Security Research",
    category: "mobile-security",
    status: "active",
    date: "2026-07",
    technologies: ["Android", "Frida", "MobSF", "Python"],
    description: {
      id: "Alur kerja laboratorium untuk memeriksa penyimpanan data lokal, pinning sertifikat, dan perlindungan runtime pada aplikasi Android yang diuji secara sah.",
      en: "A lab workflow for inspecting local data storage, certificate pinning, and runtime protections in Android applications tested under authorization."
    },
    highlights: {
      id: ["Checklist statis dan dinamis", "Template laporan yang sudah disanitasi", "Catatan reproduksi temuan"],
      en: ["Static and dynamic checklist", "Sanitized report templates", "Finding reproduction notes"]
    },
    demo: true
  },
  {
    slug: "api-security-workflow",
    name: "API Security Testing Workflow",
    category: "api-security",
    status: "completed",
    date: "2026-05",
    technologies: ["OpenAPI", "Burp Suite", "Python", "pytest"],
    description: {
      id: "Kerangka kerja pengujian API yang menggabungkan spec review, pengujian otorisasi objek-level, dan pengujian otomatis untuk regresi keamanan.",
      en: "An API testing framework combining spec review, object-level authorization testing, and automated checks for security regressions."
    },
    highlights: {
      id: ["Inventaris endpoint otomatis", "Matriks peran dan izin", "Uji regresi untuk CI"],
      en: ["Automated endpoint inventory", "Role and permission matrix", "Regression checks for CI"]
    },
    demo: true
  },
  {
    slug: "security-awareness-program",
    name: "Cybersecurity Awareness Initiative",
    category: "security-awareness",
    status: "concept",
    date: "2026-03",
    technologies: ["Curriculum design", "Phishing simulation", "Metrics"],
    description: {
      id: "Rancangan program kesadaran keamanan yang terdiri dari modul singkat, simulasi phishing etis, dan metrik perilaku yang dapat diukur.",
      en: "A security awareness program design with short modules, ethical phishing simulations, and measurable behaviour metrics."
    },
    highlights: {
      id: ["Modul 10 menit per topik", "Simulasi tanpa hukuman", "Metrik sebelum dan sesudah"],
      en: ["10-minute modules per topic", "Non-punitive simulations", "Before/after metrics"]
    },
    demo: true
  }
];

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => b.date.localeCompare(a.date));
}
