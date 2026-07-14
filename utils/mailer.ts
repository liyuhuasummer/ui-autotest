import nodemailer from 'nodemailer';
import { config } from './config';

interface AlertPayload {
  subject: string;
  summary: string;
  reportUrl?: string;
  failures: Array<{
    test: string;
    error: string;
    url?: string;
  }>;
}

/**
 * 发送拨测失败告警邮件
 */
export async function sendAlert(payload: AlertPayload): Promise<void> {
  // 未配置邮件时不发送
  if (!config.smtp.user || !config.alertTo) {
    console.warn('[Mailer] SMTP 未配置，跳过邮件发送');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  const failListHtml = payload.failures
    .map(
      (f, i) =>
        `<tr>
          <td>${i + 1}</td>
          <td>${f.test}</td>
          <td style="color:red">${f.error}</td>
          <td>${f.url || '-'}</td>
        </tr>`
    )
    .join('');

  const html = `
    <h2>⚠️ 拨测告警 - ${payload.subject}</h2>
    <p><strong>站点：</strong>${config.baseUrl}</p>
    <p><strong>时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
    <h3>摘要</h3>
    <p>${payload.summary}</p>
    <h3>失败详情</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse">
      <thead>
        <tr><th>#</th><th>用例</th><th>错误信息</th><th>页面</th></tr>
      </thead>
      <tbody>${failListHtml}</tbody>
    </table>
    ${payload.reportUrl ? `<p><a href="${payload.reportUrl}">查看完整报告</a></p>` : ''}
  `;

  await transporter.sendMail({
    from: config.smtp.user,
    to: config.alertTo,
    subject: `[拨测告警] ${payload.subject}`,
    html,
  });

  console.log('[Mailer] 告警邮件已发送');
}
