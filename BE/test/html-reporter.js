const fs = require('fs');
const path = require('path');

class HtmlReporter {
  constructor() {
    this.results = [];
  }

  onRunComplete(contexts, results) {
    for (const suite of results.testResults) {
      const suiteResult = {
        name: path.relative(process.cwd(), suite.testFilePath),
        status: suite.numFailingTests > 0 ? 'failed' : suite.numPendingTests > 0 ? 'pending' : 'passed',
        duration: suite.perfStats.runtime,
        tests: suite.testResults.map((t) => ({
          title: t.ancestorTitles.concat(t.title).join(' › '),
          status: t.status,
          duration: t.duration ?? 0,
          failureMessages: t.failureMessages,
        })),
      };
      this.results.push(suiteResult);
    }

    this.generateHtml(results);
  }

  generateHtml(results) {
    const totalTests = results.numTotalTests;
    const passed = results.numPassedTests;
    const failed = results.numFailedTests;
    const pending = results.numPendingTests;
    const totalSuites = results.numTotalTestSuites;
    const passedSuites = totalSuites - results.numFailedTestSuites;
    const failedSuites = results.numFailedTestSuites;
    const duration = results.startTime ? Date.now() - results.startTime : 0;

    const suitesHtml = this.results.map((suite) => {
      const statusIcon = suite.status === 'passed' ? '&#10003;' : '&#10007;';
      const testsHtml = suite.tests.map((test) => {
        const tStatusIcon = test.status === 'passed' ? '&#10003;' : test.status === 'failed' ? '&#10007;' : '&#9679;';
        const tStatusClass = test.status === 'passed' ? 'test-passed' : test.status === 'failed' ? 'test-failed' : 'test-pending';
        const failuresHtml = test.failureMessages.length > 0
          ? `<div class="failure-details">${test.failureMessages.map((msg) => `<pre>${this.escapeHtml(msg)}</pre>`).join('')}</div>`
          : '';
        return `
          <div class="test-row ${tStatusClass}">
            <span class="test-status">${tStatusIcon}</span>
            <span class="test-title">${this.escapeHtml(test.title)}</span>
            <span class="test-duration">${(test.duration / 1000).toFixed(2)}s</span>
            ${failuresHtml}
          </div>
        `;
      }).join('');

      return `
        <div class="suite ${'suite-' + suite.status}">
          <div class="suite-header" onclick="this.parentElement.classList.toggle('collapsed')">
            <span class="suite-toggle">&#9660;</span>
            <span class="suite-status">${statusIcon}</span>
            <span class="suite-name">${this.escapeHtml(suite.name)}</span>
            <span class="suite-duration">${(suite.duration / 1000).toFixed(2)}s</span>
          </div>
          <div class="suite-tests">${testsHtml}</div>
        </div>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unit Test Report — Engineering Tracker BE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      color: #1a202c;
      padding: 2rem;
    }
    .container { max-width: 1100px; margin: 0 auto; }

    .report-header {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      color: #fff;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .report-header h1 { font-size: 1.5rem; font-weight: 700; }
    .report-header .subtitle { font-size: 0.875rem; color: #a0aec0; margin-top: 0.25rem; }
    .report-actions { display: flex; gap: 0.75rem; }
    .btn-pdf {
      background: #e53e3e;
      color: #fff;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-pdf:hover { background: #c53030; }
    .btn-pdf svg { width: 18px; height: 18px; fill: currentColor; }

    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .summary-card {
      background: #fff;
      border-radius: 10px;
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .summary-card .number { font-size: 2rem; font-weight: 700; line-height: 1.2; }
    .summary-card .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #718096; margin-top: 0.25rem; }
    .card-total .number { color: #2d3748; }
    .card-passed .number { color: #38a169; }
    .card-failed .number { color: #e53e3e; }
    .card-pending .number { color: #d69e2e; }
    .card-suites .number { color: #3182ce; }
    .card-duration .number { color: #805ad5; font-size: 1.5rem; }

    .suite {
      background: #fff;
      border-radius: 10px;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .suite-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .suite-header:hover { background: #f7fafc; }
    .suite-toggle { font-size: 0.625rem; color: #a0aec0; transition: transform 0.2s; }
    .suite.collapsed .suite-toggle { transform: rotate(-90deg); }
    .suite.collapsed .suite-tests { display: none; }
    .suite-status { font-size: 1rem; font-weight: 700; }
    .suite-passed .suite-status { color: #38a169; }
    .suite-failed .suite-status { color: #e53e3e; }
    .suite-pending .suite-status { color: #d69e2e; }
    .suite-name { flex: 1; font-size: 0.9375rem; font-weight: 600; color: #2d3748; }
    .suite-duration { font-size: 0.8125rem; color: #718096; font-variant-numeric: tabular-nums; }

    .suite-tests { border-top: 1px solid #edf2f7; }
    .test-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.625rem 1.25rem 0.625rem 2.5rem;
      font-size: 0.875rem;
      border-bottom: 1px solid #f7fafc;
      flex-wrap: wrap;
    }
    .test-row:last-child { border-bottom: none; }
    .test-status { font-weight: 700; }
    .test-passed .test-status { color: #38a169; }
    .test-failed .test-status { color: #e53e3e; }
    .test-pending .test-status { color: #d69e2e; }
    .test-title { flex: 1; color: #4a5568; }
    .test-duration { font-size: 0.75rem; color: #a0aec0; font-variant-numeric: tabular-nums; }

    .failure-details { width: 100%; margin-top: 0.5rem; }
    .failure-details pre {
      background: #fff5f5;
      border: 1px solid #fed7d7;
      border-radius: 6px;
      padding: 0.75rem;
      font-size: 0.75rem;
      line-height: 1.5;
      overflow-x: auto;
      color: #c53030;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .footer {
      text-align: center;
      padding: 2rem 0 1rem;
      font-size: 0.75rem;
      color: #a0aec0;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .report-header { border-radius: 0; }
      .btn-pdf { display: none !important; }
      .suite { break-inside: avoid; box-shadow: none; border: 1px solid #e2e8f0; }
      .summary-card { box-shadow: none; border: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="report-header">
      <div>
        <h1>Unit Test Report</h1>
        <div class="subtitle">Engineering Activity Tracker — Backend &middot; ${new Date().toISOString().split('T')[0]}</div>
      </div>
      <div class="report-actions">
        <button class="btn-pdf" onclick="window.print()">
          <svg viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
          Download PDF
        </button>
      </div>
    </div>

    <div class="summary">
      <div class="summary-card card-total">
        <div class="number">${totalTests}</div>
        <div class="label">Total Tests</div>
      </div>
      <div class="summary-card card-passed">
        <div class="number">${passed}</div>
        <div class="label">Passed</div>
      </div>
      <div class="summary-card card-failed">
        <div class="number">${failed}</div>
        <div class="label">Failed</div>
      </div>
      <div class="summary-card card-pending">
        <div class="number">${pending}</div>
        <div class="label">Pending</div>
      </div>
      <div class="summary-card card-suites">
        <div class="number">${passedSuites}/${totalSuites}</div>
        <div class="label">Suites Passed</div>
      </div>
      <div class="summary-card card-duration">
        <div class="number">${(duration / 1000).toFixed(1)}s</div>
        <div class="label">Duration</div>
      </div>
    </div>

    <div id="suites">${suitesHtml}</div>

    <div class="footer">
      Generated by Jest &middot; Engineering Tracker BE
    </div>
  </div>

  <script>
    document.querySelectorAll('.suite-header').forEach(function(header) {
      header.addEventListener('click', function() {
        this.parentElement.classList.toggle('collapsed');
      });
    });
  </script>
</body>
</html>`;

    const outputDir = path.resolve(process.cwd(), 'test-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outputDir, 'unit-test-report.html'), html, 'utf-8');
    console.log('\n  ' + 'HTML report generated: test-reports/unit-test-report.html' + '\n');
  }

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  getLastError() {
    return undefined;
  }
}

module.exports = HtmlReporter;
