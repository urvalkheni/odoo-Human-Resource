const { Company } = require('./src/models');
require('dotenv').config();

const addCompany = async () => {
    try {
        console.log("Adding new company...");

        await Company.create({
            name: 'Oddo Inc',
            short_name: 'ODDO',
            address: 'Tech Park, Surat',
            contact_email: 'hr@oddo.com',
            contact_phone: '9876543210'
        });

        console.log("Success! Added 'Oddo Inc' to the database.");
        process.exit(0);
    } catch (error) {
        console.error("Error adding company:", error);
        process.exit(1);
    }
};

addCompany();
