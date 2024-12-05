import axios from "axios";
import { AddRuleWithCurrencyCodesDto, Currency } from "../types";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
   });

export const getCurrencies = () => api.get<Currency[]>('/currencies');
export const getMonitoredPairs = (userId: string) => api.get(`currencies/monitored?userId=${userId}`);
export const startMonitoringPair = (data: {userId: string, fromCode: string, toCode: string}) => api.post('/currencies/monitor', data);
export const updateMonitoredPair = (id: string, data: { isEnabled: boolean; }) => api.put(`/pair/${id}`, data);
export const disableMonitoredPair = (data: {userId: string, pairId: string}) => api.patch('currencies/disable', data);
export const enableMonitoredPair = (data: {userId: string, pairId: string}) => api.patch('currencies/enable', data);
export const createRule = (data: AddRuleWithCurrencyCodesDto) => api.post('/rules', data);
export const getUsersRules = (userId: string) => api.get(`/rules?userId=${userId}`);
// export const updateRule = (id: string, data: Partial<AddRuleWithCurrencyCodesDto>) => api.put(`/rules/${id}`, data);
export const unsubscribeRule = (ruleId: string, p0: { isEnabled: boolean; }) => api.patch(`/rules/${ruleId}/unsubscribe?userId=040dff52-8aa1-41a6-bc2f-d578170df96c`);