const { Company, Employee } = require('../models');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Create new company
 * @route   POST /api/v1/companies
 * @access  Private (Admin only)
 */
exports.createCompany = async (req, res, next) => {
  try {
    const { name, short_name, email, phone, address, website } = req.body;

    // Check if company with same name exists
    const existingCompany = await Company.findOne({
      where: { name }
    });

    if (existingCompany) {
      return next(new ErrorResponse('Company with this name already exists', 400));
    }

    // Check if short name already exists
    const existingShortName = await Company.findOne({
      where: { short_name }
    });

    if (existingShortName) {
      return next(new ErrorResponse('Company short name already exists', 400));
    }

    const company = await Company.create({
      name,
      short_name: short_name.toUpperCase(),
      email,
      phone,
      address,
      website
    });

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies
 * @route   GET /api/v1/companies
 * @access  Private (Admin/HR)
 */
exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.findAll({
      include: [
        {
          model: Employee,
          as: 'employees',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single company
 * @route   GET /api/v1/companies/:id
 * @access  Private (Admin/HR)
 */
exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          as: 'employees',
          attributes: ['id', 'first_name', 'last_name', 'department', 'designation']
        }
      ]
    });

    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company
 * @route   PUT /api/v1/companies/:id
 * @access  Private (Admin only)
 */
exports.updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findByPk(req.params.id);

    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    const { name, short_name, email, phone, address, website, is_active } = req.body;

    company = await company.update({
      name,
      short_name: short_name ? short_name.toUpperCase() : company.short_name,
      email,
      phone,
      address,
      website,
      is_active
    });

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete company
 * @route   DELETE /api/v1/companies/:id
 * @access  Private (Admin only)
 */
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    // Check if company has employees
    const employeeCount = await Employee.count({
      where: { company_id: req.params.id }
    });

    if (employeeCount > 0) {
      return next(new ErrorResponse('Cannot delete company with existing employees', 400));
    }

    await company.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
