# Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class PerformanceCriteria(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		amended_from: DF.Link | None
		category: DF.Link
		criteria_name: DF.Data
		default_weightage: DF.Percent
		description: DF.SmallText | None
		is_active: DF.Check
	# end: auto-generated types

	_DOCTYPE_NAME = "Performance Criteria"
