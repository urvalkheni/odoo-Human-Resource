# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import json

class EmployeeController(http.Controller):
    """API Controller for Employee Management"""
    
    @http.route('/api/employee/list', type='json', auth='user', methods=['POST'])
    def get_employee_list(self, **kwargs):
        """Get list of all employees"""
        try:
            domain = kwargs.get('domain', [])
            fields = kwargs.get('fields', ['name', 'employee_code', 'work_email', 'department_id'])
            limit = kwargs.get('limit', 100)
            
            employees = request.env['hr.employee'].search_read(
                domain=domain,
                fields=fields,
                limit=limit
            )
            
            return {
                'success': True,
                'data': employees,
                'count': len(employees)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @http.route('/api/employee/create', type='json', auth='user', methods=['POST'])
    def create_employee(self, **kwargs):
        """Create new employee"""
        try:
            data = kwargs.get('data', {})
            employee = request.env['hr.employee'].create(data)
            
            return {
                'success': True,
                'message': 'Employee created successfully',
                'employee_id': employee.id,
                'employee_code': employee.employee_code
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @http.route('/api/employee/<int:employee_id>', type='json', auth='user', methods=['POST'])
    def get_employee_details(self, employee_id, **kwargs):
        """Get employee details by ID"""
        try:
            employee = request.env['hr.employee'].browse(employee_id)
            
            if not employee.exists():
                return {
                    'success': False,
                    'error': 'Employee not found'
                }
            
            return {
                'success': True,
                'data': {
                    'id': employee.id,
                    'name': employee.name,
                    'employee_code': employee.employee_code,
                    'email': employee.work_email,
                    'mobile': employee.work_phone,
                    'department': employee.department_id.name if employee.department_id else None,
                    'job_title': employee.job_id.name if employee.job_id else None,
                    'status': employee.active_status,
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @http.route('/api/employee/update', type='json', auth='user', methods=['POST'])
    def update_employee(self, **kwargs):
        """Update employee information"""
        try:
            employee_id = kwargs.get('employee_id')
            data = kwargs.get('data', {})
            
            employee = request.env['hr.employee'].browse(employee_id)
            
            if not employee.exists():
                return {
                    'success': False,
                    'error': 'Employee not found'
                }
            
            employee.write(data)
            
            return {
                'success': True,
                'message': 'Employee updated successfully'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @http.route('/api/employee/delete', type='json', auth='user', methods=['POST'])
    def delete_employee(self, **kwargs):
        """Delete employee"""
        try:
            employee_id = kwargs.get('employee_id')
            employee = request.env['hr.employee'].browse(employee_id)
            
            if not employee.exists():
                return {
                    'success': False,
                    'error': 'Employee not found'
                }
            
            employee.unlink()
            
            return {
                'success': True,
                'message': 'Employee deleted successfully'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @http.route('/api/employee/search', type='json', auth='user', methods=['POST'])
    def search_employee(self, **kwargs):
        """Search employees by name, code, or email"""
        try:
            search_term = kwargs.get('search_term', '')
            
            domain = ['|', '|',
                     ('name', 'ilike', search_term),
                     ('employee_code', 'ilike', search_term),
                     ('work_email', 'ilike', search_term)]
            
            employees = request.env['hr.employee'].search_read(
                domain=domain,
                fields=['name', 'employee_code', 'work_email', 'department_id'],
                limit=50
            )
            
            return {
                'success': True,
                'data': employees,
                'count': len(employees)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
