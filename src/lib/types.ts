export type PlanStatus =
  | "Plan draft"
  | "Policy draft"
  | "Submitted"
  | "Approved"
  | "Live";

export type WorkLocation =
  | "Menlo Park"
  | "Burlingame"
  | "San Francisco"
  | "Sunnyvale"
  | "Fremont"
  | "New York"
  | "Austin"
  | "Singapore"
  | "Tokyo";

export type AllocationArea =
  | "Enterprise Products"
  | "Enterprise Solutions"
  | "Enterprise Ticketing"
  | "Enterprise Analytics";

export interface EmployeeAssessment {
  fullTime: number;
  partTime: number;
  interns: number;
  contingent: number;
  other: number;
}

export interface WorkspaceAssessment {
  assignedDesks: number;
  availableDesks: number;
  dropIn: number;
  reservable: number;
}

export interface DeskPolicy {
  assignInboundEmbeds: boolean | null;
  outboundSeatedWithPillars: boolean | null;
  assignPlannedGrowth: boolean | null;
  specialArrangementInterns: boolean | null;
}

export interface IPTPolicy {
  minimumWorkDays: number;
  allowanceNonAssigned: number;
  allowedStatuses: {
    drive: boolean;
    fly: boolean;
    workFromNonMetaBusiness: boolean;
    unforeseenCircumstances: boolean;
    ptoChoiceSick: boolean;
    globalTravelDays: boolean;
  };
}

export interface PlanSnapshot {
  month: string;
  employees: number;
  workspaces: number;
}

export interface Plan {
  id: string;
  workLocation: WorkLocation;
  allocationArea: AllocationArea;
  status: PlanStatus;
  fiscalYear: string;
  quarter: string;
  updatedAt: string;
  employeeAssessment: EmployeeAssessment;
  workspaceAssessment: WorkspaceAssessment;
  deskPolicy: DeskPolicy;
  iptPolicy: IPTPolicy;
  // Derived stats shown on the landing card
  employeesWithDesks: number;
  employeesWithoutDesks: number;
  totalAllocatedSpaces: number;
  futureHeadcount: number;
  history: PlanSnapshot[];
}
