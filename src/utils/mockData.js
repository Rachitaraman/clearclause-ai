export const mockData = {
  summary: {
    title: "Software License Agreement Analysis",
    totalClauses: 24,
    riskScore: 7.2,
    keyFindings: [
      "Broad termination rights for the company",
      "Limited liability protections",
      "Automatic renewal clause present",
      "Data retention period unclear"
    ]
  },
  clauses: [
    {
      id: 1,
      title: "Termination Rights",
      text: "Company may terminate this agreement at any time with or without cause by providing thirty (30) days written notice.",
      riskLevel: "high",
      explanation: "This gives the company significant power to end the agreement without justification."
    },
    {
      id: 2,
      title: "Liability Limitation",
      text: "In no event shall Company's liability exceed the amount paid by Customer in the twelve months preceding the claim.",
      riskLevel: "medium",
      explanation: "Limits your ability to recover damages beyond recent payments."
    },
    {
      id: 3,
      title: "Data Usage",
      text: "Company may use Customer data for service improvement and analytics purposes.",
      riskLevel: "medium",
      explanation: "Your data may be used beyond the core service provision."
    },
    {
      id: 4,
      title: "Automatic Renewal",
      text: "This agreement automatically renews for successive one-year terms unless terminated.",
      riskLevel: "low",
      explanation: "Standard renewal clause, but requires active cancellation."
    }
  ],
  risks: [
    { level: "high", count: 3, color: "#ef4444" },
    { level: "medium", count: 8, color: "#f59e0b" },
    { level: "low", count: 13, color: "#10b981" }
  ]
}