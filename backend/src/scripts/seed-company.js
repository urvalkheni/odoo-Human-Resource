const { Company } = require('../models');
const { sequelize } = require('../database/connection');

async function seedCompany() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if any company exists
    const existingCompanies = await Company.findAll();

    if (existingCompanies.length > 0) {
      console.log('\n📋 Existing Companies:');
      existingCompanies.forEach(company => {
        console.log(`  - ID: ${company.id}`);
        console.log(`    Name: ${company.name}`);
        console.log(`    Short Name: ${company.short_name}`);
        console.log('');
      });
    } else {
      console.log('\n📝 No companies found. Creating default company...');

      const company = await Company.create({
        name: 'Heet Corporation',
        short_name: 'HEET',
        email: 'info@heet.com',
        phone: '+1234567890',
        address: '123 Business Street, Tech City',
        website: 'https://heet.com',
        is_active: true
      });

      console.log('\n✅ Company created successfully!');
      console.log(`  - ID: ${company.id}`);
      console.log(`    Name: ${company.name}`);
      console.log(`    Short Name: ${company.short_name}`);
      console.log('\n💡 Use this Company ID in your signup form:');
      console.log(`    ${company.id}`);
    }

    await sequelize.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedCompany();
