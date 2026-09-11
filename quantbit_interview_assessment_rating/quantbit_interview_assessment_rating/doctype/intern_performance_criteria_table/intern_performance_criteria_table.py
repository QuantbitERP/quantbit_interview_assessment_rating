# Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class InternPerformanceCriteriaTable(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		category: DF.Link | None
		category_weightage: DF.Percent
		criteria: DF.Link | None
		# weightage: DF.Percent
		final_contribution: DF.Float
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		rating: DF.Float
		remarks: DF.SmallText | None
		weightage: DF.Percent
		weighted_score: DF.Float
	# end: auto-generated types

	_DOCTYPE_NAME = "Intern Performance Criteria Table"
