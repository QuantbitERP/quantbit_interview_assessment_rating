// Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
// For license information, please see license.txt
frappe.ui.form.on("Performance Criteria", {
    refresh(frm) {
        show_remaining(frm);
    },

    category(frm) {
        show_remaining(frm);
    },

    is_active(frm) {
        show_remaining(frm);
    },

    default_weightage(frm) {
        show_remaining(frm);
    },

    async validate(frm) {
        if (!frm.doc.is_active || !frm.doc.category) return;

        const existing_total = await get_existing_total(frm);
        const new_total = existing_total + flt(frm.doc.default_weightage);

        if (new_total > 100) {
            const remaining = Math.max(0, 100 - existing_total);
            frappe.validated = false;
            frappe.throw(
                __("Total weightage of active criteria in category <b>{0}</b> cannot exceed 100%.<br>Already used: {1}%. Remaining: {2}%.", [
                    frm.doc.category,
                    existing_total,
                    remaining,
                ])
            );
        }
    },
});

async function get_existing_total(frm) {
    const filters = {
        category: frm.doc.category,
        is_active: 1,
    };

    if (!frm.is_new()) {
        filters.name = ["!=", frm.doc.name];
    }

    const rows = await frappe.db.get_list("Performance Criteria", {
        filters: filters,
        fields: ["default_weightage"],
        limit_page_length: 0,
    });

    return rows.reduce((sum, r) => sum + flt(r.default_weightage), 0);
}

async function show_remaining(frm) {
    frm.dashboard.clear_headline();

    if (!frm.doc.category || !frm.doc.is_active) return;

    const existing_total = await get_existing_total(frm);
    const new_total = existing_total + flt(frm.doc.default_weightage);
    const color = new_total > 100 ? "red" : new_total === 100 ? "green" : "orange";

    frm.dashboard.set_headline_alert(
        __("Category {0}: active total = {1}% (others: {2}%, remaining: {3}%)", [
            frm.doc.category,
            new_total,
            existing_total,
            Math.max(0, 100 - new_total),
        ]),
        color
    );
}
