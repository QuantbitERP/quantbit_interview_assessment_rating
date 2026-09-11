# Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class InterviewRoundTypes(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		active: DF.Check
		amended_from: DF.Link | None
		interview_round_type: DF.Data
		priority: DF.Literal["", "Low", "Medium", "High", "Critical"]
		weightage: DF.Percent
	# end: auto-generated types

	_DOCTYPE_NAME = "Interview Round Types"
