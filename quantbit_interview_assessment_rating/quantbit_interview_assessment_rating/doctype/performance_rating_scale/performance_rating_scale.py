# Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class PerformanceRatingScale(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		amended_from: DF.Link | None
		description: DF.SmallText | None
		rating: DF.Int
		rating_label: DF.Data
		score: DF.Float
	# end: auto-generated types

	_DOCTYPE_NAME = "Performance Rating Scale"
