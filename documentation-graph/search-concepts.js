#!/usr/bin/env node

/**
 * Search for concepts matching a pattern
 */

import { DataLoader } from './mcp-server/src/core/DataLoader.js';

async function searchConcepts(searchTerm) {
  try {
    console.log('Loading documentation analysis data...');

    const dataLoader = new DataLoader('./dist');
    await dataLoader.load();

    const searchLower = searchTerm.toLowerCase();

    console.log(`\nSearching for concepts matching: "${searchTerm}"\n`);

    // Search in top concepts
    const matches = dataLoader.concepts.topConcepts.filter((concept) =>
      concept.concept.toLowerCase().includes(searchLower),
    );

    if (matches.length === 0) {
      console.log(`No concepts found matching "${searchTerm}"`);

      // Suggest similar concepts
      console.log('\nTrying individual words:');
      const words = searchTerm.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        const wordMatches = dataLoader.concepts.topConcepts.filter((concept) =>
          concept.concept.toLowerCase().includes(word),
        );
        if (wordMatches.length > 0) {
          console.log(`\nConcepts containing "${word}":`);
          wordMatches.slice(0, 10).forEach((concept, i) => {
            console.log(
              `  ${i + 1}. ${concept.concept} (weight: ${concept.data.totalWeight.toFixed(
                2,
              )}, docs: ${Object.keys(concept.data.files).length})`,
            );
          });
        }
      });
    } else {
      console.log(`Found ${matches.length} matching concepts:\n`);
      matches.forEach((concept, i) => {
        console.log(`${i + 1}. ${concept.concept}`);
        console.log(`   Total Weight: ${concept.data.totalWeight.toFixed(2)}`);
        console.log(`   Documents: ${Object.keys(concept.data.files).length}`);
        console.log(`   Category: ${concept.data.category || 'N/A'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error searching concepts:', error);
    process.exit(1);
  }
}

const searchTerm = process.argv[2] || 'Orbit';
searchConcepts(searchTerm);
