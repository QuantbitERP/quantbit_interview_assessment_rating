# Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class InterviewAssesmentForm(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF
		from quantbit_interview_assessment_rating.quantbit_interview_assessment_rating.doctype.interview_assesmant_rating_table.interview_assesmant_rating_table import InterviewAssesmantRatingTable

		amended_from: DF.Link | None
		applicant_strengths_and_weaknesses: DF.SmallText | None
		applicent: DF.Link
		applicent_name: DF.Data
		date: DF.Datetime | None
		date_of_interview: DF.Date
		desiganation: DF.Data
		end_time: DF.Time
		interview_round_type: DF.Link | None
		interviwer_name: DF.Link
		naming_series: DF.Literal["INT-ASS-.YYYY.-.####"]
		overall_feedback_of_the_interviewer: DF.SmallText | None
		overall_percentage: DF.Percent
		posting_applyed_for: DF.Data
		rating_table: DF.Table[InterviewAssesmantRatingTable]
		recommendation: DF.Literal["", "Select", "Hold", "Not suitable for the post"]
		start_time: DF.Time
		total_score: DF.Float
		total_weightage: DF.Percent
	# end: auto-generated types

	_DOCTYPE_NAME = "Interview Assesment Form"
