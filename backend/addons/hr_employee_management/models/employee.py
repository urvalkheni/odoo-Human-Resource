# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
import re

class HrEmployee(models.Model):
    """Extended HR Employee Model with additional fields and business logic"""
    _inherit = 'hr.employee'
    _description = 'Employee Management'
    
    # Personal Information
    employee_code = fields.Char(string='Employee Code', required=True, copy=False, 
                                readonly=True, default='New')
    date_of_birth = fields.Date(string='Date of Birth')
    age = fields.Integer(string='Age', compute='_compute_age', store=True)
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], string='Gender')
    blood_group = fields.Selection([
        ('a+', 'A+'), ('a-', 'A-'),
        ('b+', 'B+'), ('b-', 'B-'),
        ('o+', 'O+'), ('o-', 'O-'),
        ('ab+', 'AB+'), ('ab-', 'AB-')
    ], string='Blood Group')
    marital_status = fields.Selection([
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed')
    ], string='Marital Status')
    
    # Contact Information
    personal_email = fields.Char(string='Personal Email')
    personal_mobile = fields.Char(string='Personal Mobile')
    emergency_contact_name = fields.Char(string='Emergency Contact Name')
    emergency_contact_number = fields.Char(string='Emergency Contact Number')
    current_address = fields.Text(string='Current Address')
    permanent_address = fields.Text(string='Permanent Address')
    
    # Employment Information
    date_of_joining = fields.Date(string='Date of Joining')
    employee_type = fields.Selection([
        ('permanent', 'Permanent'),
        ('contract', 'Contract'),
        ('intern', 'Intern'),
        ('temporary', 'Temporary')
    ], string='Employee Type', default='permanent')
    probation_period = fields.Integer(string='Probation Period (Months)', default=6)
    confirmation_date = fields.Date(string='Confirmation Date')
    notice_period = fields.Integer(string='Notice Period (Days)', default=30)
    
    # Professional Information
    qualification = fields.Char(string='Qualification')
    skills = fields.Text(string='Skills')
    previous_experience = fields.Float(string='Previous Experience (Years)')
    total_experience = fields.Float(string='Total Experience', compute='_compute_total_experience')
    
    # Bank Details
    bank_name = fields.Char(string='Bank Name')
    bank_account_number = fields.Char(string='Account Number')
    bank_ifsc_code = fields.Char(string='IFSC Code')
    pan_number = fields.Char(string='PAN Number')
    aadhar_number = fields.Char(string='Aadhar Number')
    
    # Status
    active_status = fields.Selection([
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('on_leave', 'On Leave'),
        ('terminated', 'Terminated')
    ], string='Status', default='active', tracking=True)
    
    @api.model
    def create(self, vals):
        """Generate employee code on creation"""
        if vals.get('employee_code', 'New') == 'New':
            vals['employee_code'] = self.env['ir.sequence'].next_by_code('hr.employee.code') or 'New'
        return super(HrEmployee, self).create(vals)
    
    @api.depends('date_of_birth')
    def _compute_age(self):
        """Calculate age from date of birth"""
        for record in self:
            if record.date_of_birth:
                today = fields.Date.today()
                record.age = today.year - record.date_of_birth.year - \
                            ((today.month, today.day) < (record.date_of_birth.month, record.date_of_birth.day))
            else:
                record.age = 0
    
    @api.depends('date_of_joining', 'previous_experience')
    def _compute_total_experience(self):
        """Calculate total experience"""
        for record in self:
            if record.date_of_joining:
                today = fields.Date.today()
                years_in_company = (today - record.date_of_joining).days / 365.25
                record.total_experience = years_in_company + (record.previous_experience or 0)
            else:
                record.total_experience = record.previous_experience or 0
    
    @api.constrains('personal_email', 'work_email')
    def _check_email(self):
        """Validate email format"""
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        for record in self:
            if record.personal_email and not re.match(email_regex, record.personal_email):
                raise ValidationError('Invalid personal email format!')
            if record.work_email and not re.match(email_regex, record.work_email):
                raise ValidationError('Invalid work email format!')
    
    @api.constrains('personal_mobile', 'work_phone')
    def _check_mobile(self):
        """Validate mobile number"""
        for record in self:
            if record.personal_mobile and (len(record.personal_mobile) < 10 or not record.personal_mobile.isdigit()):
                raise ValidationError('Personal mobile must be at least 10 digits!')
            if record.work_phone and (len(record.work_phone) < 10 or not record.work_phone.isdigit()):
                raise ValidationError('Work phone must be at least 10 digits!')
    
    @api.constrains('pan_number')
    def _check_pan(self):
        """Validate PAN number format"""
        pan_regex = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
        for record in self:
            if record.pan_number and not re.match(pan_regex, record.pan_number.upper()):
                raise ValidationError('Invalid PAN format! Format: ABCDE1234F')
    
    def action_activate(self):
        """Activate employee"""
        self.write({'active_status': 'active', 'active': True})
        return True
    
    def action_deactivate(self):
        """Deactivate employee"""
        self.write({'active_status': 'inactive', 'active': False})
        return True
    
    def action_terminate(self):
        """Terminate employee"""
        self.write({'active_status': 'terminated', 'active': False})
        return True
