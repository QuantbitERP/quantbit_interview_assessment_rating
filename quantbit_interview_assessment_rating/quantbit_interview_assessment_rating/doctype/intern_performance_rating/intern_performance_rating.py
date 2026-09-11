# Copyright (c) 2026, Quantbit Technologe PVT LTD and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt

# Keep this in sync with MAX_RATING in the client script.
MAX_RATING = 5


class InternPerformanceRating(Document):
    def validate(self):
        # Validate weightages BEFORE calculating scores, so an invalid
        # setup is rejected instead of silently producing a wrong score
        # first and only then throwing.
        self.validate_weightage()
        self.calculate_scores()

    def validate_weightage(self):
        rows = self.criteria_table or []

        if not rows:
            frappe.throw(_("Please add at least one Performance Criteria."))

        category_weightages = {}
        criteria_totals = {}

        for row in rows:
            if not row.category:
                frappe.throw(_("Row {0}: Category is mandatory").format(row.idx))
            if not row.criteria:
                frappe.throw(_("Row {0}: Criteria is mandatory").format(row.idx))
            if row.rating in (None, ""):
                frappe.throw(_("Row {0}: Rating is mandatory for {1}").format(row.idx, row.criteria))
            if flt(row.rating) < 0 or flt(row.rating) > MAX_RATING:
                frappe.throw(_("Row {0}: Rating must be between 0 and {1}").format(row.idx, MAX_RATING))

            category_weightages[row.category] = flt(row.category_weightage)
            criteria_totals.setdefault(row.category, 0)
            criteria_totals[row.category] += flt(row.weightage)

        errors = []

        for category, total in criteria_totals.items():
            if abs(round(total, 2) - 100) > 0.01:
                errors.append(
                    _("Criteria Weightage inside category '{0}' must be 100%. Currently: {1}%").format(
                        category, round(total, 2)
                    )
                )

        total_category_weightage = round(sum(category_weightages.values()), 2)
        if abs(total_category_weightage - 100) > 0.01:
            errors.append(
                _("Total Category Weightage must be 100%. Currently: {0}%").format(total_category_weightage)
            )

        if errors:
            frappe.throw("<br><br>".join(errors), title=_("Invalid Weightage"))

    def calculate_scores(self):
        category_totals = {}  # { category: {"score": float, "category_weightage": float} }

        for row in self.criteria_table:
            row.weighted_score = round(flt(row.rating) * flt(row.weightage) / 100, 2)

            category_totals.setdefault(
                row.category, {"score": 0, "category_weightage": flt(row.category_weightage)}
            )
            category_totals[row.category]["score"] += row.weighted_score

        final_score = 0
        total_category_weightage = 0

        for category, data in category_totals.items():
            category_score = round(data["score"], 2)
            contribution = round(category_score * data["category_weightage"] / 100, 2)

            final_score += contribution
            total_category_weightage += data["category_weightage"]

            for row in self.criteria_table:
                if row.category == category:
                    row.final_contribution = contribution

        final_score = round(final_score, 2)

        self.total_weightage = round(total_category_weightage, 2)
        self.total_score = final_score
        # Percentage relative to the max possible rating, not a hard-coded *10
        # (that made a perfect score cap out well below 100%).
        self.overall_percentage = round((final_score / MAX_RATING) * 100, 2)
        self.overall_rating = self.get_rating_label(self.overall_percentage)

    @staticmethod
    def get_rating_label(pct):
        if pct >= 90:
            return "Excellent"
        if pct >= 75:
            return "Very Good"
        if pct >= 60:
            return "Good"
        if pct >= 50:
            return "Average"
        return "Needs Improvement"