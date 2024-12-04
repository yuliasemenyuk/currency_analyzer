import axios from "axios";
import { AddRuleWithCurrencyCodesDto, Currency } from "../types";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
   });

export const getCurrencies = () => api.get<Currency[]>('/currencies');
export const createCurreciesPair = (data: { fromCode: string; toCode: string; }) => api.post('/pair', data);
export const createRule = (data: AddRuleWithCurrencyCodesDto) => api.post('/rules', data);
export const getRules = () => api.get('/rules');
export const updateRule = (id: string, data: Partial<AddRuleWithCurrencyCodesDto>) => api.put(`/rules/${id}`, data);
export const unsubscribeRule = (ruleId: string, p0: { isEnabled: boolean; }) => api.patch(`/rules/${ruleId}/unsubscribe?userId=120c1bcc-a42d-4672-80b9-1d607248ff36`);