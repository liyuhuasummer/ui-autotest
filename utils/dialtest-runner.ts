/**
 * 拨测运行器：按顺序执行测试套件，汇总结果，失败时发送邮件告警
 *
 * 运行方式：
 *   npx ts-node utils/dialtest-runner.ts
 *
 * 或使用 npm script：
 *   npm run dialtest
 */

import { execSync } from 'child_process';
import { sendAlert } from './mailer';
import { config } from './config';

interface TestResult {
  suite: string;
  status: 'PASS' | 'FAIL';
  total: number;
  passed: number;
  failed: number;
  duration: string;
  failures: Array<{ test: string; error: string }>;
}

const results: TestResult[] = [];
const startTime = Date.now();

function runSuite(suiteName: string, specFile: string): TestResult {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  执行测试套件: ${suiteName}`);
  console.log(`${'='.repeat(60)}\n`);

  const suiteStart = Date.now();

  try {
    const output = execSync(
      `npx.cmd playwright test ${specFile} --reporter=list`,
      {
        encoding: 'utf-8',
        timeout: 300000, // 5 分钟
      }
    );

    const duration = ((Date.now() - suiteStart) / 1000).toFixed(1);
    console.log(output);

    // 解析输出的通过/失败数量
    const passMatch = output.match(/(\d+)\s+passed/);
    const failMatch = output.match(/(\d+)\s+failed/);
    const passed = passMatch ? parseInt(passMatch[1]) : 0;
    const failed = failMatch ? parseInt(failMatch[1]) : 0;

    return {
      suite: suiteName,
      status: failed > 0 ? 'FAIL' : 'PASS',
      total: passed + failed,
      passed,
      failed,
      duration: `${duration}s`,
      failures: extractFailures(output),
    };
  } catch (err: any) {
    const duration = ((Date.now() - suiteStart) / 1000).toFixed(1);
    const stdout = err.stdout || '';
    const stderr = err.stderr || '';

    const passMatch = stdout.match(/(\d+)\s+passed/);
    const failMatch = stdout.match(/(\d+)\s+failed/);
    const passed = passMatch ? parseInt(passMatch[1]) : 0;
    const failed = failMatch ? parseInt(failMatch[1]) : 1;

    return {
      suite: suiteName,
      status: 'FAIL',
      total: passed + failed,
      passed,
      failed,
      duration: `${duration}s`,
      failures: extractFailures(stdout + stderr),
    };
  }
}

function extractFailures(output: string): Array<{ test: string; error: string }> {
  const failures: Array<{ test: string; error: string }> = [];

  // 匹配 Playwright 失败输出格式: "X) [chromium] › path/to/test.ts:line › test name"
  const failRegex = /\d+\)\s+\[chromium\]\s+›\s+(\S+)\s+›\s+(.+)/g;
  let match;
  while ((match = failRegex.exec(output)) !== null) {
    failures.push({ test: match[2], error: match[0] });
  }

  if (failures.length === 0 && output.includes('failed')) {
    failures.push({ test: '未知用例', error: '测试执行失败，详见上方输出' });
  }

  return failures;
}

function printSummary(results: TestResult[]): void {
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  const allPassed = results.every((r) => r.status === 'PASS');
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  📊 拨测汇总报告`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  站点: ${config.baseUrl}`);
  console.log(`  时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`  总耗时: ${totalDuration}s`);
  console.log(`${'='.repeat(60)}`);

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon} ${r.suite}: ${r.passed}/${r.total} 通过 (${r.duration})`);
  }

  console.log(`${'='.repeat(60)}`);
  console.log(`  📈 总计: ${totalPassed}/${totalTests} 通过, ${totalFailed} 失败`);
  console.log(`  📌 状态: ${allPassed ? '✅ 全部通过' : '❌ 存在失败'}`);
  console.log(`${'='.repeat(60)}\n`);
}

async function main(): Promise<void> {
  console.log('🚀 启动 UI 拨测...\n');

  // 按顺序执行测试套件
  const suites = [
    { name: '首页拨测', spec: 'tests/home.spec.ts' },
    { name: '登录流程拨测', spec: 'tests/login.spec.ts' },
    { name: '核心业务巡检', spec: 'tests/business.spec.ts' },
  ];

  for (const { name, spec } of suites) {
    const result = runSuite(name, spec);
    results.push(result);
  }

  printSummary(results);

  // 生成 HTML 报告
  try {
    execSync('npx.cmd playwright show-report --host 0.0.0.0 2>&1 || true', {
      timeout: 10000,
    });
  } catch {
    // 仅尝试生成，不影响主流程
  }

  // 有失败时发送邮件告警
  const hasFailures = results.some((r) => r.status === 'FAIL');
  if (hasFailures) {
    const allFailures = results.flatMap((r) =>
      r.failures.map((f) => ({
        test: `[${r.suite}] ${f.test}`,
        error: f.error,
        url: config.baseUrl,
      }))
    );

    await sendAlert({
      subject: `拨测失败 - ${config.baseUrl}`,
      summary: `共 ${totalTests(results)} 个用例, ${totalFailed(results)} 个失败`,
      failures: allFailures,
    });
  }
}

function totalTests(results: TestResult[]): number {
  return results.reduce((sum, r) => sum + r.total, 0);
}

function totalFailed(results: TestResult[]): number {
  return results.reduce((sum, r) => sum + r.failed, 0);
}

main().catch((err) => {
  console.error('拨测运行器异常:', err);
  process.exit(1);
});
