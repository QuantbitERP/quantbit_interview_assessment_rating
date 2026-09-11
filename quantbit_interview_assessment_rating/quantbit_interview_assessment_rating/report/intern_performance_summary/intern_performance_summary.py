# Copyright (c) 2026, Quantbit Technologe PVT LTD and contributors
# For license information, please see license.txt

# import frappe
import frappe
from frappe import _


def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    return columns, data


def execute_snapshot_report(filters=None):
    columns = get_columns()
    data = get_data(filters)
    return columns, data


def get_columns():
    return [
        {
            "label": _("Intern"),
            "fieldname": "intern",
            "fieldtype": "Link",
            "options": "User",
            "width": 150

        },
        {
            "label": _("Intern Name"),
            "fieldname": "intern_name",
            "fieldtype": "Data",
            "width": 300
        },
        {
            "label": _("Department"),
            "fieldname": "department",
            "fieldtype": "Link",
            "options": "Department",
            "width": 200
        },
        {
            "label": _("Mentor"),
            "fieldname": "mentor",
            "fieldtype": "Link",
            "options": "Employee",
            "width": 150
        },
        {
            "label": _("Evaluation Date"),
            "fieldname": "evaluation_date",
            "fieldtype": "Date",
            "width": 120
        },
        {
            "label": _("From Date"),
            "fieldname": "from_date",
            "fieldtype": "Date",
            "width": 100
        },
        {
            "label": _("To Date"),
            "fieldname": "to_date",
            "fieldtype": "Date",
            "width": 100
        },
        {
            "label": _("Total Weightage"),
            "fieldname": "total_weightage",
            "fieldtype": "Percent",
            "width": 120
        },
        {
            "label": _("Overall Percentage"),
            "fieldname": "overall_percentage",
            "fieldtype": "Percent",
            "width": 130
        },
        {
            "label": _("Total Score"),
            "fieldname": "total_score",
            "fieldtype": "Float",
            "width": 100
        },
        {
            "label": _("Overall Rating"),
            "fieldname": "overall_rating",
            "fieldtype": "Data",
            "width": 200
        },
        {
            "label": _("Recommendation"),
            "fieldname": "recommendation",
            "fieldtype": "Data",
            "width": 250
        }
    ]


def get_data(filters=None):
    filters = filters or {}
    conditions = {}

    if filters.get("department"):
        conditions["department"] = filters.get("department")

    if filters.get("mentor"):
        conditions["mentor"] = filters.get("mentor")

    if filters.get("overall_rating"):
        conditions["overall_rating"] = filters.get("overall_rating")

    if filters.get("recommendation"):
        conditions["recommendation"] = filters.get("recommendation")

    # if filters.get("evaluation_from_date"):
    #     conditions["evaluation_date"] = [
    #         ">=",
    #         filters.get("evaluation_from_date")
    #     ]

    # if filters.get("evaluation_to_date"):
    #     conditions["evaluation_date"] = [
    #         "<=",
    #         filters.get("evaluation_to_date")
    #     ]

    if filters.get("intern"):
        conditions["intern"] = filters.get("intern")

    data = frappe.get_all(
        "Intern Performance Rating",
        filters=conditions,
        fields=[
            "intern",
            "intern_name",
            "department",
            "mentor",
            "evaluation_date",
            "from_date",
            "to_date",
            "total_weightage",
            "overall_percentage",
            "total_score",
            "overall_rating",
            "recommendation"
        ],
        order_by="evaluation_date asc"
    )

    return data
