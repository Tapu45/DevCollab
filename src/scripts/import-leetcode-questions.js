import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Add this import
import { parse } from 'csv-parse';
import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'leetcode-companywise-questions');
const BATCH_SIZE = 100; // Adjust based on your system capabilities
const TIME_CATEGORIES = {
  'all.csv': 'ALL',
  'thirty-days.csv': 'THIRTY_DAYS',
  'three-months.csv': 'THREE_MONTHS',
  'six-months.csv': 'SIX_MONTHS',
  'more-than-six-months.csv': 'MORE_THAN_SIX_MONTHS'
};

// Stats tracking
let stats = {
  companiesProcessed: 0,
  questionsProcessed: 0,
  questionsCreated: 0,
  questionsUpdated: 0,
  errors: 0
};

// Main function
async function importQuestions() {
  console.log('Starting import of LeetCode questions...');
  console.time('Import completed in');
  
  try {
    // Get all company folders
    const companyFolders = fs.readdirSync(DATA_DIR)
      .filter(item => fs.statSync(path.join(DATA_DIR, item)).isDirectory());
    
    console.log(`Found ${companyFolders.length} company folders`);
    
    // Process each company
    for (const companyName of companyFolders) {
      try {
        await processCompany(companyName);
        stats.companiesProcessed++;
        
        // Log progress every 10 companies
        if (stats.companiesProcessed % 10 === 0) {
          console.log(`Processed ${stats.companiesProcessed}/${companyFolders.length} companies, ${stats.questionsProcessed} questions`);
        }
      } catch (error) {
        console.error(`Error processing company ${companyName}:`, error.message);
        stats.errors++;
      }
    }
    
    console.log('\nImport Summary:');
    console.log(`- Companies processed: ${stats.companiesProcessed}`);
    console.log(`- Questions processed: ${stats.questionsProcessed}`);
    console.log(`- Questions created: ${stats.questionsCreated}`);
    console.log(`- Questions updated: ${stats.questionsUpdated}`);
    console.log(`- Errors: ${stats.errors}`);
    console.timeEnd('Import completed in');
  } catch (error) {
    console.error('Fatal error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}
// Process a single company folder
async function processCompany(companyName) {
      console.log(`\nStarted import for company: ${companyName}`)
  // Create or find company
  const company = await prisma.company.upsert({
    where: { name: companyName },
    update: {},
    create: { name: companyName }
  });
  
  const companyPath = path.join(DATA_DIR, companyName);
  
  // Process each CSV file in the company folder
  for (const csvFile of Object.keys(TIME_CATEGORIES)) {
    const csvPath = path.join(companyPath, csvFile);
    
    if (fs.existsSync(csvPath)) {
      await processCsvFile(csvPath, company.id, TIME_CATEGORIES[csvFile]);
    }
  }
}

// Process a CSV file
async function processCsvFile(csvPath, companyId, timeCategory) {
  const records = [];
  const parser = fs
    .createReadStream(csvPath)
    .pipe(parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    }));
  
  // Collect records from CSV
  for await (const record of parser) {
    records.push(record);
  }
  
  // Process in batches
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await processQuestionBatch(batch, companyId, timeCategory);
  }
}

// Process a batch of questions
async function processQuestionBatch(questions, companyId, timeCategory) {
  const operations = questions.map(q => processQuestion(q, companyId, timeCategory));
  await Promise.all(operations);
}

// Process a single question
async function processQuestion(question, companyId, timeCategory) {
  try {
    const leetcodeId = parseInt(question.ID, 10);
    const acceptance = parseFloat(question['Acceptance %'] || '0');
    const frequency = parseFloat(question['Frequency %'] || '0');
    
    stats.questionsProcessed++;
    
    // Find existing question
    const existingQuestion = await prisma.leetCodeQuestion.findFirst({
      where: {
        leetcodeId,
        companyId
      }
    });
    
    if (existingQuestion) {
      // Update existing question
      const currentCategories = existingQuestion.timeCategories || [];
      if (!currentCategories.includes(timeCategory)) {
        await prisma.leetCodeQuestion.update({
          where: { id: existingQuestion.id },
          data: {
            timeCategories: {
              set: [...currentCategories, timeCategory]
            }
          }
        });
        stats.questionsUpdated++;
      }
    } else {
      // Create new question
      await prisma.leetCodeQuestion.create({
        data: {
          leetcodeId,
          url: question.URL,
          title: question.Title,
          difficulty: question.Difficulty,
          acceptance,
          frequency,
          timeCategories: [timeCategory],
          company: {
            connect: {
              id: companyId
            }
          }
        }
      });
      stats.questionsCreated++;
    }
  } catch (error) {
    console.error(`Error processing question ${question.ID || 'unknown'}:`, error.message);
    stats.errors++;
  }
}

// Execute the script
importQuestions()
  .catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
  });