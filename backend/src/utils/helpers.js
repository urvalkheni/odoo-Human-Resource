const { User } = require('../models');
const crypto = require('crypto');

/**
 * Generate auto employee ID in format: CompanyShortName + First2LettersFirstName + First2LettersLastName + YearOfJoining + SerialNumber
 * Example: GIZODO2022001
 * 
 * @param {string} companyShortName - Company short name (e.g., "GIZO")
 * @param {string} firstName - Employee first name
 * @param {string} lastName - Employee last name
 * @param {number} yearOfJoining - Year of joining (optional, defaults to current year)
 * @returns {Promise<string>} Generated employee ID
 */
exports.generateEmployeeId = async (companyShortName, firstName, lastName, yearOfJoining) => {
  try {
    // Validate inputs
    if (!companyShortName || !firstName || !lastName) {
      throw new Error('Company short name, first name, and last name are required');
    }

    // Get first 2 letters of names (uppercase), handle single character names
    const firstNameInitials = firstName.substring(0, Math.min(2, firstName.length)).toUpperCase().padEnd(2, 'X');
    const lastNameInitials = lastName.substring(0, Math.min(2, lastName.length)).toUpperCase().padEnd(2, 'X');

    // Get year
    const year = yearOfJoining || new Date().getFullYear();

    // Create base ID pattern
    const basePattern = `${companyShortName.toUpperCase()}${firstNameInitials}${lastNameInitials}${year}`;

    // Find the last employee with this pattern
    const lastEmployee = await User.findOne({
      where: {
        employee_id: {
          [require('sequelize').Op.like]: `${basePattern}%`
        }
      },
      order: [['employee_id', 'DESC']]
    });

    // Generate serial number
    let serialNumber = 1;
    if (lastEmployee && lastEmployee.employee_id) {
      const lastSerial = parseInt(lastEmployee.employee_id.slice(-3));
      if (!isNaN(lastSerial)) {
        serialNumber = lastSerial + 1;
      }
    }

    // Format serial number with leading zeros (max 999 employees per pattern)
    const serialStr = serialNumber.toString().padStart(3, '0');

    return `${basePattern}${serialStr}`.trim();
  } catch (error) {
    throw new Error('Failed to generate employee ID: ' + error.message);
  }
};

/**
 * Generate random secure password
 * Format: 1 uppercase + 5 lowercase + 2 numbers + 1 special character = 9 characters
 * Example: Rabcde12@
 * 
 * @returns {string} Generated password (9 characters)
 */
exports.generateRandomPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$!&*';

  // Generate random password: 1 uppercase + 5 lowercase + 2 numbers + 1 special
  let password = '';

  // 1 uppercase letter
  password += chars[Math.floor(Math.random() * chars.length)].toUpperCase();

  // 5 lowercase letters
  for (let i = 0; i < 5; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // 2 numbers
  for (let i = 0; i < 2; i++) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }

  // 1 special character
  password += special[Math.floor(Math.random() * special.length)];

  // Shuffle the password to make it more random
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Calculate salary components based on basic salary
 * Includes all allowances and deductions as per Indian payroll standards
 * 
 * @param {number} basicSalary - Basic salary amount
 * @returns {object} Object containing all salary components
 */
exports.calculateSalaryComponents = (basicSalary) => {
  // Validate input
  if (!basicSalary || basicSalary < 0) {
    throw new Error('Basic salary must be a positive number');
  }

  // Convert to number if string
  const basic = parseFloat(basicSalary);

  // Standard calculations based on basic salary
  const hra = parseFloat((basic * 0.4).toFixed(2)); // 40% HRA (House Rent Allowance)
  const da = parseFloat((basic * 0.1).toFixed(2));  // 10% DA (Dearness Allowance)
  const ta = parseFloat((basic * 0.05).toFixed(2)); // 5% TA (Transport Allowance)
  const medicalAllowance = 1250.00; // Fixed medical allowance per month
  const otherAllowances = parseFloat((basic * 0.05).toFixed(2)); // 5% other allowances

  const grossSalary = parseFloat((basic + hra + da + ta + medicalAllowance + otherAllowances).toFixed(2));

  // Deductions
  const pf = parseFloat((basic * 0.12).toFixed(2)); // 12% PF (Provident Fund)
  const esi = grossSalary < 21000 ? parseFloat((grossSalary * 0.0075).toFixed(2)) : 0; // 0.75% ESI if gross < $21,000
  const professionalTax = 200.00; // Fixed PT per month
  const tds = parseFloat((grossSalary * 0.1).toFixed(2)); // 10% TDS (simplified calculation)

  const totalDeductions = parseFloat((pf + esi + professionalTax + tds).toFixed(2));
  const netSalary = parseFloat((grossSalary - totalDeductions).toFixed(2));

  return {
    basic_salary: basic,
    hra,
    da,
    ta,
    medical_allowance: medicalAllowance,
    other_allowances: otherAllowances,
    gross_salary: grossSalary,
    pf,
    esi,
    professional_tax: professionalTax,
    tds,
    total_deductions: totalDeductions,
    net_salary: netSalary
  };
};
