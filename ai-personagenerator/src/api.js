// Mock API call to simulate AWS Bedrock response
export const generatePersonas = async (companyData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            name: "Alex Rivera",
            age: 35,
            gender: "Male",
            location: "San Francisco, CA",
            jobTitle: "Product Manager",
            interests: ["Tech", "Startups", "Productivity"],
            challenges: ["Time Management", "Scaling Products"]
          },
          {
            name: "Sarah Kim",
            age: 28,
            gender: "Female",
            location: "New York, NY",
            jobTitle: "Marketing Lead",
            interests: ["Social Media", "Design", "Brand Strategy"],
            challenges: ["Audience Segmentation", "Ad Fatigue"]
          }
        ]);
      }, 2000);
    });
  };
  