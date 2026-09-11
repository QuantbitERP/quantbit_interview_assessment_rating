# Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class PerformanceCategory(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		amended_from: DF.Link | None
		category_name: DF.Data
		is_active: DF.Check
		priority: DF.Literal["", "Low", "Medium", "High", "Critical"]
		weightage: DF.Percent
	# end: auto-generated types

	_DOCTYPE_NAME = "Performance Category"
