export interface RiskAnalysis {
  riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  riskLevelColor: 'green' | 'yellow' | 'orange' | 'red';
  riskAssessment: string;
  episRecommended: string[];
  epcsRecommended: string[];
  controlMeasures: string[];
  applicableNRs: string[];
  aprChecklist: {
    item: string;
    verified: boolean;
  }[];
}

export interface HazardReport {
  id: string;
  activityName: string;
  location: string;
  department: string;
  description: string;
  immediateAction: string;
  reportedBy: string;
  date: string;
  time: string;
  status: 'Aberto' | 'Resolvido';
  analysis?: RiskAnalysis;
}
