import api from './api';
import { Report } from '@/types';


export const reportService = {
    getAllReports: async (): Promise<Report[]> => {
        const res = await api.get('/reports');
        return res.data.reports || res.data;
    },
    getPatientReports: async (): Promise<Report[]> => {
        try {
            console.log('[DEBUG] Fetching real patient reports...');
            const res = await api.get('/patient/reports/my-reports');
            return res.data;
        } catch (err) {
            console.error('[CRITICAL] Failed to fetch patient reports from API:', err);
            throw err; // Propagate error to UI for better visibility
        }
    },
    getAISummary: async (reportId: string, lang: string = 'en', force: boolean = false): Promise<any> => {
        try {
            const res = await api.get(`/patient/reports/${reportId}/summary?lang=${lang}${force ? '&force=true' : ''}`);
            return res.data;
        } catch (err) {
            console.error('Failed to get AI summary', err);
            return 'Failed to generate summary. Please try again later.';
        }
    },
    getReportById: async (reportId: string): Promise<Report> => {
        const res = await api.get(`/patient/reports/${reportId}`);
        return res.data;
    },
    uploadReport: async (formData: FormData, onProgress: (percent: number) => void): Promise<any> => {
        return api.post('/reports/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                onProgress(percentCompleted);
            }
        });
    },
    getVoiceAudio: async (reportId: string, language: string = 'English'): Promise<string> => {
        try {
            const res = await api.post('/voice', { reportId, language });
            return res.data.audioUrl;
        } catch (err: any) {
            // Check if error response is a blob (Axios does this when responseType is 'blob')
            if (err.response && err.response.data instanceof Blob) {
                const errorText = await err.response.data.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    err.message = errorJson.message || errorJson.error || err.message;
                } catch (e) {
                    console.error('[VOICE ERROR] Failed to parse error blob:', e);
                }
            }
            throw err;
        }
    }
};
