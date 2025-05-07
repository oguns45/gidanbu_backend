// config/paystack.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const paystackConfig = {
  baseUrl: 'https://api.paystack.co',
  secretKey: process.env.PAYSTACK_SECRET_KEY,
};

const headers = {
  Authorization: `Bearer ${paystackConfig.secretKey}`,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
};

const axiosInstance = axios.create({
  baseURL: paystackConfig.baseUrl,
  headers,
});

export { axiosInstance };
