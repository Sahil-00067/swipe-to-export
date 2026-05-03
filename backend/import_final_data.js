const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function importData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const TradeRecord = require('./models/TradeRecord');
  
  // Clear existing records
  await TradeRecord.deleteMany({});
  console.log('Cleared existing trade records');

  const records = [];
  fs.createReadStream('../final_final_final_data.csv')
    .pipe(csv({
      mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim()
    }))
    .on('data', (row) => {
      // Basic validation to skip empty rows
      if (!row.country_or_area) return;
      
      records.push({
        country_or_area: row.country_or_area,
        year: parseInt(row.year),
        commodity: row.commodity,
        flow: row.flow,
        trade_usd: parseFloat(row.trade_usd)
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${records.length} records. Inserting into DB...`);
      // Insert in chunks to avoid memory issues
      const chunkSize = 1000;
      for (let i = 0; i < records.length; i += chunkSize) {
        await TradeRecord.insertMany(records.slice(i, i + chunkSize));
        console.log(`Inserted ${Math.min(i + chunkSize, records.length)} / ${records.length}`);
      }
      console.log('Import complete!');
      process.exit();
    });
}

importData().catch(err => {
  console.error(err);
  process.exit(1);
});
