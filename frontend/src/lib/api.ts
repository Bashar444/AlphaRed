const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

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
    list: async (params?: Record<string, string>) => {
        const qs = params ? "?" + new URLSearchParams(params).toString() : "";
        const res = await request<{ surveys: unknown[]; pagination: unknown }>("GET", `/surveys${qs}`);
        // Backend returns { surveys, pagination }; return the array for convenience
        return Array.isArray(res) ? res : (res?.surveys ?? []);
    },
    listWithPagination: (params?: Record<string, string>) => {
        const qs = params ? "?" + new URLSearchParams(params).toString() : "";
        return request("GET", `/surveys${qs}`);
    },
    get: (id: string | number) => request("GET", `/surveys/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/surveys", data),
    update: (id: string | number, data: Record<string, unknown>) => request("PUT", `/surveys/${id}`, data),
    delete: (id: string | number) => request("DELETE", `/surveys/${id}`),
    // Backend returns questions embedded in GET /surveys/:id, but also supports bulk update
    updateQuestions: (surveyId: string | number, questions: Record<string, unknown>[]) =>
        request("PUT", `/surveys/${surveyId}/questions`, { questions }),
    getTargeting: (id: string | number) => request("GET", `/surveys/${id}/targeting`),
    saveTargeting: (id: string | number, data: Record<string, unknown>) => request("PUT", `/surveys/${id}/targeting`, data),
    launch: (id: string | number, data: Record<string, unknown>) => request("POST", `/surveys/${id}/launch`, data),
    pause: (id: string | number) => request("PATCH", `/surveys/${id}/pause`),
    complete: (id: string | number) => request("PATCH", `/surveys/${id}/complete`),
    archive: (id: string | number) => request("PATCH", `/surveys/${id}/archive`),
    stats: (id: string | number) => request("GET", `/surveys/${id}/stats`),
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
    me: () => request("GET", "/subscriptions/me"),
    subscribe: (planId: string, billingCycle?: string, discountCode?: string) =>
        request("POST", "/subscriptions/subscribe", { planId, billingCycle, discountCode }),
    cancel: () => request("POST", "/subscriptions/cancel"),
};

// ── Plans (public + admin) ──────────────────────
export const plans = {
    list: (includeInactive = false) =>
        request("GET", `/plans${includeInactive ? "?all=true" : ""}`),
    get: (slug: string) => request("GET", `/plans/${slug}`),
    create: (data: Record<string, unknown>) => request("POST", "/plans", data),
    update: (id: string, data: Record<string, unknown>) => request("PUT", `/plans/${id}`, data),
    toggle: (id: string) => request("PATCH", `/plans/${id}/toggle`),
};

// ── Admin Subscription Management ───────────────
export const adminSubscriptions = {
    listPending: (params?: Record<string, string>) => {
        const qs = params ? "?" + new URLSearchParams(params).toString() : "";
        return request("GET", `/subscriptions/pending${qs}`);
    },
    approve: (subscriptionId: string) =>
        request("POST", "/subscriptions/approve", { subscriptionId }),
    reject: (subscriptionId: string, reason?: string) =>
        request("POST", "/subscriptions/reject", { subscriptionId, reason }),
};

// ── Admin ───────────────────────────────────────
export const admin = {
    dashboard: () => request("GET", "/dashboard/admin"),
    stats: () => request("GET", "/dashboard/admin"),
    charts: (type: string) => request("GET", `/dashboard/admin/charts?type=${type}`),
    activity: () => request("GET", "/dashboard/admin/activity"),
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

// ── Admin Settings (key/value KV store) ───────────────────────
export const adminSettings = {
    list: (group?: string) => {
        const qs = group ? `?group=${encodeURIComponent(group)}` : "";
        return request<Array<{ key: string; value: unknown; group: string; label?: string }>>(
            "GET",
            `/admin/settings${qs}`
        );
    },
    get: (key: string) => request("GET", `/admin/settings/${encodeURIComponent(key)}`),
    upsert: (key: string, value: unknown, group: string, label?: string) =>
        request("POST", "/admin/settings", { key, value, group, label }),
    upsertMany: async (group: string, kv: Record<string, unknown>) => {
        const ops = Object.entries(kv).map(([key, value]) =>
            request("POST", "/admin/settings", { key, value, group })
        );
        return Promise.all(ops);
    },
    remove: (key: string) => request("DELETE", `/admin/settings/${encodeURIComponent(key)}`),
    sendTestEmail: () =>
        request<{ ok: boolean; sentTo?: string; message: string }>("POST", "/admin/email/test"),
};

// ── API Access Requests ───────────────────────────────────────
export const apiAccessRequests = {
    create: (reason: string, useCase: string) =>
        request("POST", "/api-access-requests", { reason, useCase }),
    listMine: () => request("GET", "/api-access-requests/mine"),
    listAll: (status?: string) => {
        const qs = status ? `?status=${status}` : "";
        return request("GET", `/api-access-requests${qs}`);
    },
    review: (id: string, status: "APPROVED" | "REJECTED", adminNotes?: string) =>
        request("PATCH", `/api-access-requests/${id}/review`, { status, adminNotes }),
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

// ── Respondent Self-Service ─────────────────────
export const respondent = {
    profile: () => request("GET", "/respondents/me"),
    updateProfile: (data: Record<string, unknown>) => request("PUT", "/respondents/me", data),
    invitations: () => request("GET", "/respondents/me/invitations"),
    acceptInvitation: (invitationId: string) => request("POST", `/respondents/me/invitations/${invitationId}/accept`),
    startSurvey: (surveyId: string) => request("POST", `/respondents/me/surveys/${surveyId}/start`),
    submitResponse: (surveyId: string, data: Record<string, unknown>) => request("POST", `/respondents/me/surveys/${surveyId}/submit`, data),
    earnings: () => request("GET", "/respondents/me/earnings"),
    payouts: () => request("GET", "/respondents/me/payouts"),
    requestPayout: (data: Record<string, unknown>) => request("POST", "/respondents/me/payouts", data),
    // Browse active surveys from researchers
    availableSurveys: (params?: Record<string, string>) => {
        const qs = params ? "?" + new URLSearchParams(params).toString() : "";
        return request("GET", `/surveys/available${qs}`);
    },
    availableSurveyDetail: (id: string) => request("GET", `/surveys/available/${id}`),
    // Submit response to a survey
    submitSurveyResponse: (data: Record<string, unknown>) => request("POST", "/responses/submit", data),
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
    plans,
    surveys,
    responses,
    analysis,
    exports: exports_,
    subscriptions,
    adminSubscriptions,
    admin,
    adminUsers,
    adminSettings,
    apiAccessRequests,
    apiKeys,
    adminCms,
    publicCms,
    public: publicApi,
    respondent,
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
