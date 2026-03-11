export const DEPARTMENTS = [
  "B.Sc. IT",
  "B.M.S",
  "B.A.F",
  "B.B.I",
  "B.A.M.M.C",
] as const;

export const CLASSES_BY_DEPT: Record<string, string[]> = {
  "B.Sc. IT": ["FY", "SY", "TY"],
  "B.M.S": ["FY", "SY", "TY"],
  "B.A.F": ["FY", "SY", "TY"],
  "B.B.I": ["FY", "SY", "TY"],
  "B.A.M.M.C": ["FY", "SY", "TY"],
};

export const SUBJECTS_BY_DEPT_AND_CLASS: Record<
  string,
  Record<string, string[]>
> = {
  "B.Sc. IT": {
    FY: [
      "Programming in C",
      "Digital Electronics",
      "Mathematics",
      "Communication Skills",
      "Database Management System",
    ],
    SY: [
      "Object Oriented Programming (Java)",
      "Data Structures",
      "Operating Systems",
      "Computer Networks",
      "Web Development",
    ],
    TY: [
      "Python Programming",
      "Software Engineering",
      "Cloud Computing",
      "Cyber Security",
      "Project Work",
    ],
  },

  "B.M.S": {
    FY: [
      "Principles of Management",
      "Business Communication",
      "Foundation Course",
      "Business Economics",
      "Financial Accounting",
    ],
    SY: [
      "Business Law",
      "Marketing Management",
      "Human Resource Management",
      "Cost Accounting",
      "Organizational Behaviour",
    ],
    TY: [
      "Financial Management",
      "Operations Management",
      "Strategic Management",
      "International Business",
      "Entrepreneurship",
    ],
  },

  "B.A.F": {
    FY: [
      "Financial Accounting",
      "Business Law",
      "Economics",
      "Foundation Course",
      "Business Communication",
    ],
    SY: [
      "Cost Accounting",
      "Auditing",
      "Taxation",
      "Business Mathematics",
      "Financial Management",
    ],
    TY: [
      "Investment Analysis",
      "Direct & Indirect Taxes",
      "Advanced Auditing",
      "Financial Services",
      "Corporate Accounting",
    ],
  },

  "B.B.I": {
    FY: [
      "Principles of Banking",
      "Financial Accounting",
      "Business Law",
      "Business Communication",
      "Foundation Course",
    ],
    SY: [
      "Banking Operations",
      "Risk Management",
      "Financial Services",
      "Cost Accounting",
      "Organizational Behaviour",
    ],
    TY: [
      "Investment Banking",
      "Insurance Management",
      "International Banking",
      "Strategic Management",
      "Financial Markets",
    ],
  },

  "B.A.M.M.C": {
    FY: [
      "Introduction to Mass Communication",
      "Media Studies",
      "Journalism",
      "Communication Skills",
      "Foundation Course",
    ],
    SY: [
      "Advertising",
      "Public Relations",
      "Digital Media",
      "Content Writing",
      "Photography",
    ],
    TY: [
      "Media Ethics",
      "Film Studies",
      "Communication Theory",
      "Broadcast Journalism",
      "Media Research",
    ],
  },
};
