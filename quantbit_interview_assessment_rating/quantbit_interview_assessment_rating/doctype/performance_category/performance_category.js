// Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on("Performance Category", {
    after_save: async function(frm) {

        if (!frm.doc.weightage) {
            frappe.throw({
                title: __("Invalid Weightage"),
                message: __("Please enter Weightage.")
            });
        }

        if (frm.doc.weightage < 0 || frm.doc.weightage > 100) {
            frappe.throw({
                title: __("Invalid Weightage"),
                message: __("Weightage must be between 0 and 100.")
            });
        }

        // Get all other Performance Categories
        let categories = await frappe.db.get_list(
            "Performance Category",
            {
                fields: ["name", "weightage"],
                filters: {
                    name: ["!=", frm.doc.name]
                },
                limit_page_length: 0
            }
        );

        let total_weightage = flt(frm.doc.weightage);

        categories.forEach(row => {
            total_weightage += flt(row.weightage);
        });

        // Greater than 100
        if (total_weightage > 100) {
            frappe.throw({
                title: __("Invalid Category Weightage"),
                message: __(
                    "Total Performance Category Weightage is {0}%. It cannot be greater than 100%.",
                    [total_weightage]
                )
            });
        }

        // Less than 100
        if (total_weightage < 100) {
            frappe.throw({
                title: __("Invalid Category Weightage"),
                message: __(
                    "Total Performance Category Weightage is {0}%. It must be exactly 100%.",
                    [total_weightage]
                )
            });
        }

        // Exactly 100
        if (total_weightage === 100) {
            // No popup
        }
    }
});