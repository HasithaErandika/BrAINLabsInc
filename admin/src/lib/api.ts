// Switch USE_MOCK to false and ensure VITE_API_URL is set in .env.local
// to connect to the real backend.
const USE_MOCK = false;
const BASE_URL = import.meta.env.VITE_API_URL ?? "https://api.brainlabsinc.org";


// ─── Types ────────────────────────────────────────────────────────────────────
export interface Publication {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  doi?: string;
  year: number;
  tags: string[];
  pdf_url?: string;
  venue?: string;
  status: "draft" | "published";
  created_by?: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_url?: string;
  tags: string[];
  status: "draft" | "published";
  published_at?: string;
  created_by?: string;
  created_at: string;
}

export interface ResearchArticle {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  content: string;
  pdf_url?: string;
  tags: string[];
  research_area: string;
  status: "draft" | "published";
  created_by?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  type: "seminar" | "workshop" | "conference";
  tags: string[];
  banner_url?: string;
  max_capacity: number;
  status: "draft" | "published";
  registrations_count?: number;
  created_by?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: "super_admin" | "researcher";
  institution: string;
  created_at: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PUBLICATIONS: Publication[] = [
  {
    id: "1",
    title: "Neuromorphic Computing with Spiking Neural Networks at Scale",
    authors: ["Dr. A. Silva", "Dr. R. Perera", "Dr. M. Fernando"],
    abstract:
      "We present a large-scale neuromorphic architecture leveraging spiking neural networks for energy-efficient AI inference at the edge.",
    doi: "10.1145/3492321.3519568",
    year: 2025,
    tags: ["SNN", "Neuromorphic", "Edge AI"],
    venue: "NeurIPS 2025",
    status: "published",
    created_at: "2025-11-01T08:00:00Z",
  },
  {
    id: "2",
    title: "Adversarial Robustness in Large Language Models: A Systematic Study",
    authors: ["Dr. K. Bandara", "Dr. T. Jayasinghe"],
    abstract:
      "This paper systematically evaluates the adversarial robustness of leading LLMs under a novel attack taxonomy covering prompt injection, jailbreaks and model extraction.",
    year: 2025,
    tags: ["LLMs", "AI Security", "Adversarial ML"],
    venue: "IEEE S&P 2025",
    status: "published",
    created_at: "2025-09-15T08:00:00Z",
  },
  {
    id: "3",
    title: "BrAIN Cortex: An Open Framework for Brain-Computer Interfaces",
    authors: ["Dr. A. Silva", "Dr. P. Wickrama"],
    abstract:
      "BrAIN Cortex is an open-source framework providing standardised data pipelines and model interfaces for non-invasive BCI research.",
    year: 2026,
    tags: ["BCI", "NeuroHealth", "Open Source"],
    venue: "ICLR 2026",
    status: "draft",
    created_at: "2026-01-10T08:00:00Z",
  },
];

const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "The Future of Neuromorphic AI at BrAIN Labs",
    slug: "future-neuromorphic-ai-brain-labs",
    content: "# The Future of Neuromorphic AI\n\nNeuromorphic computing represents a fundamental shift...",
    excerpt: "How spiking neural networks are reshaping edge intelligence at BrAIN Labs.",
    tags: ["Neuromorphic", "Research"],
    status: "published",
    published_at: "2025-12-01T08:00:00Z",
    created_at: "2025-11-28T08:00:00Z",
  },
  {
    id: "2",
    title: "Launching the avi0ra Research Seminar Series",
    slug: "avi0ra-seminar-series-2026",
    content: "# Seminar Series Announcement\n\nWe are excited to announce...",
    excerpt: "Monthly research seminars open to the broader AI community.",
    tags: ["Events", "Community"],
    status: "draft",
    created_at: "2026-01-05T08:00:00Z",
  },
];

const MOCK_RESEARCH: ResearchArticle[] = [
  {
    id: "1",
    title: "Spiking Transformers for Low-Power Vision Tasks",
    authors: ["Dr. A. Silva"],
    abstract: "We propose Spiking Transformers (SpikFormer) that combine the attention mechanism with biologically-plausible spike coding.",
    content: "## Introduction\n\nSpiking neural networks offer...",
    research_area: "Spiking Neural Networks",
    tags: ["SNN", "Transformers", "Vision"],
    status: "published",
    created_at: "2025-10-01T08:00:00Z",
  },
  {
    id: "2",
    title: "Prompt Injection Defenses for Production LLM Systems",
    authors: ["Dr. K. Bandara"],
    abstract: "We survey and evaluate prompt injection defenses across a standardised benchmark of 500 attack scenarios.",
    content: "## Background\n\nPrompt injection attacks...",
    research_area: "AI Security",
    tags: ["LLMs", "Security", "Prompting"],
    status: "draft",
    created_at: "2026-02-10T08:00:00Z",
  },
];

const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "BrAIN Labs Annual Symposium 2026",
    description: "A full-day symposium showcasing our latest research across all focus areas.",
    event_date: "2026-07-15T09:00:00Z",
    location: "University of Colombo, Sri Lanka",
    type: "conference",
    tags: ["Research", "AI"],
    max_capacity: 300,
    registrations_count: 147,
    status: "published",
    created_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "2",
    title: "Intro to Spiking Neural Networks — Workshop",
    description: "Hands-on workshop covering SNN fundamentals, the Brian2 library, and practical edge deployment.",
    event_date: "2026-04-20T10:00:00Z",
    location: "Online (Zoom)",
    type: "workshop",
    tags: ["SNN", "Tutorial"],
    max_capacity: 100,
    registrations_count: 62,
    status: "published",
    created_at: "2026-02-01T08:00:00Z",
  },
  {
    id: "3",
    title: "AI Security Research Seminar — Q2 2026",
    description: "Panel discussion on emerging threats to production AI systems.",
    event_date: "2026-05-10T15:00:00Z",
    location: "BrAIN Labs HQ",
    type: "seminar",
    tags: ["Security", "Research"],
    max_capacity: 50,
    registrations_count: 0,
    status: "draft",
    created_at: "2026-03-01T08:00:00Z",
  },
];

const MOCK_USERS: UserProfile[] = [
  {
    id: "1",
    full_name: "Dr. Asel Silva",
    email: "asel@brainlabsinc.org",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=000000&textColor=ffffff",
    role: "super_admin",
    institution: "BrAIN Labs",
    created_at: "2024-01-01T08:00:00Z",
  },
  {
    id: "2",
    full_name: "Dr. Kasun Bandara",
    email: "kasun@brainlabsinc.org",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=KB&backgroundColor=000000&textColor=ffffff",
    role: "researcher",
    institution: "BrAIN Labs",
    created_at: "2024-03-15T08:00:00Z",
  },
  {
    id: "3",
    full_name: "Dr. Rasika Perera",
    email: "rasika@brainlabsinc.org",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=RP&backgroundColor=000000&textColor=ffffff",
    role: "researcher",
    institution: "BrAIN Labs",
    created_at: "2024-06-01T08:00:00Z",
  },
];

// ─── Request helper ───────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ─── Simulated delay for mock ─────────────────────────────────────────────────
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ─── API ──────────────────────────────────────────────────────────────────────
export const api = {
  publications: {
    list: async (token: string): Promise<Publication[]> => {
      if (USE_MOCK) { await delay(); return MOCK_PUBLICATIONS; }
      return request<Publication[]>("/admin/publications", token);
    },
    create: async (token: string, data: Partial<Publication>): Promise<Publication> => {
      if (USE_MOCK) { await delay(); return { ...data, id: String(Date.now()), status: "draft", created_at: new Date().toISOString() } as Publication; }
      return request<Publication>("/admin/publications", token, { method: "POST", body: JSON.stringify(data) });
    },
    update: async (token: string, id: string, data: Partial<Publication>): Promise<Publication> => {
      if (USE_MOCK) { await delay(); return { ...MOCK_PUBLICATIONS[0], ...data, id } as Publication; }
      return request<Publication>(`/admin/publications/${id}`, token, { method: "PUT", body: JSON.stringify(data) });
    },
    delete: async (token: string, id: string): Promise<void> => {
      if (USE_MOCK) { await delay(); return; }
      await request(`/admin/publications/${id}`, token, { method: "DELETE" });
    },
    summarize: async (token: string, abstract: string): Promise<{ summary: string }> => {
      if (USE_MOCK) { await delay(1200); return { summary: "AI-generated summary: " + abstract.slice(0, 120) + "..." }; }
      return request<{ summary: string }>("/admin/publications/summarize", token, { method: "POST", body: JSON.stringify({ abstract }) });
    },
  },
  blog: {
    list: async (token: string): Promise<BlogPost[]> => {
      if (USE_MOCK) { await delay(); return MOCK_BLOG_POSTS; }
      return request<BlogPost[]>("/admin/blog", token);
    },
    create: async (token: string, data: Partial<BlogPost>): Promise<BlogPost> => {
      if (USE_MOCK) { await delay(); return { ...data, id: String(Date.now()), status: "draft", created_at: new Date().toISOString() } as BlogPost; }
      return request<BlogPost>("/admin/blog", token, { method: "POST", body: JSON.stringify(data) });
    },
    update: async (token: string, id: string, data: Partial<BlogPost>): Promise<BlogPost> => {
      if (USE_MOCK) { await delay(); return { ...MOCK_BLOG_POSTS[0], ...data, id } as BlogPost; }
      return request<BlogPost>(`/admin/blog/${id}`, token, { method: "PUT", body: JSON.stringify(data) });
    },
    delete: async (token: string, id: string): Promise<void> => {
      if (USE_MOCK) { await delay(); return; }
      await request(`/admin/blog/${id}`, token, { method: "DELETE" });
    },
  },
  research: {
    list: async (token: string): Promise<ResearchArticle[]> => {
      if (USE_MOCK) { await delay(); return MOCK_RESEARCH; }
      return request<ResearchArticle[]>("/admin/research", token);
    },
    create: async (token: string, data: Partial<ResearchArticle>): Promise<ResearchArticle> => {
      if (USE_MOCK) { await delay(); return { ...data, id: String(Date.now()), status: "draft", created_at: new Date().toISOString() } as ResearchArticle; }
      return request<ResearchArticle>("/admin/research", token, { method: "POST", body: JSON.stringify(data) });
    },
    update: async (token: string, id: string, data: Partial<ResearchArticle>): Promise<ResearchArticle> => {
      if (USE_MOCK) { await delay(); return { ...MOCK_RESEARCH[0], ...data, id } as ResearchArticle; }
      return request<ResearchArticle>(`/admin/research/${id}`, token, { method: "PUT", body: JSON.stringify(data) });
    },
    delete: async (token: string, id: string): Promise<void> => {
      if (USE_MOCK) { await delay(); return; }
      await request(`/admin/research/${id}`, token, { method: "DELETE" });
    },
    classify: async (token: string, abstract: string): Promise<{ area: string }> => {
      if (USE_MOCK) { await delay(1200); return { area: "Spiking Neural Networks" }; }
      return request<{ area: string }>("/admin/research/classify", token, { method: "POST", body: JSON.stringify({ abstract }) });
    },
  },
  events: {
    list: async (token: string): Promise<Event[]> => {
      if (USE_MOCK) { await delay(); return MOCK_EVENTS; }
      return request<Event[]>("/admin/events", token);
    },
    create: async (token: string, data: Partial<Event>): Promise<Event> => {
      if (USE_MOCK) { await delay(); return { ...data, id: String(Date.now()), status: "draft", registrations_count: 0, created_at: new Date().toISOString() } as Event; }
      return request<Event>("/admin/events", token, { method: "POST", body: JSON.stringify(data) });
    },
    update: async (token: string, id: string, data: Partial<Event>): Promise<Event> => {
      if (USE_MOCK) { await delay(); return { ...MOCK_EVENTS[0], ...data, id } as Event; }
      return request<Event>(`/admin/events/${id}`, token, { method: "PUT", body: JSON.stringify(data) });
    },
    delete: async (token: string, id: string): Promise<void> => {
      if (USE_MOCK) { await delay(); return; }
      await request(`/admin/events/${id}`, token, { method: "DELETE" });
    },
  },
  users: {
    list: async (token: string): Promise<UserProfile[]> => {
      if (USE_MOCK) { await delay(); return MOCK_USERS; }
      return request<UserProfile[]>("/admin/users", token);
    },
    updateRole: async (token: string, id: string, role: string): Promise<UserProfile> => {
      if (USE_MOCK) { await delay(); return { ...MOCK_USERS[0], id, role: role as "super_admin" | "researcher" }; }
      return request<UserProfile>(`/admin/users/${id}/role`, token, { method: "PUT", body: JSON.stringify({ role }) });
    },
  },
};
