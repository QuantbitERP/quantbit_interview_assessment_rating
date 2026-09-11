// Copyright (c) 2026, Quantbit Technologe PVT LTD and contributors
// For license information, please see license.txt

// Change this if your rating scale isn't 1-5.
const MAX_RATING = 5;

frappe.ui.form.on("Intern Performance Rating", {
    refresh: function (frm) {
        if (frm.is_new()) {
            frm.set_value("evaluation_date", frappe.datetime.get_today());
        }

        frm.add_custom_button(__("Load All Categories"), function () {
            load_all_categories(frm);
        });

        calculate_overall(frm);
    },

    // "categories" is a Table MultiSelect field - picking/removing a pill
    // fires the plain field-level trigger (this one), not child-table
    // _add / _remove events (those are for regular grid tables only).
    categories: function (frm) {
        rebuild_criteria_table(frm);
    },

    validate: function (frm) {
        // Validate BEFORE calculating, so a bad weightage setup can't
        // produce a "final" score that then gets rejected anyway.
        validate_weightages(frm);
        calculate_overall(frm);
    },

    criteria_table_add: function (frm) {
        calculate_overall(frm);
    },

    criteria_table_remove: function (frm) {
        calculate_overall(frm);
    },
});

frappe.ui.form.on("Intern Performance Criteria Table", {
    category: function (frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (!row.category) return;

        frappe.db.get_value("Performance Category", row.category, "weightage").then((r) => {
            if (!r.message) return;
            frappe.model.set_value(cdt, cdn, "category_weightage", flt(r.message.weightage));
            calculate_overall(frm);
        });
    },

    criteria: function (frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (!row.criteria) return;

        frappe.db.get_value("Performance Criteria", row.criteria, "default_weightage").then((r) => {
            if (!r.message) return;
            frappe.model.set_value(cdt, cdn, "weightage", flt(r.message.default_weightage));
            calculate_overall(frm);
        });
    },

    // One recalculation path for the whole table - no duplicated per-row math.
    rating: (frm) => calculate_overall(frm),
    weightage: (frm) => calculate_overall(frm),
    category_weightage: (frm) => calculate_overall(frm),
});

function rebuild_criteria_table(frm) {
    frm.clear_table("criteria_table");

    const categories = (frm.doc.categories || []).map((r) => r.category).filter(Boolean);

    if (!categories.length) {
        frm.refresh_field("criteria_table");
        calculate_overall(frm);
        return;
    }

    load_criteria_for_categories(frm, categories);
}

function load_all_categories(frm) {
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Performance Category",
            filters: { is_active: 1 },
            fields: ["name", "weightage"],
            limit_page_length: 0,
        },
        callback: function (r) {
            if (!r.message || !r.message.length) {
                frappe.msgprint({
                    title: __("No Categories"),
                    message: __("No active Performance Categories found."),
                    indicator: "orange",
                });
                return;
            }

            frm.clear_table("categories");

            r.message.forEach((cat) => {
                const row = frm.add_child("categories");
                row.category = cat.name;
                row.category_weightage = flt(cat.weightage);
            });

            frm.refresh_field("categories");
            load_criteria_for_categories(
                frm,
                r.message.map((c) => c.name)
            );
        },
    });
}

// Batches the lookups (1-2 requests total) instead of firing one
// frappe.call per category like the original N+1 implementation.
function load_criteria_for_categories(frm, categories) {
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Performance Criteria",
            filters: { category: ["in", categories], is_active: 1 },
            fields: ["name", "category", "criteria_name", "default_weightage"],
            limit_page_length: 0,
        },
        callback: function (res) {
            if (!res.message || !res.message.length) {
                frappe.msgprint({
                    title: __("No Criteria"),
                    message: __("No criteria found for the selected categories."),
                    indicator: "orange",
                });
                return;
            }

            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Performance Category",
                    filters: { name: ["in", categories] },
                    fields: ["name", "weightage"],
                    limit_page_length: 0,
                },
                callback: function (catRes) {
                    const category_weightage_map = {};
                    (catRes.message || []).forEach((c) => {
                        category_weightage_map[c.name] = flt(c.weightage);
                    });

                    const existing = new Set(
                        (frm.doc.criteria_table || []).map((r) => `${r.category}::${r.criteria}`)
                    );

                    res.message.forEach((crit) => {
                        const key = `${crit.category}::${crit.name}`;
                        if (existing.has(key)) return;

                        const row = frm.add_child("criteria_table");
                        row.category = crit.category;
                        row.category_weightage = category_weightage_map[crit.category] || 0;
                        row.criteria = crit.name;
                        row.weightage = flt(crit.default_weightage);
                        row.rating = 0;
                        row.weighted_score = 0;
                    });

                    frm.refresh_field("criteria_table");
                    calculate_overall(frm);
                },
            });
        },
    });
}

function calculate_overall(frm) {
    const rows = frm.doc.criteria_table || [];

    if (!rows.length) {
        frm.set_value("total_weightage", 0);
        frm.set_value("total_score", 0);
        frm.set_value("overall_percentage", 0);
        frm.set_value("overall_rating", "");
        return;
    }

    const category_totals = {}; // { category: { score, category_weightage } }

    rows.forEach((row) => {
        if (!row.category) return;

        const weighted_score = round_number((flt(row.rating) * flt(row.weightage)) / 100, 2);
        row.weighted_score = weighted_score;

        if (!category_totals[row.category]) {
            category_totals[row.category] = { score: 0, category_weightage: flt(row.category_weightage) };
        }
        if (row.category_weightage) {
            category_totals[row.category].category_weightage = flt(row.category_weightage);
        }
        category_totals[row.category].score += weighted_score;
    });

    let final_score = 0;
    let total_category_weightage = 0;

    Object.keys(category_totals).forEach((category) => {
        const data = category_totals[category];
        const category_score = round_number(data.score, 2);
        const contribution = round_number((category_score * data.category_weightage) / 100, 2);

        final_score += contribution;
        total_category_weightage += data.category_weightage;

        rows.forEach((row) => {
            if (row.category === category) {
                row.final_contribution = contribution;
            }
        });
    });

    final_score = round_number(final_score, 2);
    total_category_weightage = round_number(total_category_weightage, 2);

    // Percentage relative to the max possible rating, not a hard-coded *10.
    const overall_percentage = round_number((final_score / MAX_RATING) * 100, 2);

    frm.set_value("total_weightage", total_category_weightage);
    frm.set_value("total_score", final_score);
    frm.set_value("overall_percentage", overall_percentage);
    frm.set_value("overall_rating", rating_label(overall_percentage));

    frm.refresh_field("criteria_table");
}

function rating_label(pct) {
    if (pct >= 90) return "Excellent";
    if (pct >= 75) return "Very Good";
    if (pct >= 60) return "Good";
    if (pct >= 50) return "Average";
    return "Needs Improvement";
}

function validate_weightages(frm) {
    const rows = frm.doc.criteria_table || [];

    if (!rows.length) {
        frappe.throw({
            title: __("Missing Criteria"),
            message: __("Please add at least one Performance Criteria."),
        });
    }

    const categories = {};

    rows.forEach((row) => {
        if (!row.category) {
            frappe.throw({
                title: __("Missing Category"),
                message: __("Please select Category for every criteria row."),
            });
        }
        if (!row.criteria) {
            frappe.throw({
                title: __("Missing Criteria"),
                message: __("Please select Criteria for every row."),
            });
        }

        if (!categories[row.category]) {
            categories[row.category] = {
                category_weightage: flt(row.category_weightage),
                criteria_weightage_total: 0,
            };
        }
        categories[row.category].criteria_weightage_total += flt(row.weightage);
    });

    const errors = [];
    let total_category_weightage = 0;

    Object.keys(categories).forEach((category) => {
        const data = categories[category];
        const criteria_total = round_number(data.criteria_weightage_total, 2);

        if (Math.abs(criteria_total - 100) > 0.01) {
            errors.push(
                `<b>${category}</b>: Criteria Weightage = <b>${criteria_total}%</b>. It must be exactly 100%.`
            );
        }
        total_category_weightage += data.category_weightage;
    });

    total_category_weightage = round_number(total_category_weightage, 2);
    if (Math.abs(total_category_weightage - 100) > 0.01) {
        errors.push(`<b>Total Category Weightage = ${total_category_weightage}%</b>. It must be exactly 100%.`);
    }

    if (errors.length) {
        frappe.throw({ title: __("Invalid Weightage"), message: errors.join("<br><br>") });
    }
}

function round_number(value, decimals) {
    const multiplier = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}