const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const TradeRecord = require('./models/TradeRecord');
  
  const countries = await TradeRecord.aggregate([
    { $group: { _id: '$country_or_area', count: { $sum: 1 }, totalVol: { $sum: '$trade_usd' } } },
    { $sort: { totalVol: -1 } }
  ]);
  
  console.log('--- Country Distribution ---');
  countries.forEach(c => console.log(`${c._id}: ${c.count} records, Vol: $${c.totalVol}`));
  
  const commodities = await TradeRecord.distinct('commodity');
  console.log('\n--- Sample Commodities ---');
  console.log(commodities.slice(0, 5));
  
  process.exit();
}

check();
