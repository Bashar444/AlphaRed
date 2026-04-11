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

// Unified api object for convenient imports: import { api } from "@/lib/api"
export const api = {
    auth,
    surveys,
    responses,
    analysis,
    exports: exports_,
    subscriptions,
    admin,
    public: publicApi,
};
