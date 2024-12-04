import axios from "axios";
import { AddRuleWithCurrencyCodesDto, Currency } from "../types";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
   });

export const getCurrencies = () => api.get<Currency[]>('/currencies');
export const createRule = (data: AddRuleWithCurrencyCodesDto) => api.post('/rules', data);