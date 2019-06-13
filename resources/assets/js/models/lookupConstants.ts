export enum ReviewStatusId {
  ScreenedOut = 1,
  StillThinking = 2,
  StillIn = 3,
}

export type ReviewStatusName = "screened_out" | "still_thinking" | "still_in";

export enum CriteriaTypeId {
  Essential = 1,
  Asset = 2,
}

export enum SkillTypeId {
  Soft = 1,
  Hard = 2,
}

export enum SkillLevelId {
  Basic = 1,
  Intermediate = 2,
  Advanced = 3,
  Expert = 4,
}

export enum AssessmentTypeId {
  NarrativeAssessment = 1,
  ApplicationScreeningQuestion = 2,
  GroupTest = 3,
  InformalPhoneConversation = 4,
  Interview = 5,
  OnlineExam = 6,
  OnSiteExam = 7,
  TakeHomeExam = 8,
  PortfolioReview = 9,
  ReferenceCheck = 10,
  SeriousGames = 11,
}

export const ProvinceId = {
  AB: 1,
  BC: 2,
  MB: 3,
  NL: 4,
  NB: 5,
  NS: 6,
  NU: 7,
  NT: 8,
  ON: 9,
  PE: 10,
  QC: 11,
  SK: 12,
  YT: 13,
};

export function enumToIds(enumType: any): number[] {
  const enumVals = Object.values(enumType);
  // Note: this first array includes the list of ids as strings, followed by the list of names as strings
  const enumIds = enumVals.filter(item => !Number.isNaN(Number(item)));
  return enumIds.map(id => Number(id));
}

export const SkillLevelIdValues = enumToIds(SkillLevelId);

export const SkillTypeIdValues = enumToIds(SkillTypeId);

export const AssessmentTypeIdValues = enumToIds(AssessmentTypeId);

export const CriteriaTypeIdValues = enumToIds(CriteriaTypeId);
