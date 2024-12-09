import axios from "axios";
import Cookies from 'js-cookie';
import { AddRuleWithCurrencyCodesDto, Currency } from "../types";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
   });

api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getCurrencies = () => api.get<Currency[]>('/currencies');
export const getMonitoredPairs = () => api.get('/currencies/monitored');
export const startMonitoringPair = (data: { fromCode: string; toCode: string }) => api.post('/currencies/monitor', data);
export const disableMonitoredPair = (data: { pairId: string }) => api.patch('/currencies/disable', data);
export const enableMonitoredPair = (data: { pairId: string }) => api.patch('/currencies/enable', data);
export const stopMonitoringPair = (pairId: string) => api.delete(`/currencies/${pairId}`);
export const createRule = (data: AddRuleWithCurrencyCodesDto) => api.post('/rules', data);
export const getUsersRules = () => api.get('/rules');
export const toggleRuleSubscription = (ruleId: string, data: { isEnabled: boolean }) => api.patch(`/rules/${ruleId}/toggle`, data);
export const removeRule = (ruleId: string) => api.delete(`/rules/${ruleId}`);
export const restoreRule = (ruleId: string) => api.patch(`/rules/${ruleId}/restore`);
export const getArchivedRules = () => api.get('/rules/archived');
export const registerUser = (email: string, password: string) => api.post('/users/register', { email, password });
export const loginUser = (email: string, password: string) => api.post('/users/login', { email, password });