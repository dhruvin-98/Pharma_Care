const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Fix: Drop old unique index on batchNumber that allows null duplicates
    const medicineCollection = mongoose.connection.collection('medicines');
    const indexes = await medicineCollection.getIndexes();
    
    // Check if old batch_1 unique index exists
    if (indexes.batch_1) {
      try {
        await medicineCollection.dropIndex('batch_1');
        console.log('✓ Dropped old unique index on batch field');
      } catch (err) {
        console.log('Index batch_1 not found or already dropped');
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;