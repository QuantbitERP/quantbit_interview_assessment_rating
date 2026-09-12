// Copyright (c) 2026, Quantbit Technologies Pvt Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on("Interview Assesment Form", {
    

    onload: function(frm) {
        if (frm.is_new()) {
            frm.set_value("date_of_interview", frappe.datetime.get_today());
        }
        frm.interview_round_list = [];
        frm.available_round_data = null;
        set_interview_round_query(frm);
    },

    refresh: function(frm) {
        if (!frm.doc.date) {
            frm.set_value("date", frappe.datetime.now_datetime());
        }
        set_interview_round_query(frm);

        if (frm.is_new() && frm.doc.applicent && frm.doc.posting_applyed_for) {
            load_next_available_interview_round(frm);
        }

        calculate_overall_assessment(frm);
    },

    applicent: function(frm) {
        frm.set_value("interview_round_type", "");
        frm.clear_table("rating_table");
        frm.refresh_field("rating_table");
        frm.interview_round_list = [];
        frm.available_round_data = null;
        set_interview_round_query(frm);

        if (!frm.doc.applicent) {
            frm.set_value("posting_applyed_for", "");
            return;
        }

        // Fetch job_title directly instead of relying on fetch_from timing.
        frappe.db.get_value("Job Applicant", frm.doc.applicent, "job_title").then(function(r) {
            let job_opening = r.message && r.message.job_title;
            if (job_opening) {
                // Setting the value fires posting_applyed_for's own handler below,
                // which is the single path that loads rounds — no timers, no double calls.
                frm.set_value("posting_applyed_for", job_opening);
            } else {
                frm.set_value("posting_applyed_for", "");
                frappe.msgprint(__("Selected applicant has no linked Job Opening (job_title) set."));
            }
        });
    },

    posting_applyed_for: function(frm) {
        frm.set_value("interview_round_type", "");
        frm.clear_table("rating_table");
        frm.refresh_field("rating_table");
        frm.interview_round_list = [];
        frm.available_round_data = null;
        set_interview_round_query(frm);

        if (frm.doc.applicent && frm.doc.posting_applyed_for) {
            load_next_available_interview_round(frm);
        }
    },

    interview_round_type: function(frm) {
        if (!frm.doc.interview_round_type) {
            frm.clear_table("rating_table");
            frm.refresh_field("rating_table");
            calculate_overall_assessment(frm);
            return;
        }
        load_skills_for_selected_round(frm);
    }
});


function load_next_available_interview_round(frm) {
    let applicant = frm.doc.applicent;
    let job_opening = frm.doc.posting_applyed_for;

    if (!applicant || !job_opening) {
        frm.interview_round_list = [];
        set_interview_round_query(frm);
        return;
    }

    if (frm._loading_rounds) return; // guard against duplicate parallel calls
    frm._loading_rounds = true;

    frappe.call({
        method: "frappe.client.get",
        args: { doctype: "Job Opening", name: job_opening },
        callback: function(job_response) {
            frm._loading_rounds = false;

            if (!job_response.message) {
                frm.interview_round_list = [];
                set_interview_round_query(frm);
                frappe.msgprint(__("Job Opening '{0}' not found", [job_opening]));
                return;
            }

            let rounds = (job_response.message.custom_job_interview_round || [])
                .filter(row => cint(row.active) === 1 && row.interview_round)
                .sort((a, b) => cint(a.idx) - cint(b.idx));

            if (!rounds.length) {
                frm.interview_round_list = [];
                set_interview_round_query(frm);
                frappe.msgprint(__("No active interview rounds found in Job Opening"));
                return;
            }

            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Interview Assesment Form",
                    filters: { applicent: applicant },
                    fields: ["name", "interview_round_type", "recommendation", "docstatus", "creation"],
                    order_by: "creation asc",
                    limit_page_length: 1000
                },
                callback: function(assessment_response) {
                    let previous_assessments = (assessment_response.message || [])
                        .filter(row => row.name !== frm.doc.name);

                    let completed_rounds = {};
                    previous_assessments.forEach(row => {
                        if (row.interview_round_type) completed_rounds[row.interview_round_type] = row;
                    });

                    let next_round = null;

                    if (!previous_assessments.length) {
                        next_round = rounds[0];
                    } else {
                        for (let i = 0; i < rounds.length; i++) {
                            let current_round = rounds[i];
                            let previous_record = completed_rounds[current_round.interview_round];

                            if (!previous_record) {
                                if (i === 0) {
                                    next_round = current_round;
                                    break;
                                }
                                let previous_round = rounds[i - 1];
                                let previous_round_record = completed_rounds[previous_round.interview_round];
                                if (previous_round_record && is_recommended(previous_round_record.recommendation)) {
                                    next_round = current_round;
                                }
                                break;
                            }
                        }
                    }

                    frm.interview_round_list = [];
                    frm.available_round_data = null;

                    if (next_round) {
                        frm.interview_round_list = [next_round.interview_round];
                        frm.available_round_data = next_round;
                        set_interview_round_query(frm);
                        frm.refresh_field("interview_round_type");

                        if (frm.doc.interview_round_type !== next_round.interview_round) {
                            frm.set_value("interview_round_type", next_round.interview_round);
                        }
                    } else {
                        set_interview_round_query(frm);
                        frm.refresh_field("interview_round_type");
                        if (previous_assessments.length) {
                            frappe.msgprint(__("No next interview round is available. This person is not recommended for the next round."));
                        }
                    }
                }
            });
        }
    });
}


function is_recommended(value) {
    if (!value) return false;
    value = String(value).trim().toLowerCase();
    return ["recommended", "recommend", "select", "selected", "proceed", "approved", "yes"].includes(value);
}


function set_interview_round_query(frm) {
    frm.set_query("interview_round_type", function() {
        let rounds = frm.interview_round_list || [];
        if (!rounds.length) {
            return { filters: { name: ["in", [""]] } };
        }
        return { filters: { name: ["in", rounds] } };
    });
}


function get_round_weightage_from_job_opening(frm, selected_round) {
    return new Promise(function(resolve) {
        if (!selected_round) { resolve(0); return; }

        if (frm.available_round_data && frm.available_round_data.interview_round === selected_round) {
            resolve(flt(frm.available_round_data.weitage));
            return;
        }

        let job_opening = frm.doc.posting_applyed_for;
        if (!job_opening) { resolve(0); return; }

        frappe.call({
            method: "frappe.client.get",
            args: { doctype: "Job Opening", name: job_opening },
            callback: function(r) {
                let weightage = 0;
                if (r.message && r.message.custom_job_interview_round) {
                    let round = r.message.custom_job_interview_round.find(row => row.interview_round === selected_round);
                    if (round) weightage = flt(round.weitage);
                }
                resolve(weightage);
            }
        });
    });
}


function load_skills_for_selected_round(frm) {
    let selected_round = frm.doc.interview_round_type;
    if (!selected_round) {
        frm.clear_table("rating_table");
        frm.refresh_field("rating_table");
        calculate_overall_assessment(frm);
        return;
    }

    frm.clear_table("rating_table");

    get_round_weightage_from_job_opening(frm, selected_round).then(function(round_weightage) {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Skills Form",
                filters: { interview_round: selected_round },
                fields: ["name", "interview_round", "weitage"],
                limit_page_length: 1000
            },
            callback: function(r) {
                if (!r.message || !r.message.length) {
                    frm.refresh_field("rating_table");
                    calculate_overall_assessment(frm);
                    frappe.msgprint(__("No Skills found for selected Interview Round"));
                    return;
                }

                r.message.forEach(function(skill) {
                    let row = frm.add_child("rating_table");
                    row.interview_round = skill.interview_round;
                    row.skills_name = skill.name;
                    row.weightage = flt(skill.weitage);
                    row.interview_type_weightage = flt(round_weightage);
                    row.rating = 0;
                    row.weighted_score = 0;
                });

                frm.refresh_field("rating_table");
                calculate_overall_assessment(frm);
            }
        });
    });
}


frappe.ui.form.on("Interview Assesmant Rating Table", {
    rating: (frm, cdt, cdn) => calculate_row_weighted_score(frm, locals[cdt][cdn]),
    weightage: (frm, cdt, cdn) => calculate_row_weighted_score(frm, locals[cdt][cdn]),
    interview_type_weightage: (frm, cdt, cdn) => calculate_row_weighted_score(frm, locals[cdt][cdn])
});


function calculate_row_weighted_score(frm, row) {
    let rating = flt(row.rating);
    let skill_weightage = flt(row.weightage);

    if (rating < 0) { rating = 0; row.rating = 0; }
    if (rating > 5) {
        frappe.msgprint(__("Rating cannot be greater than 5"));
        rating = 5;
        row.rating = 5;
    }

    row.weighted_score = round_interview_number(rating * skill_weightage / 100, 2);
    frm.refresh_field("rating_table");
    calculate_overall_assessment(frm);
}


function calculate_overall_assessment(frm) {
    let rows = frm.doc.rating_table || [];

    if (!rows.length) {
        frm.set_value("total_weightage", 0);
        frm.set_value("total_score", 0);
        frm.set_value("overall_percentage", 0);
        return;
    }

    let interview_round_totals = {};

    rows.forEach(function(row) {
        if (!row.interview_round) return;

        let rating = flt(row.rating);
        if (rating < 0) rating = 0;
        if (rating > 5) rating = 5;

        let skill_score = round_interview_number(rating * flt(row.weightage) / 100, 2);
        row.weighted_score = skill_score;

        if (!interview_round_totals[row.interview_round]) {
            interview_round_totals[row.interview_round] = {
                score: 0,
                interview_weightage: flt(row.interview_type_weightage)
            };
        }
        interview_round_totals[row.interview_round].score += skill_score;
    });

    let final_score = 0;
    let total_interview_weightage = 0;

    Object.keys(interview_round_totals).forEach(function(round) {
        let data = interview_round_totals[round];
        let round_score = round_interview_number(data.score, 2);
        let contribution = round_interview_number(round_score * flt(data.interview_weightage) / 100, 2);
        final_score += contribution;
        total_interview_weightage += flt(data.interview_weightage);
    });

    final_score = round_interview_number(final_score, 2);
    total_interview_weightage = round_interview_number(total_interview_weightage, 2);

    let overall_percentage = Math.min(round_interview_number(final_score * 20, 2), 100);

    frm.set_value("total_weightage", total_interview_weightage);
    frm.set_value("total_score", final_score);
    frm.set_value("overall_percentage", overall_percentage);
    frm.refresh_field("rating_table");
}


function round_interview_number(value, decimals) {
    let multiplier = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}