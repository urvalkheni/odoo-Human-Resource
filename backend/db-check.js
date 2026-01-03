const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database connection and tables...\n');
  
  try {
    // Check connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');
    
    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('📋 Tables found in database:');
    console.log('================================');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    console.log('================================\n');
    
    // Count records in each main table
    console.log('📊 Record counts:');
    console.log('================================');
    
    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount}`);
    
    const employeeCount = await prisma.employee.count();
    console.log(`Employees: ${employeeCount}`);
    
    const attendanceCount = await prisma.attendance.count();
    console.log(`Attendance: ${attendanceCount}`);
    
    const leaveCount = await prisma.leaveRequest.count();
    console.log(`Leave Requests: ${leaveCount}`);
    
    const payrollCount = await prisma.payroll.count();
    console.log(`Payrolls: ${payrollCount}`);
    
    console.log('================================\n');
    console.log('✅ Database health check completed!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
