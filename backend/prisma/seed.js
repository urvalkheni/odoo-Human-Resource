const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  try {
    // Create Admin User
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@dayflow.com' },
      update: {},
      create: {
        email: 'admin@dayflow.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });
    
    // Create Departments
    console.log('Creating departments...');
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { code: 'IT' },
        update: {},
        create: {
          code: 'IT',
          name: 'Information Technology',
          description: 'IT Department handles all technology-related operations',
          budget: 500000,
          isActive: true
        }
      }),
      prisma.department.upsert({
        where: { code: 'HR' },
        update: {},
        create: {
          code: 'HR',
          name: 'Human Resources',
          description: 'HR Department manages employee relations and recruitment',
          budget: 300000,
          isActive: true
        }
      }),
      prisma.department.upsert({
        where: { code: 'FIN' },
        update: {},
        create: {
          code: 'FIN',
          name: 'Finance',
          description: 'Finance Department manages company finances',
          budget: 400000,
          isActive: true
        }
      }),
      prisma.department.upsert({
        where: { code: 'MKT' },
        update: {},
        create: {
          code: 'MKT',
          name: 'Marketing',
          description: 'Marketing Department handles promotions and branding',
          budget: 350000,
          isActive: true
        }
      })
    ]);
    
    // Create Job Positions
    console.log('Creating job positions...');
    const jobPositions = await Promise.all([
      prisma.jobPosition.create({
        data: {
          title: 'Software Engineer',
          description: 'Develops and maintains software applications',
          requirements: 'Bachelor in Computer Science, 2+ years experience'
        }
      }),
      prisma.jobPosition.create({
        data: {
          title: 'HR Manager',
          description: 'Manages HR operations and employee relations',
          requirements: 'MBA in HR, 5+ years experience'
        }
      }),
      prisma.jobPosition.create({
        data: {
          title: 'Financial Analyst',
          description: 'Analyzes financial data and prepares reports',
          requirements: 'CA/CFA, 3+ years experience'
        }
      }),
      prisma.jobPosition.create({
        data: {
          title: 'Marketing Executive',
          description: 'Plans and executes marketing campaigns',
          requirements: 'Bachelor in Marketing, 2+ years experience'
        }
      })
    ]);
    
    // Create Admin Employee
    console.log('Creating admin employee...');
    const adminEmployee = await prisma.employee.create({
      data: {
        employeeCode: 'EMP00001',
        userId: adminUser.id,
        name: 'Admin User',
        dateOfJoining: new Date('2024-01-01'),
        gender: 'OTHER',
        workEmail: 'admin@dayflow.com',
        workPhone: '1234567890',
        departmentId: departments[1].id, // HR Department
        jobPositionId: jobPositions[1].id, // HR Manager
        employeeType: 'PERMANENT',
        status: 'ACTIVE',
        basicSalary: 80000,
        allowances: 20000
      }
    });
    
    // Create some sample holidays
    console.log('Creating holidays...');
    await Promise.all([
      prisma.holiday.create({
        data: {
          date: new Date('2026-01-26'),
          name: 'Republic Day',
          description: 'National Holiday'
        }
      }),
      prisma.holiday.create({
        data: {
          date: new Date('2026-08-15'),
          name: 'Independence Day',
          description: 'National Holiday'
        }
      }),
      prisma.holiday.create({
        data: {
          date: new Date('2026-10-02'),
          name: 'Gandhi Jayanti',
          description: 'National Holiday'
        }
      })
    ]);
    
    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('Email: admin@dayflow.com');
    console.log('Password: Admin@123');
    console.log('\n🎉 You can now start the server and login!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
