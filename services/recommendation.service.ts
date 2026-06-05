export type CareerRecommendation = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
};

export async function getCareerRecommendations(): Promise<
  CareerRecommendation[]
> {
  return [
    {
      title: "Develop Leadership Skills",
      description:
        "Take on team lead responsibilities or mentor junior developers to strengthen your leadership profile.",
      priority: "High",
    },
    {
      title: "Enhance Communication",
      description:
        "Improve presentation and stakeholder management through workshops or public speaking opportunities.",
      priority: "Medium",
    },
    {
      title: "Expand Cloud Certifications",
      description:
        "Pursue AWS or Azure certifications to validate your cloud expertise and increase marketability.",
      priority: "High",
    },
  ];
}
