
/**
 * Marital Status Options
 * @type {Array<{value: string, label: string}>}
 */

export const maritalStatuses = [
    { value: "never_married", label: "Never Married" },
    { value: "widowed", label: "Widowed" },
    { value: "divorced", label: "Divorced" },
    { value: "awaiting_divorce", label: "Awaiting Divorce" },
];

/**
 * Height Options (in feet and inches, and centimeters)
 * Provides a common range. You can extend or adjust this as needed.
 * @type {Array<{value: string, label: string}>}
 */
export const heightOptions = [
    // Feet and Inches
    { value: "4_0", label: "4' 0\" (122 cm)", cmValue: 122 },
    { value: "4_1", label: "4' 1\" (124 cm)", cmValue: 124 },
    { value: "4_2", label: "4' 2\" (127 cm)", cmValue: 127 },
    { value: "4_3", label: "4' 3\" (130 cm)", cmValue: 130 },
    { value: "4_4", label: "4' 4\" (132 cm)", cmValue: 132 },
    { value: "4_5", label: "4' 5\" (135 cm)", cmValue: 135 },
    { value: "4_6", label: "4' 6\" (137 cm)", cmValue: 137 },
    { value: "4_7", label: "4' 7\" (140 cm)", cmValue: 140 },
    { value: "4_8", label: "4' 8\" (142 cm)", cmValue: 142 },
    { value: "4_9", label: "4' 9\" (145 cm)", cmValue: 145 },
    { value: "4_10", label: "4' 10\" (147 cm)", cmValue: 147 },
    { value: "4_11", label: "4' 11\" (150 cm)", cmValue: 150 },
    { value: "5_0", label: "5' 0\" (152 cm)", cmValue: 152 },
    { value: "5_1", label: "5' 1\" (155 cm)", cmValue: 155 },
    { value: "5_2", label: "5' 2\" (157 cm)", cmValue: 157 },
    { value: "5_3", label: "5' 3\" (160 cm)", cmValue: 160 },
    { value: "5_4", label: "5' 4\" (163 cm)", cmValue: 163 },
    { value: "5_5", label: "5' 5\" (165 cm)", cmValue: 165 },
    { value: "5_6", label: "5' 6\" (168 cm)", cmValue: 168 },
    { value: "5_7", label: "5' 7\" (170 cm)", cmValue: 170 },
    { value: "5_8", label: "5' 8\" (173 cm)", cmValue: 173 },
    { value: "5_9", label: "5' 9\" (175 cm)", cmValue: 175 },
    { value: "5_10", label: "5' 10\" (178 cm)", cmValue: 178 },
    { value: "5_11", label: "5' 11\" (180 cm)", cmValue: 180 },
    { value: "6_0", label: "6' 0\" (183 cm)", cmValue: 183 },
    { value: "6_1", label: "6' 1\" (185 cm)", cmValue: 185 },
    { value: "6_2", label: "6' 2\" (188 cm)", cmValue: 188 },
    { value: "6_3", label: "6' 3\" (191 cm)", cmValue: 191 },
    { value: "6_4", label: "6' 4\" (193 cm)", cmValue: 193 },
    { value: "6_5", label: "6' 5\" (196 cm)", cmValue: 196 },
    { value: "6_6", label: "6' 6\" (198 cm)", cmValue: 198 },
    { value: "6_7", label: "6' 7\" (201 cm)", cmValue: 201 },
    { value: "6_8", label: "6' 8\" (203 cm)", cmValue: 203 },
    { value: "6_9", label: "6' 9\" (206 cm)", cmValue: 206 },
    { value: "6_10", label: "6' 10\" (208 cm)", cmValue: 208 },
    { value: "6_11", label: "6' 11\" (211 cm)", cmValue: 211 },
    { value: "7_0", label: "7' 0\" (213 cm)", cmValue: 213 },
];

/**
 * Family Status Options
 * @type {Array<{value: string, label: string}>}
 */
export const familyStatuses = [
    { value: "lower_class", label: "Middle Class" },
    { value: "middle_class", label: " Upper Middle Class" },
    { value: "high_class", label: "High Class" },
    { value: "rich", label: "Rich" },
];

/**
 * Family Type Options
 * @type {Array<{value: string, label: string}>}
 */
export const familyTypes = [
    { value: "joint", label: "Joint Family" },
    { value: "nuclear", label: "Nuclear Family" },
];

/**
 * Disability Options
 * @type {Array<{value: string, label: string}>}
 */
export const disabilityOptions = [
    { value: "none", label: "None" },
    { value: "vision", label: "Vision" },
    { value: "hearing", label: "Hearing" },
    { value: "physical-motor", label: "Physical/Motor" },
    { value: "neurodivergent", label: "Neurodivergent/ADHD" }
];
