const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

type Method = "GET" | "POST" | "PUT" | "DELETE";

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("primo_token");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request<T = any>(
    method: Method,
    path: string,
    body?: Record<string, unknown>,
    explicitToken?: string
): Promise<T> {
    const token = explicitToken || getToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });

    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.message || `API error ${res.status}`);
    }
    return json.data !== undefined ? json.data : json;
}

// ── Auth ────────────────────────────────────────
export const auth = {
    login: (email: string, password: string) =>
        request("POST", "/auth/login", { email, password }),
    register: (data: Record<string, unknown>) =>
        request("POST", "/auth/register", data),
    me: (token?: string) =>
        request("GET", "/auth/me", undefined, token),
};

// ── Surveys ─────────────────────────────────────
export const surveys = {
    list: () => request("GET", "/surveys"),
    get: (id: number) => request("GET", `/surveys/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/surveys", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/surveys/${id}`, data),
    delete: (id: number) => request("DELETE", `/surveys/${id}`),
    questions: (surveyId: number) => request("GET", `/surveys/${surveyId}/questions`),
    addQuestion: (surveyId: number, data: Record<string, unknown>) => request("POST", `/surveys/${surveyId}/questions`, data),
    updateQuestion: (surveyId: number, qId: number, data: Record<string, unknown>) => request("PUT", `/surveys/${surveyId}/questions/${qId}`, data),
    deleteQuestion: (surveyId: number, qId: number) => request("DELETE", `/surveys/${surveyId}/questions/${qId}`),
    getTargeting: (id: number) => request("GET", `/surveys/${id}/targeting`),
    saveTargeting: (id: number, data: Record<string, unknown>) => request("PUT", `/surveys/${id}/targeting`, data),
    launch: (id: number, data: Record<string, unknown>) => request("POST", `/surveys/${id}/launch`, data),
};

// ── Responses ───────────────────────────────────
export const responses = {
    list: (surveyId: number) => request("GET", `/surveys/${surveyId}/responses`),
    get: (id: number) => request("GET", `/responses/${id}`),
    quality: (surveyId: number) => request("GET", `/surveys/${surveyId}/responses/quality`),
    scoreAll: (surveyId: number) => request("POST", `/surveys/${surveyId}/responses/score-all`),
};

// ── Analysis ────────────────────────────────────
export const analysis = {
    show: (surveyId: number) => request("GET", `/surveys/${surveyId}/analysis`),
    run: (surveyId: number) => request("POST", `/surveys/${surveyId}/analysis/run`),
    chart: (surveyId: number, questionId: number) => request("GET", `/surveys/${surveyId}/analysis/chart/${questionId}`),
};

// ── Exports ─────────────────────────────────────
export const exports_ = {
    list: (surveyId: number) => request("GET", `/surveys/${surveyId}/exports`),
    generate: (surveyId: number, format: string) => request("POST", `/surveys/${surveyId}/exports/${format}`),
};

// ── Subscriptions ───────────────────────────────
export const subscriptions = {
    plans: () => request("GET", "/subscriptions/plans"),
    current: () => request("GET", "/subscriptions/current"),
    checkout: (planKey: string) => request("POST", "/subscriptions/checkout", { plan_key: planKey }),
    verify: (data: Record<string, unknown>) => request("POST", "/subscriptions/verify", data),
    cancel: () => request("POST", "/subscriptions/cancel"),
};

// ── Admin ───────────────────────────────────────
export const admin = {
    dashboard: () => request("GET", "/admin/dashboard"),
    stats: () => request("GET", "/admin/dashboard/stats"),
    charts: (type: string) => request("GET", `/admin/dashboard/charts?type=${type}`),
    activity: () => request("GET", "/admin/dashboard/activity"),
    respondents: () => request("GET", "/admin/respondents"),
    suspendRespondent: (id: number) => request("POST", `/admin/respondents/${id}/suspend`),
    datasets: () => request("GET", "/admin/datasets"),
    publishDataset: (id: number) => request("POST", `/admin/datasets/${id}/publish`),
    unpublishDataset: (id: number) => request("POST", `/admin/datasets/${id}/unpublish`),
    revenue: () => request("GET", "/admin/revenue"),
};

// ── Public ──────────────────────────────────────
export const publicApi = {
    datasets: (q?: string, category?: string) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        const qs = params.toString();
        return request("GET", `/public/datasets${qs ? "?" + qs : ""}`);
    },
    dataset: (id: number) => request("GET", `/public/datasets/${id}`),
    categories: () => request("GET", "/public/datasets/categories"),
    survey: (id: number) => request("GET", `/public/surveys/${id}`),
    submitSurvey: (id: number, data: Record<string, unknown>) => request("POST", `/public/surveys/${id}/submit`, data),
};

// ── Admin Users ─────────────────────────────────
export const adminUsers = {
    list: (params?: Record<string, string>) => {
        const qs = params ? "?" + new URLSearchParams(params).toString() : "";
        return request("GET", `/admin/users${qs}`);
    },
    get: (id: number) => request("GET", `/admin/users/${id}`),
    suspend: (id: number) => request("POST", `/admin/users/${id}/suspend`),
    activate: (id: number) => request("POST", `/admin/users/${id}/activate`),
};

// ── API Keys ────────────────────────────────────
export const apiKeys = {
    list: () => request("GET", "/api-keys"),
    create: (name: string, expiresAt?: string) => request("POST", "/api-keys", { name, expires_at: expiresAt }),
    revoke: (id: number) => request("POST", `/api-keys/${id}/revoke`),
    remove: (id: number) => request("DELETE", `/api-keys/${id}`),
};

// ── Admin CMS ───────────────────────────────────
export const adminCms = {
    menus: () => request("GET", "/admin/cms/menus"),
    saveMenus: (data: Record<string, unknown>) => request("POST", "/admin/cms/menus", data),
    pages: () => request("GET", "/admin/cms/pages"),
    createPage: (data: Record<string, unknown>) => request("POST", "/admin/cms/pages", data),
    getPage: (id: number) => request("GET", `/admin/cms/pages/${id}`),
    updatePage: (id: number, data: Record<string, unknown>) => request("PUT", `/admin/cms/pages/${id}`, data),
    deletePage: (id: number) => request("DELETE", `/admin/cms/pages/${id}`),
    getSections: (pageId: number) => request("GET", `/admin/cms/pages/${pageId}/sections`),
    saveSections: (pageId: number, sections: unknown[]) => request("POST", `/admin/cms/pages/${pageId}/sections`, { sections }),
    getFooter: () => request("GET", "/admin/cms/footer"),
    saveFooter: (data: Record<string, unknown>) => request("POST", "/admin/cms/footer", data),
};

// ── Public CMS ──────────────────────────────────
export const publicCms = {
    menus: () => request("GET", "/public/cms/menus"),
    footer: () => request("GET", "/public/cms/footer"),
    page: (slug: string) => request("GET", `/public/cms/pages/${slug}`),
};

// ── RISE CRM Modules (Phase H) ──────────────────

function crudModule(base: string) {
    return {
        list: (params?: Record<string, string>) => {
            const qs = params ? "?" + new URLSearchParams(params).toString() : "";
            return request("GET", `${base}${qs}`);
        },
        get: (id: number) => request("GET", `${base}/${id}`),
        create: (data: Record<string, unknown>) => request("POST", base, data),
        update: (id: number, data: Record<string, unknown>) => request("PUT", `${base}/${id}`, data),
        remove: (id: number) => request("DELETE", `${base}/${id}`),
    };
}

export const projects = {
    ...crudModule("/projects"),
    members: (id: number) => request("GET", `/projects/${id}/members`),
    milestones: (id: number) => request("GET", `/projects/${id}/milestones`),
};

export const tasks = {
    ...crudModule("/tasks"),
    changeStatus: (id: number, statusId: number) => request("POST", `/tasks/${id}/status`, { status_id: statusId }),
    statuses: () => request("GET", "/tasks/statuses"),
};

export const invoices = {
    ...crudModule("/invoices"),
    payments: (id: number) => request("GET", `/invoices/${id}/payments`),
    addPayment: (id: number, data: Record<string, unknown>) => request("POST", `/invoices/${id}/payments`, data),
};

export const clients = {
    ...crudModule("/clients"),
    contacts: (id: number) => request("GET", `/clients/${id}/contacts`),
    groups: () => request("GET", "/clients/groups"),
};

export const leads = {
    ...crudModule("/leads"),
    statuses: () => request("GET", "/leads/statuses"),
    sources: () => request("GET", "/leads/sources"),
};

export const expenses = {
    ...crudModule("/expenses"),
    categories: () => request("GET", "/expenses/categories"),
};

export const tickets = {
    ...crudModule("/tickets"),
    comments: (id: number) => request("GET", `/tickets/${id}/comments`),
    addComment: (id: number, data: Record<string, unknown>) => request("POST", `/tickets/${id}/comments`, data),
    types: () => request("GET", "/tickets/types"),
};

export const events = crudModule("/events");

export const team = crudModule("/team");

export const timesheets = crudModule("/timesheets");

export const attendance = {
    list: (params?: Record<string, string>) => {
        const qs = params ? "?" + new URLSearchParams(params).toString() : "";
        return request("GET", `/attendance${qs}`);
    },
    status: () => request("GET", "/attendance/status"),
    clockIn: (note?: string) => request("POST", "/attendance/clock-in", note ? { note } : {}),
    clockOut: () => request("POST", "/attendance/clock-out"),
};

export const leaves = {
    list: (params?: Record<string, string>) => {
        const qs = params ? "?" + new URLSearchParams(params).toString() : "";
        return request("GET", `/leaves${qs}`);
    },
    get: (id: number) => request("GET", `/leaves/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/leaves", data),
    approve: (id: number) => request("POST", `/leaves/${id}/approve`),
    reject: (id: number) => request("POST", `/leaves/${id}/reject`),
    types: () => request("GET", "/leaves/types"),
};

export const estimates = crudModule("/estimates");
export const contracts = crudModule("/contracts");
export const proposals = crudModule("/proposals");

export const orders = {
    ...crudModule("/orders"),
    statuses: () => request("GET", "/orders/statuses"),
};

export const messages = {
    list: () => request("GET", "/messages"),
    get: (id: number) => request("GET", `/messages/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/messages", data),
    reply: (id: number, data: Record<string, unknown>) => request("POST", `/messages/${id}/reply`, data),
    remove: (id: number) => request("DELETE", `/messages/${id}`),
};

export const announcements = crudModule("/announcements");
export const notes = crudModule("/notes");

export const todo = {
    list: () => request("GET", "/todo"),
    create: (data: Record<string, unknown>) => request("POST", "/todo", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/todo/${id}`, data),
    toggle: (id: number) => request("POST", `/todo/${id}/toggle`),
    remove: (id: number) => request("DELETE", `/todo/${id}`),
};

export const reports = {
    overview: () => request("GET", "/reports/overview"),
    revenue: (year?: number) => request("GET", `/reports/revenue${year ? "?year=" + year : ""}`),
    projectStatus: () => request("GET", "/reports/project-status"),
    taskSummary: () => request("GET", "/reports/task-summary"),
};

export const settings = {
    list: () => request("GET", "/settings"),
    get: (key: string) => request("GET", `/settings/${key}`),
    update: (key: string, value: string) => request("PUT", `/settings/${key}`, { value }),
    batchUpdate: (s: Record<string, string>) => request("PUT", "/settings", { settings: s }),
};

export const roles = crudModule("/roles");

// Unified api object for convenient imports: import { api } from "@/lib/api"
export const api = {
    auth,
    surveys,
    responses,
    analysis,
    exports: exports_,
    subscriptions,
    admin,
    adminUsers,
    apiKeys,
    adminCms,
    publicCms,
    public: publicApi,
    projects,
    tasks,
    invoices,
    clients,
    leads,
    expenses,
    tickets,
    events,
    team,
    timesheets,
    attendance,
    leaves,
    estimates,
    contracts,
    proposals,
    orders,
    messages,
    announcements,
    notes,
    todo,
    reports,
    settings,
    roles,
};
