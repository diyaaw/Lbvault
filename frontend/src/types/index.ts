export type UserRole = 'patient' | 'doctor' | 'pathology' | 'admin';

export interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface Patient {
    _id: string;
    name: string;
    email: string;
}

export interface Report {
    _id: string;
    reportName: string;
    patientId: string | { _id: string; name: string };
    testType: string;
    fileUrl: string;
    uploadDate: string;
    pathologyId?: string | { _id: string; name: string; email: string };
    doctorId?: string | { _id: string; name: string; email: string };
    extractedData?: Record<string, any>;
    aiSummary?: string;
    doctorComment?: string;
}

export interface AnalyticsData {
    totalReports: number;
    totalPatients: number;
    patientGrowthRate: number;
    efficiencyRate: number;
    weeklyVolume: number[];
    testTypes?: { name: string; count: number }[];
}
