#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const email = process.env.JIRA_LOGIN_EMAIL || process.env.ATLASSIAN_EMAIL;
const token = process.env.JIRA_API_TOKEN || process.env.ATLASSIAN_API_TOKEN;
const baseUrl = (process.env.ATLASSIAN_BASE_URL || process.env.JIRA_SITE || 'https://legionqaschool.atlassian.net').replace(/\/$/, '');

const [issueKey, ...filePaths] = process.argv.slice(2);

if (!issueKey || filePaths.length === 0) {
  console.error('Usage: node scripts/jira-attach-screenshots.mjs <ISSUE-KEY> <file1.png> [file2.png ...]');
  process.exit(1);
}

if (!email || !token) {
  console.error('Missing Jira credentials. Set JIRA_LOGIN_EMAIL + (JIRA_API_TOKEN or ATLASSIAN_API_TOKEN) in .env');
  process.exit(1);
}

const auth = Buffer.from(`${email}:${token}`).toString('base64');

for (const filePath of filePaths) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const fileData = fs.readFileSync(resolved);
  const boundary = `----FormBoundary${Date.now()}`;
  const filename = path.basename(resolved);
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`),
    fileData,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const response = await fetch(`${baseUrl}/rest/api/3/issue/${issueKey}/attachments`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'X-Atlassian-Token': 'no-check',
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`Failed to attach ${filename} to ${issueKey}: ${response.status} ${text.slice(0, 500)}`);
    process.exit(1);
  }

  const attachments = JSON.parse(text);
  for (const attachment of attachments) {
    console.log(`Attached ${attachment.filename} (${attachment.size} bytes) to ${issueKey}`);
  }
}
