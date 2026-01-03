# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class HrDepartment(models.Model):
    """Extended HR Department Model"""
    _inherit = 'hr.department'
    _description = 'Department Management'
    
    code = fields.Char(string='Department Code', required=True, copy=False)
    description = fields.Text(string='Description')
    employee_count = fields.Integer(string='Total Employees', compute='_compute_employee_count')
    budget = fields.Float(string='Department Budget')
    active = fields.Boolean(string='Active', default=True)
    
    @api.depends('member_ids')
    def _compute_employee_count(self):
        """Count total employees in department"""
        for record in self:
            record.employee_count = len(record.member_ids)
    
    @api.constrains('code')
    def _check_code_unique(self):
        """Ensure department code is unique"""
        for record in self:
            if self.search_count([('code', '=', record.code), ('id', '!=', record.id)]) > 0:
                raise ValidationError('Department code must be unique!')
    
    def action_view_employees(self):
        """View all employees in this department"""
        return {
            'name': 'Employees',
            'type': 'ir.actions.act_window',
            'res_model': 'hr.employee',
            'view_mode': 'tree,form',
            'domain': [('department_id', '=', self.id)],
            'context': {'default_department_id': self.id}
        }
