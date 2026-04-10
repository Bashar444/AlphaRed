const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
}

async function request<T = unknown>(
    method: Method,
    path: string,
    body?: Record<string, unknown>,
    token?: string
): Promise<ApiResponse<T>> {
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
    return json as ApiResponse<T>;
}

// ── Auth ────────────────────────────────────────
export const auth = {
    login: (email: string, password: string) =>
        request("POST", "/auth/login", { email, password }),
    register: (data: Record<string, unknown>) =>
        request("POST", "/auth/register", data),
    me: (token: string) =>
        request("GET", "/auth/me", undefined, token),
};

// ── Surveys ─────────────────────────────────────
export const surveys = {
    list: (token: string) =>
        request("GET", "/surveys", undefined, token),
    get: (id: number, token: string) =>
        request("GET", `/surveys/${id}`, undefined, token),
    create: (data: Record<string, unknown>, token: string) =>
        request("POST", "/surveys", data, token),
    update: (id: number, data: Record<string, unknown>, token: string) =>
        request("PUT", `/surveys/${id}`, data, token),
    delete: (id: number, token: string) =>
        request("DELETE", `/surveys/${id}`, undefined, token),

    // Questions
    questions: (surveyId: number, token: string) =>
        request("GET", `/surveys/${surveyId}/questions`, undefined, token),
    addQuestion: (surveyId: number, data: Record<string, unknown>, token: string) =>
        request("POST", `/surveys/${surveyId}/questions`, data, token),
    updateQuestion: (surveyId: number, qId: number, data: Record<string, unknown>, token: string) =>
        request("PUT", `/surveys/${surveyId}/questions/${qId}`, data, token),
    deleteQuestion: (surveyId: number, qId: number, token: string) =>
        request("DELETE", `/surveys/${surveyId}/questions/${qId}`, undefined, token),

    // Targeting
    getTargeting: (id: number, token: string) =>
        request("GET", `/surveys/${id}/targeting`, undefined, token),
    saveTargeting: (id: number, data: Record<string, unknown>, token: string) =>
        request("PUT", `/surveys/${id}/targeting`, data, token),

    // Launch
    launch: (id: number, data: Record<string, unknown>, token: string) =>
        request("POST", `/surveys/${id}/launch`, data, token),
};

// ── Responses ───────────────────────────────────
export const responses = {
    list: (surveyId: number, token: string) =>
        request("GET", `/surveys/${surveyId}/responses`, undefined, token),
    get: (id: number, token: string) =>
        request("GET", `/responses/${id}`, undefined, token),
    quality: (surveyId: number, token: string) =>
        request("GET", `/surveys/${surveyId}/responses/quality`, undefined, token),
    scoreAll: (surveyId: number, token: string) =>
        request("POST", `/surveys/${surveyId}/responses/score-all`, undefined, token),
};

// ── Analysis ────────────────────────────────────
export const analysis = {
    get: (surveyId: number, token: string) =>
        request("GET", `/surveys/${surveyId}/analysis`, undefined, token),
    run: (surveyId: number, token: string) =>
        request("POST", `/surveys/${surveyId}/analysis/run`, undefined, token),
    chart: (surveyId: number, questionId: number, token: string) =>
        request("GET", `/surveys/${surveyId}/analysis/chart/${questionId}`, undefined, token),
};

// ── Exports ─────────────────────────────────────
export const exports_ = {
    list: (surveyId: number, token: string) =>
        request("GET", `/surveys/${surveyId}/exports`, undefined, token),
    generate: (surveyId: number, format: string, token: string) =>
        request("POST", `/surveys/${surveyId}/exports/${format}`, undefined, token),
};

// ── Subscriptions ───────────────────────────────
export const subscriptions = {
    plans: () => request("GET", "/subscriptions/plans"),
    current: (token: string) =>
        request("GET", "/subscriptions/current", undefined, token),
    checkout: (planKey: string, token: string) =>
        request("POST", "/subscriptions/checkout", { plan_key: planKey }, token),
    verify: (data: Record<string, unknown>, token: string) =>
        request("POST", "/subscriptions/verify", data, token),
    cancel: (token: string) =>
        request("POST", "/subscriptions/cancel", undefined, token),
};

// ── Admin ───────────────────────────────────────
export const admin = {
    dashboard: (token: string) =>
        request("GET", "/admin/dashboard", undefined, token),
    respondents: (token: string) =>
        request("GET", "/admin/respondents", undefined, token),
    suspendRespondent: (id: number, token: string) =>
        request("POST", `/admin/respondents/${id}/suspend`, undefined, token),
    datasets: (token: string) =>
        request("GET", "/admin/datasets", undefined, token),
    publishDataset: (id: number, token: string) =>
        request("POST", `/admin/datasets/${id}/publish`, undefined, token),
    unpublishDataset: (id: number, token: string) =>
        request("POST", `/admin/datasets/${id}/unpublish`, undefined, token),
    revenue: (token: string) =>
        request("GET", "/admin/revenue", undefined, token),
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
    dataset: (id: number) =>
        request("GET", `/public/datasets/${id}`),
    categories: () =>
        request("GET", "/public/datasets/categories"),
    survey: (id: number) =>
        request("GET", `/public/surveys/${id}`),
    submitSurvey: (id: number, data: Record<string, unknown>) =>
        request("POST", `/public/surveys/${id}/submit`, data),
};
