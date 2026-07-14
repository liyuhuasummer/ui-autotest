import dotenv from 'dotenv';
import path from 'path';

// 加载 .env 文件
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const config = {
  baseUrl: process.env.BASE_URL || 'https://dev-ccps.metasmartedu.cn',

  credentials: {
    username: process.env.LOGIN_USERNAME || '',
    password: process.env.LOGIN_PASSWORD || '',
    captcha: process.env.LOGIN_CAPTCHA || '',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  alertTo: process.env.ALERT_TO || '',

  /** 核心巡检页面路由 */
  corePages: {
    login: '/login',
    home: '/',
    basicCourses: '/basic-courses',       // 基本课程
    lectures: '/lectures',                 // 讲座与报告
    premiumCourses: '/premium-courses',    // 精品课程
    specialCourses: '/special-courses',    // 专题课程
    personalCenter: '/my',                  // 个人中心
  },
} as const;
