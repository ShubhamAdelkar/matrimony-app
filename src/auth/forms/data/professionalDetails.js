/**
 * @description Comprehensive options for the "Highest Education" dropdown.
 */
export const highestEducationOptions = [
    // Doctoral & Post-Graduate
    { value: 'phd', label: 'Ph.D / Doctorate' },
    { value: 'post_graduate_diploma', label: 'Post Graduate Diploma (PGD)' },
    { value: 'masters_eng_tech', label: 'Masters in Engineering / Technology (M.E. / M.Tech / M.S.)' },
    { value: 'masters_medical', label: 'Masters in Medical (M.D. / M.S. / M.Ch.)' },
    { value: 'masters_arts_science_commerce', label: 'Masters in Arts / Science / Commerce (M.A. / M.Sc. / M.Com.)' },
    { value: 'masters_management', label: 'MBA / PGDM' },
    { value: 'masters_law', label: 'Masters in Law (LL.M.)' },
    { value: 'mca', label: 'MCA (Masters in Computer Applications)' },
    { value: 'other_masters', label: 'Other Masters Degree' },

    // Bachelor's Degrees
    { value: 'bachelors_eng_tech', label: 'Bachelors in Engineering / Technology (B.E. / B.Tech)' },
    { value: 'bachelors_medical', label: 'Bachelors in Medical (M.B.B.S. / B.D.S. / B.A.M.S. / B.H.M.S.)' },
    { value: 'bachelors_nursing', label: 'Bachelors in Nursing (B.Sc. Nursing)' },
    { value: 'bachelors_pharmacy', label: 'Bachelors in Pharmacy (B.Pharm)' },
    { value: 'bachelors_arts_science_commerce', label: 'Bachelors in Arts / Science / Commerce (B.A. / B.Sc. / B.Com.)' },
    { value: 'bca', label: 'BCA (Bachelors in Computer Applications)' },
    { value: 'bachelors_law', label: 'Bachelors in Law (LL.B.)' },
    { value: 'bachelors_architecture', label: 'Bachelors in Architecture (B.Arch)' },
    { value: 'bachelors_education', label: 'Bachelors in Education (B.Ed.)' },
    { value: 'bachelors_other', label: 'Other Bachelors Degree' },

    // Diplomas & Vocational
    { value: 'diploma', label: 'Diploma in Engineering (Com. / Mech. / Civil / Other)' },
    { value: 'iti_vocational', label: 'ITI / Vocational Training' },

    // School Level
    { value: 'high_school_12th', label: 'Higher Secondary (12th Pass)' },
    { value: 'secondary_10th', label: 'Secondary School (10th Pass)' },
    { value: 'less_than_10th', label: 'Less than 10th Pass' },

    // Other
    { value: 'other', label: 'Other' },
];

/**
 * @description Comprehensive options for the "Employed In" dropdown.
 */
export const employmentOptions = [
    { value: 'government_psu', label: 'Government / PSU' },
    { value: 'private_mnc', label: 'Private Company (MNC)' },
    { value: 'private_startup', label: 'Private Company (Startup)' },
    { value: 'private_indian', label: 'Private Company (Indian)' },
    { value: 'business_self_employed', label: 'Business / Self-Employed' },
    { value: 'defence_civil_services', label: 'Defence / Civil Services' },
    { value: 'not_employed', label: 'Not Currently Employed' },
    { value: 'student', label: 'Student' },
];

/**
 * @description Comprehensive options for the "Occupation" dropdown.
 */
export const occupationOptions = [
    // IT & Software
    { value: 'software_professional', label: 'Software Engineer / IT' },
    { value: 'it_consultant', label: 'IT Consultant' },
    // Engineering (Non-IT)
    { value: 'engineer_civil', label: 'Civil Engineer' },
    { value: 'engineer_mechanical', label: 'Mechanical Engineer' },

    // Medical & Healthcare
    { value: 'doctor_medical', label: 'Doctor / Physician' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'medical_technician', label: 'Medical Technician / Lab Assistant' },


    // Education & Academia
    { value: 'teacher_professor', label: 'Teacher / Professor / Academic' },
    { value: 'lecturer', label: 'Lecturer' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'librarian', label: 'Librarian' },

    // Finance & Business
    { value: 'accountant_finance', label: 'Accountant / Finance Professional' },
    { value: 'banker', label: 'Banker' },
    { value: 'financial_analyst', label: 'Financial Analyst / Advisor' },
    { value: 'business_owner', label: 'Business Owner / Entrepreneur' },
    { value: 'marketing_professional', label: 'Marketing Professional' },
    { value: 'sales_professional', label: 'Sales Professional' },
    { value: 'manager', label: 'Manager / Supervisor' },

    // Government & Public Service
    { value: 'government_employee_state', label: 'Government Employee (State)' },
    { value: 'government_employee_central', label: 'Government Employee (Central)' },
    { value: 'police_defence', label: 'Police / Defence Services' },
    { value: 'civil_services', label: 'Civil Services (IAS/IPS etc.)' },

    // Arts, Media & Design
    { value: 'artist_creative', label: 'Artist / Creative Professional' },
    { value: 'designer', label: 'Designer (Graphic/Fashion etc.)' },
    { value: 'journalist_writer', label: 'Journalist / Writer' },
    { value: 'media_professional', label: 'Media / Entertainment Professional' },
    { value: 'photographer_videographer', label: 'Photographer / Videographer' },

    // Legal
    { value: 'lawyer_legal', label: 'Lawyer / Legal Professional' },
    { value: 'judge', label: 'Judge' },

    // Hospitality & Tourism (Relevant to Goa)
    { value: 'hotel_management', label: 'Hotel Management / Hospitality' },
    { value: 'travel_tourism', label: 'Travel & Tourism Professional' },
    { value: 'chef_cook', label: 'Chef / Cook' },

    // Agriculture & Allied
    { value: 'farmer_agriculturist', label: 'Farmer / Agriculturist' },
    { value: 'dairy_farmer', label: 'Dairy Farmer' },

    // Other Categories
    { value: 'tradesperson', label: 'Tradesperson (Electrician, Plumber etc.)' },
    { value: 'skilled_worker', label: 'Skilled Worker' },
    { value: 'homemaker', label: 'Homemaker' },
    { value: 'retired', label: 'Retired' },
    { value: 'student', label: 'Student' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'other', label: 'Other' },
];

/**
 * @description Comprehensive options for the "Annual Income" dropdown (in INR).
 */
export const annualIncomeOptions = [
    { value: '0-50k', label: 'Upto ₹50,000' },
    { value: '50k-1L', label: '₹50,000 to ₹1 Lakh' },
    { value: '1L-2L', label: '₹1 Lakh to ₹2 Lakhs' },
    { value: '2L-4L', label: '₹2 Lakhs to ₹4 Lakhs' },
    { value: '4L-7L', label: '₹4 Lakhs to ₹7 Lakhs' },
    { value: '7L-10L', label: '₹7 Lakhs to ₹10 Lakhs' },
    { value: '10L-15L', label: '₹10 Lakhs to ₹15 Lakhs' },
    { value: '15L-25L', label: '₹15 Lakhs to ₹25 Lakhs' },
    { value: '25L-50L', label: '₹25 Lakhs to ₹50 Lakhs' },
    { value: '50L-1Cr', label: '₹50 Lakhs to ₹1 Crore' },
    { value: 'not_applicable', label: 'Not Applicable / Do not wish to specify' },
];


