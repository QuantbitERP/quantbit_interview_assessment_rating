# Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class SkillsForm(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		interview_round: DF.Link
		priority: DF.Literal["", "High", "Medium", "Low"]
		skill_name: DF.Data
		weitage: DF.Percent
	# end: auto-generated types

	_DOCTYPE_NAME = "Skills Form"
