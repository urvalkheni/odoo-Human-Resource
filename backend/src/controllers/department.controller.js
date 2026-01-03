const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DepartmentController {
  async getAll(req, res) {
    try {
      const departments = await prisma.department.findMany({
        include: {
          _count: { select: { employees: true } }
        },
        orderBy: { name: 'asc' }
      });
      
      res.json({ success: true, data: departments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async getById(req, res) {
    try {
      const department = await prisma.department.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { employees: true }
      });
      
      if (!department) {
        return res.status(404).json({ success: false, message: 'Department not found' });
      }
      
      res.json({ success: true, data: department });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async create(req, res) {
    try {
      const department = await prisma.department.create({ data: req.body });
      res.status(201).json({ success: true, data: department });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async update(req, res) {
    try {
      const department = await prisma.department.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
      });
      res.json({ success: true, data: department });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async delete(req, res) {
    try {
      await prisma.department.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ success: true, message: 'Department deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DepartmentController();
