# Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class JobopeningInterviewroundTypesTabel(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		active: DF.Check
		interview_round: DF.Link
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		weitage: DF.Percent
	# end: auto-generated types

	_DOCTYPE_NAME = "Job opening Interview round Types Tabel"
