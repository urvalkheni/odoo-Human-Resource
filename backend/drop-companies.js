const { sequelize } = require('./src/database/connection');

async function dropTable() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    await sequelize.query('DROP TABLE IF EXISTS companies CASCADE;');
    console.log('Companies table dropped successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropTable();
