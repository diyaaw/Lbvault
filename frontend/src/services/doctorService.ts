import api from './api';

export const doctorService = {
    getDoctors: async () => {
        const res = await api.get('/doctor');
        return res.data;
    },
    createDoctor: async (data: any) => {
        const res = await api.post('/doctor', data);
        return res.data;
    },
    updateDoctor: async (id: string, data: any) => {
        const res = await api.put(`/doctor/${id}`, data);
        return res.data;
    },
    deleteDoctor: async (id: string) => {
        const res = await api.delete(`/doctor/${id}`);
        return res.data;
    }
};
