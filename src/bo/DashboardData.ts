export interface DashboardInterview {
    id: string;
    jobName: string;
    score: number;
}

export interface DashboardResponse {
    success: boolean;
    message?: string;
    lastInterviewScore: number;
    interviewsPassed: number;
    interviewsFailed: number;
    trainingsCompleted: number;
    interviews: DashboardInterview[];
    recentTags: string[];
}
