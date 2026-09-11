# Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class InterviewAssesmantRatingTable(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		interview_round: DF.Link | None
		interview_type_weightage: DF.Percent
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		rating: DF.Float
		skills_name: DF.Link | None
		weightage: DF.Percent
		weighted_score: DF.Float
	# end: auto-generated types

	_DOCTYPE_NAME = "Interview Assesmant Rating Table"
