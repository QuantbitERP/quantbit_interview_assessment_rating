// Copyright (c) 2026, Quantbit Technologe PVT LTD and contributors
// For license information, please see license.txt

frappe.query_reports["Intern Performance Summary"] = {
	filters: [
		{
			"fieldname": "department",
			"label": __("Department"),
			"fieldtype": "Link",
			"options": "Department",
			"width": 150
		},
		{
			"fieldname": "mentor",
			"label": __("Mentor"),
			"fieldtype": "Link",
			"options": "Employee",
			"width": 100
		},
		{
			"fieldname": "overall_rating",
			"label": __("Overall Rating"),
			"fieldtype": "Select",
			"options": "\nNeeds Improvement\nExcellent\nVery Good\nGood\nAverage",
			"width": 200
		},
		{
			"fieldname": "recommendation",
			"label": __("Recommendation"),
			"fieldtype": "Select",
			"options": "\nContinue Internship\nExtend Internship\nConsider for Full Time\nNot Recommended",
			"width": 200
		},
		// {
		// 	"fieldname": "evaluation_from_date",
		// 	"label": __("Evaluation From Date"),
		// 	"fieldtype": "Date",
		// 	"width": 100
		// },
		// {
		// 	"fieldname": "evaluation_to_date",
		// 	"label": __("Evaluation To Date"),
		// 	"fieldtype": "Date",
		// 	"width": 100
		// },
		{
    		"fieldname": "intern",
    		"label": __("Intern"),
    		"fieldtype": "Link",
    		"options": "User",
    		"width": 300,
    		// "get_query": function() {
    		//     return {
    		//         filters: {
    		//             enabled: 1
    		//         }
    		//     };
    		// }
		}
	]
};
