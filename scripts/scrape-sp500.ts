import fs from 'fs';
import path from 'path';

async function scrapeSP500() {
  console.log('Fetching S&P 500 list from Wikipedia...');
  const response = await fetch('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies');
  const html = await response.text();

  // Extract the table rows
  const tableRegex = /<table class="wikitable[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);
  
  if (!tableMatch) {
    console.error('Could not find the table in Wikipedia page.');
    process.exit(1);
  }

  const tableHtml = tableMatch[1];
  
  // Extract all rows
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/ig;
  let match;
  const symbols: string[] = [];

  // Skip the first row (header)
  rowRegex.exec(tableHtml);

  while ((match = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = match[1];
    
    // Extract the first column which contains the symbol link
    const colRegex = /<td[^>]*>.*?<a[^>]*>(.*?)<\/a>.*?<\/td>/i;
    const colMatch = rowHtml.match(colRegex);
    
    if (colMatch) {
      let symbol = colMatch[1].trim();
      // Replace Wikipedia's dot with Yahoo's dash (e.g., BRK.B -> BRK-B)
      symbol = symbol.replace('.', '-');
      if (symbol) {
        symbols.push(symbol);
      }
    }
  }

  console.log(`Found ${symbols.length} symbols.`);
  
  if (symbols.length < 400) {
    console.error('Found too few symbols, something might be wrong with the regex.');
    process.exit(1);
  }

  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, 'sp500-symbols.json');
  fs.writeFileSync(outputPath, JSON.stringify(symbols, null, 2));
  
  console.log(`Saved to ${outputPath}`);
}

scrapeSP500().catch(console.error);
