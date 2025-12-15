import { Client } from '@notionhq/client';
import {
  Question,
  lookupQuestions,
  handleRenderError,
  renderRichTexts,
  RenderMode,
} from '@offchainlabs/notion-docs-generator';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Constants: inkeep only supports 100 rows per CSV file
const MAX_ROWS_PER_CSV = 100;
const OUTPUT_DIR = path.join(__dirname, 'out');

// Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Helper function to escape CSV fields
function escapeCSVField(field: string): string {
  // If the field contains comma, newline, or double quote, wrap it in quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    // Escape double quotes by doubling them
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Get all Questions from the Notion database
const getAllQuestions = async (): Promise<Question[]> => {
  const allQuestions = await lookupQuestions(notion, {
    // No filter - include ALL questions
  });

  return allQuestions;
};

// Render a single question to CSV row
const renderQuestionRow = (q: Question): string => {
  try {
    // Render rich text to plain text for question, markdown for answer
    const questionText = renderRichTexts(q.question, {}, RenderMode.Plain).trim();
    const answerText = renderRichTexts(q.answer, {}, RenderMode.Markdown).trim();
    const externalUrl = ''; // Default to empty
    const isEnabled = q.publishable === 'Publishable' ? 'true' : 'false';

    return [escapeCSVField(questionText), escapeCSVField(answerText), externalUrl, isEnabled].join(
      ',',
    );
  } catch (e: unknown) {
    console.error(q.question);
    console.error(q.answer);
    throw e;
  }
};

// Render Questions to CSV format
const renderCSV = (questions: Question[]): string => {
  const headers = ['Question', 'Answer', 'ExternalUrl', 'IsEnabled'];
  const headerLine = headers.join(',');

  const rows = questions.map(renderQuestionRow);

  return [headerLine, ...rows].join('\n');
};

// Ensure output directory exists
const ensureOutputDir = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
};

// Write CSVs with pagination (max 100 rows per file)
const writeCSVFiles = (questions: Question[]): void => {
  ensureOutputDir();

  const totalQuestions = questions.length;
  const totalFiles = Math.ceil(totalQuestions / MAX_ROWS_PER_CSV);

  for (let i = 0; i < totalFiles; i++) {
    const start = i * MAX_ROWS_PER_CSV;
    const end = Math.min(start + MAX_ROWS_PER_CSV, totalQuestions);
    const chunk = questions.slice(start, end);

    const csvContent = renderCSV(chunk);
    const fileIndex = i + 1;
    const outputPath = path.join(OUTPUT_DIR, `questions-export-${fileIndex}.csv`);
    fs.writeFileSync(outputPath, csvContent);
    console.log(`CSV exported to ${outputPath} (rows ${start + 1}-${end})`);
  }
};

async function main() {
  try {
    console.log('Fetching Questions from Notion...');
    const questions = await getAllQuestions();
    console.log(`Found ${questions.length} Questions`);

    writeCSVFiles(questions);
    console.log(`Done! Created ${Math.ceil(questions.length / MAX_ROWS_PER_CSV)} CSV file(s)`);
  } catch (e: unknown) {
    if (await handleRenderError(e, notion)) {
      process.exit(1);
    }
    throw e;
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
