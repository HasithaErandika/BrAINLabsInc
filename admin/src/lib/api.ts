// ─────────────────────────────────────────────────────────────────────────────
// api.ts — All frontend-to-backend API calls. fetch() only. No Supabase SDK.
// Types match schema.sql exactly.
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

// ─── Types (mirror of schema.sql) ────────────────────────────────────────────

export interface Member {
  id?: string;
  auth_user_id?: string;
  slug: string;
  name: string;
  position?: string;
  university?: string;
  country?: string;
  contact_email?: string;
  linkedin_url?: string;
  image_url?: string;
  summary?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  role?: "super_admin" | "researcher"; // resolved at runtime, not in DB
  created_at?: string;
  updated_at?: string;
}

export interface ResearchInterest {
  id?: string;
  member_id?: string;
  category: "THEORETICAL" | "APPLIED";
  interest_name: string;
  display_order?: number;
}

export interface AcademicQualification {
  id?: string;
  member_id?: string;
  degree: string;
  institution: string;
  period: string;
  details?: string;
  display_order?: number;
}

export interface CareerResponsibility {
  id?: string;
  career_experience_id?: string;
  description: string;
  display_order?: number;
}

export interface CareerExperience {
  id?: string;
  member_id?: string;
  category: "ACADEMIC" | "INDUSTRY" | "VOLUNTEER";
  role: string;
  institution: string;
  period: string;
  display_order?: number;
  career_responsibilities?: CareerResponsibility[];
}

export interface HonoursAndAward {
  id?: string;
  member_id?: string;
  description: string;
  display_order?: number;
}

export interface Membership {
  id?: string;
  member_id?: string;
  organization_name: string;
  display_order?: number;
}

export interface OngoingResearch {
  id?: string;
  member_id?: string;
  research_title: string;
  display_order?: number;
}

export interface MemberCV extends Member {
  research_interests?: ResearchInterest[];
  academic_qualifications?: AcademicQualification[];
  career_experiences?: CareerExperience[];
  honours_and_awards?: HonoursAndAward[];
  memberships?: Membership[];
  ongoing_research?: OngoingResearch[];
}

export interface ResearchPublication {
  id?: string;
  member_id?: string;
  title: string;
  authors: string;
  venue?: string;
  publication_year?: number;
  doi?: string;
  link?: string;
  abstract?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id?: string;
  member_id?: string;
  category: string;
  icon_name?: string;
  description?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  created_at?: string;
  updated_at?: string;
}

export interface ProjectItem {
  id?: string;
  project_id: string;
  title: string;
  description: string;
  display_order: number;
}

export interface Grant {
  id?: string;
  member_id?: string;
  title: string;
  agency: string;
  award_year?: string;
  description?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  created_at?: string;
}

export interface Event {
  id?: string;
  member_id?: string;
  title: string;
  event_type?: string;
  event_date?: string;
  description?: string;
  link?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  created_at?: string;
}

export interface Blog {
  id?: string;
  member_id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  author_name?: string;
  published_date?: string;
  image_url?: string;
  tags?: string[];
  content: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  created_at?: string;
  updated_at?: string;
}

export interface TutorialSeries {
  id?: string;
  member_id?: string;
  slug: string;
  title: string;
  description?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  created_at?: string;
  updated_at?: string;
}

export interface TutorialPage {
  id?: string;
  series_id: string;
  parent_id?: string;
  slug: string;
  title: string;
  content?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

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
  if (!res.ok) {
    const msg = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${msg}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export const api = {
  // ── Me ────────────────────────────────────────────────────────────────────
  me: {
    get: (token: string) => request<Member>("/admin/me", token),
    update: (token: string, data: Partial<Member>) =>
      request<Member>("/admin/me", token, { method: "PUT", body: JSON.stringify(data) }),
    changePassword: (token: string, data: any) =>
      request<{ message: string }>("/admin/me/password", token, { method: "POST", body: JSON.stringify(data) }),
    cv: {
      get: (token: string) => request<MemberCV>("/admin/me/cv", token),
      create: <T>(token: string, section: string, data: Partial<T>) =>
        request<T>(`/admin/me/cv/${section}`, token, { method: "POST", body: JSON.stringify(data) }),
      update: <T>(token: string, section: string, id: string, data: Partial<T>) =>
        request<T>(`/admin/me/cv/${section}/${id}`, token, { method: "PUT", body: JSON.stringify(data) }),
      delete: (token: string, section: string, id: string) =>
        request<void>(`/admin/me/cv/${section}/${id}`, token, { method: "DELETE" }),
    },
  },

  // ── Publications ──────────────────────────────────────────────────────────
  publications: {
    list: (token: string) =>
      request<ResearchPublication[]>("/admin/publications", token),
    create: (token: string, data: Partial<ResearchPublication>) =>
      request<ResearchPublication>("/admin/publications", token, {
        method: "POST", body: JSON.stringify(data),
      }),
    update: (token: string, id: string, data: Partial<ResearchPublication>) =>
      request<ResearchPublication>(`/admin/publications/${id}`, token, {
        method: "PUT", body: JSON.stringify(data),
      }),
    delete: (token: string, id: string) =>
      request<void>(`/admin/publications/${id}`, token, { method: "DELETE" }),
    summarize: (token: string, text: string) =>
      request<{ summary: string }>("/public/summarize", token, {
        method: "POST", body: JSON.stringify({ text }),
      }),
  },

  // ── Blog ──────────────────────────────────────────────────────────────────
  blog: {
    list: (token: string) =>
      request<Blog[]>("/admin/blog", token),
    create: (token: string, data: Partial<Blog>) =>
      request<Blog>("/admin/blog", token, { method: "POST", body: JSON.stringify(data) }),
    update: (token: string, id: string, data: Partial<Blog>) =>
      request<Blog>(`/admin/blog/${id}`, token, { method: "PUT", body: JSON.stringify(data) }),
    delete: (token: string, id: string) =>
      request<void>(`/admin/blog/${id}`, token, { method: "DELETE" }),
  },

  // ── Events ────────────────────────────────────────────────────────────────
  events: {
    list: (token: string) =>
      request<Event[]>("/admin/events", token),
    create: (token: string, data: Partial<Event>) =>
      request<Event>("/admin/events", token, { method: "POST", body: JSON.stringify(data) }),
    update: (token: string, id: string, data: Partial<Event>) =>
      request<Event>(`/admin/events/${id}`, token, { method: "PUT", body: JSON.stringify(data) }),
    delete: (token: string, id: string) =>
      request<void>(`/admin/events/${id}`, token, { method: "DELETE" }),
  },

  // ── Grants ────────────────────────────────────────────────────────────────
  grants: {
    list: (token: string) =>
      request<Grant[]>("/admin/grants", token),
    create: (token: string, data: Partial<Grant>) =>
      request<Grant>("/admin/grants", token, { method: "POST", body: JSON.stringify(data) }),
    update: (token: string, id: string, data: Partial<Grant>) =>
      request<Grant>(`/admin/grants/${id}`, token, { method: "PUT", body: JSON.stringify(data) }),
    delete: (token: string, id: string) =>
      request<void>(`/admin/grants/${id}`, token, { method: "DELETE" }),
  },

  // ── Members ───────────────────────────────────────────────────────────────
  members: {
    list: (token: string) =>
      request<Member[]>("/admin/members", token),
    create: (token: string, data: Partial<Member>) =>
      request<Member>("/admin/members", token, { method: "POST", body: JSON.stringify(data) }),
    updateStatus: (token: string, id: string, status: string) =>
      request<Member>(`/admin/members/${id}`, token, {
        method: "PATCH", body: JSON.stringify({ status }),
      }),
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  projects: {
    list: (token: string) =>
      request<Project[]>("/admin/projects", token),
    create: (token: string, data: Partial<Project>) =>
      request<Project>("/admin/projects", token, { method: "POST", body: JSON.stringify(data) }),
    update: (token: string, id: string, data: Partial<Project>) =>
      request<Project>(`/admin/projects/${id}`, token, { method: "PUT", body: JSON.stringify(data) }),
    delete: (token: string, id: string) =>
      request<void>(`/admin/projects/${id}`, token, { method: "DELETE" }),
  },
  projectItems: {
    list: (token: string, projectId: string) =>
      request<ProjectItem[]>(`/admin/project-items?project_id=${projectId}`, token),
    create: (token: string, data: Partial<ProjectItem>) =>
      request<ProjectItem>("/admin/project-items", token, { method: "POST", body: JSON.stringify(data) }),
    update: (token: string, id: string, data: Partial<ProjectItem>) =>
      request<ProjectItem>(`/admin/project-items/${id}`, token, { method: "PUT", body: JSON.stringify(data) }),
    delete: (token: string, id: string) =>
      request<void>(`/admin/project-items/${id}`, token, { method: "DELETE" }),
  },

  // ── Tutorials ──────────────────────────────────────────────────────────────
  tutorialSeries: {
    list: (token: string) =>
      request<TutorialSeries[]>("/admin/tutorials", token),
    create: (token: string, data: Partial<TutorialSeries>) =>
      request<TutorialSeries>("/admin/tutorials", token, { method: "POST", body: JSON.stringify(data) }),
    update: (token: string, id: string, data: Partial<TutorialSeries>) =>
      request<TutorialSeries>(`/admin/tutorials/${id}`, token, { method: "PUT", body: JSON.stringify(data) }),
    delete: (token: string, id: string) =>
      request<void>(`/admin/tutorials/${id}`, token, { method: "DELETE" }),
  },
  tutorialPages: {
    list: (token: string, seriesId: string) =>
      request<TutorialPage[]>(`/admin/tutorial-pages?series_id=${seriesId}`, token),
    create: (token: string, data: Partial<TutorialPage>) =>
      request<TutorialPage>("/admin/tutorial-pages", token, { method: "POST", body: JSON.stringify(data) }),
    update: (token: string, id: string, data: Partial<TutorialPage>) =>
      request<TutorialPage>(`/admin/tutorial-pages/${id}`, token, { method: "PUT", body: JSON.stringify(data) }),
    delete: (token: string, id: string) =>
      request<void>(`/admin/tutorial-pages/${id}`, token, { method: "DELETE" }),
  },
};
