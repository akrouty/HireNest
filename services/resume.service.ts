export type ResumeSuggestionType = "success" | "warning" | "error" | "info";

export type ResumeSuggestion = {
  type: ResumeSuggestionType;
  title: string;
  description: string;
};

export type ResumeAnalysis = {
  score: number;
  label: string;
  sections: {
    content: number;
    format: number;
    ats: number;
  };
  suggestions: ResumeSuggestion[];
};

export async function analyzeResume(_file: File): Promise<ResumeAnalysis> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    score: 85,
    label: "Very Good",
    sections: {
      content: 90,
      format: 82,
      ats: 83,
    },
    suggestions: [
      {
        type: "success",
        title: "Strong Action Verbs",
        description:
          "Your resume uses impactful action verbs like 'Led', 'Developed', and 'Implemented'.",
      },
      {
        type: "warning",
        title: "Missing Keywords",
        description:
          "Consider adding industry-specific keywords like 'Agile', 'Scrum', and 'CI/CD' to improve ATS compatibility.",
      },
      {
        type: "error",
        title: "Formatting Issues",
        description:
          "Inconsistent date formatting detected. Use a uniform format throughout.",
      },
      {
        type: "info",
        title: "Quantify Achievements",
        description:
          "Add specific metrics to your accomplishments, such as impact percentages or project scale.",
      },
    ],
  };
}
