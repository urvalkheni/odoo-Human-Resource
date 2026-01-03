# -*- coding: utf-8 -*-
{
    'name': 'Dayflow - Employee Management',
    'version': '1.0.0',
    'category': 'Human Resources',
    'summary': 'Employee Master Data and Profile Management',
    'description': """
        Dayflow Employee Management Module
        ===================================
        * Employee CRUD operations
        * Department management
        * Job position management
        * Employee hierarchy
        * Employee documents
        * Skills and qualifications
        * Contact information
        * Bank details
    """,
    'author': 'Dayflow HRMS Team - Member 1',
    'website': 'https://github.com/urvalkheni/odoo-Human-Resource',
    'depends': ['hr', 'base', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'data/sequence.xml',
        'views/employee_views.xml',
        'views/department_views.xml',
        'views/menu_views.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
