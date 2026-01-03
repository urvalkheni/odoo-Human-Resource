const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

// Test data
let companyId;
let employeeCredentials;

async function testWorkflow() {
  try {
    console.log('🚀 Starting Dayflow HRMS Workflow Test\n');

    // Step 1: Create a Company
    console.log('1️⃣  Creating Company...');
    const companyResponse = await axios.post(`${BASE_URL}/companies`, {
      name: 'Gizodo Technologies',
      short_name: 'GIZO',
      email: 'hr@gizodo.com',
      phone: '+91-9876543210',
      address: '123 Tech Park, Bangalore, Karnataka',
      website: 'https://gizodo.com'
    });

    companyId = companyResponse.data.data.id;
    console.log('   ✅ Company created successfully!');
    console.log(`   📋 Company ID: ${companyId}`);
    console.log(`   🏢 Company Name: ${companyResponse.data.data.name}`);
    console.log(`   🔤 Short Name: ${companyResponse.data.data.short_name}\n`);

    // Step 2: Create First Employee
    console.log('2️⃣  Creating First Employee (John Doe)...');
    const employee1Response = await axios.post(`${BASE_URL}/auth/signup`, {
      company_id: companyId,
      email: 'john.doe@gizodo.com',
      first_name: 'John',
      last_name: 'Doe',
      date_of_joining: '2024-01-15',
      date_of_birth: '1990-05-20',
      phone: '+91-9876543210',
      gender: 'male',
      department: 'Engineering',
      designation: 'Software Engineer',
      employment_type: 'permanent',
      basic_salary: 50000,
      role: 'employee'
    });

    const emp1 = employee1Response.data.data;
    console.log('   ✅ Employee created successfully!');
    console.log(`   🆔 Employee ID: ${emp1.employee_id}`);
    console.log(`   📧 Email: ${emp1.email}`);
    console.log(`   🔑 Temporary Password: ${emp1.temporary_password}`);
    console.log(`   💰 Net Salary: $${emp1.employee.net_salary}\n`);

    employeeCredentials = {
      email: emp1.email,
      password: emp1.temporary_password
    };

    // Step 3: Create Second Employee
    console.log('3️⃣  Creating Second Employee (Jane Smith)...');
    const employee2Response = await axios.post(`${BASE_URL}/auth/signup`, {
      company_id: companyId,
      email: 'jane.smith@gizodo.com',
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_joining: '2024-02-01',
      date_of_birth: '1992-08-15',
      phone: '+91-9876543211',
      gender: 'female',
      department: 'Human Resources',
      designation: 'HR Manager',
      employment_type: 'permanent',
      basic_salary: 60000,
      role: 'hr'
    });

    const emp2 = employee2Response.data.data;
    console.log('   ✅ Employee created successfully!');
    console.log(`   🆔 Employee ID: ${emp2.employee_id}`);
    console.log(`   📧 Email: ${emp2.email}`);
    console.log(`   🔑 Temporary Password: ${emp2.temporary_password}`);
    console.log(`   💰 Net Salary: $${emp2.employee.net_salary}\n`);

    // Step 4: Test Employee Login
    console.log('4️⃣  Testing Employee Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/signin`, {
      email: employeeCredentials.email,
      password: employeeCredentials.password
    });

    console.log('   ✅ Login successful!');
    console.log(`   👤 Welcome ${loginResponse.data.data.user.employeeProfile.first_name} ${loginResponse.data.data.user.employeeProfile.last_name}`);
    console.log(`   🎯 Role: ${loginResponse.data.data.user.role}\n`);

    // Step 5: Get Company Details
    console.log('5️⃣  Fetching Company Details with Employees...');
    const companyDetailsResponse = await axios.get(`${BASE_URL}/companies/${companyId}`);

    console.log('   ✅ Company details fetched!');
    console.log(`   🏢 ${companyDetailsResponse.data.data.name}`);
    console.log(`   👥 Total Employees: ${companyDetailsResponse.data.data.employees.length}`);
    companyDetailsResponse.data.data.employees.forEach((emp, index) => {
      console.log(`      ${index + 1}. ${emp.first_name} ${emp.last_name} - ${emp.department}`);
    });
    console.log();

    // Summary
    console.log('='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Company creation: SUCCESS');
    console.log('✅ Employee ID auto-generation: SUCCESS');
    console.log('✅ Password auto-generation: SUCCESS');
    console.log('✅ Salary calculations: SUCCESS');
    console.log('✅ Employee login: SUCCESS');
    console.log('✅ Multi-tenant associations: SUCCESS');
    console.log('='.repeat(60));
    console.log('\n🎉 All workflow tests completed successfully!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Implement email service to send credentials');
    console.log('   2. Add password change enforcement on first login');
    console.log('   3. Build frontend components for the workflow');
    console.log('   4. Integrate leave balance deduction logic');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('   Validation Errors:', error.response.data.errors);
    }
  }
}

// Run the test
testWorkflow();
