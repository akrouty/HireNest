export type JobMatch = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  posted: string;
  matchScore: number;
  salary: string;
  description: string;
  skills: string[];
  missingSkills: string[];
};

export async function getJobMatches(): Promise<JobMatch[]> {
  return [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechCorp Africa",
      location: "Lagos, Nigeria",
      type: "Full-time",
      posted: "2 days ago",
      matchScore: 95,
      salary: "$60k - $80k",
      description:
        "Looking for an experienced software engineer to lead our development team. You'll be architecting scalable systems and mentoring junior developers in a fast-paced environment.",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      missingSkills: ["Kubernetes", "System Design"],
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Innovation Hub",
      location: "Cairo, Egypt",
      type: "Full-time",
      posted: "1 week ago",
      matchScore: 88,
      salary: "$50k - $70k",
      description: "Join our team to drive product strategy and execution.",
      skills: ["Product Strategy", "Agile", "User Research", "Analytics"],
      missingSkills: ["Roadmap Planning"],
    },
    {
      id: 3,
      title: "UX/UI Designer",
      company: "Design Studio ME",
      location: "Dubai, UAE",
      type: "Contract",
      posted: "3 days ago",
      matchScore: 82,
      salary: "$45k - $65k",
      description:
        "Create beautiful and intuitive user experiences for our clients.",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      missingSkills: ["Motion Design"],
    },
    {
      id: 4,
      title: "Data Scientist",
      company: "Analytics Pro",
      location: "Nairobi, Kenya",
      type: "Full-time",
      posted: "5 days ago",
      matchScore: 79,
      salary: "$55k - $75k",
      description: "Analyze complex data sets and build predictive models.",
      skills: ["Python", "Machine Learning", "SQL", "Statistics"],
      missingSkills: ["MLOps", "Data Storytelling"],
    },
  ];
}
