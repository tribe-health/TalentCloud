/* eslint camelcase: "off", @typescript-eslint/camelcase: "off" */
import dayjs from "dayjs";
import {
  ExperienceWork,
  ExperienceEducation,
  ExperienceCommunity,
  ExperienceAward,
  ExperiencePersonal,
  Experience,
} from "../models/types";

export const fakeExperienceWork = (
  overrides: Partial<ExperienceWork> = {},
): ExperienceWork => ({
  id: 1,
  title: "Applied Researched",
  organization: "ACME Labs.",
  group: "Research Division",
  is_active: false,
  start_date: dayjs("2010-09-01T14:47:29+00:00").toDate(),
  end_date: dayjs("2015-04-30T14:47:29+00:00").toDate(),
  experienceable_id: 1,
  experienceable_type: "applicant",
  is_education_requirement: true,
  type: "experience_work",
  ...overrides,
});

export const fakeExperienceEducation = (
  overrides: Partial<ExperienceEducation> = {},
): ExperienceEducation => ({
  id: 1,
  education_type_id: 4,
  education_type: { en: "PhD", fr: "Doctorat" },
  area_of_study: "Engineering",
  institution: "University of Toronto",
  education_status_id: 1,
  education_status: {
    en: "Complete (credential awarded)",
    fr: "Terminé (titre de compétences décern)",
  },
  is_active: false,
  start_date: dayjs("2010-09-01T14:47:29+00:00").toDate(),
  end_date: dayjs("2015-04-30T14:47:29+00:00").toDate(),
  thesis_title: "How do concrete structures withstand hurricane wind stress?",
  has_blockcert: true,
  experienceable_id: 1,
  experienceable_type: "applicant",
  is_education_requirement: true,
  type: "experience_education",
  ...overrides,
});

export const fakeExperienceCommunity = (
  overrides: Partial<ExperienceCommunity> = {},
): ExperienceCommunity => ({
  id: 1,
  title: "Volunteer",
  group: "SPCA Ottawa",
  project: "Adoption Weekend",
  is_active: true,
  start_date: dayjs("2015-04-30T14:47:29+00:00").toDate(),
  end_date: null,
  experienceable_id: 1,
  experienceable_type: "applicant",
  is_education_requirement: false,
  type: "experience_community",
  ...overrides,
});

export const fakeExperienceAward = (
  overrides: Partial<ExperienceAward> = {},
): ExperienceAward => ({
  id: 1,
  title: "Governor General's Award (Gold)",
  award_recipient_type_id: 2,
  award_recipient_type: { en: "My Project", fr: "Mon projet" },
  issued_by: "McGill University",
  award_recognition_type_id: 1,
  award_recognition_type: { en: "International", fr: "Internationale" },
  awarded_date: dayjs("2015-04-30T14:47:29+00:00").toDate(),
  experienceable_id: 1,
  experienceable_type: "applicant",
  is_education_requirement: false,
  type: "experience_award",
  ...overrides,
});

export const fakeExperiencePersonal = (
  overrides: Partial<ExperiencePersonal> = {},
): ExperiencePersonal => ({
  id: 1,
  title: "Parenting",
  description:
    "Massa tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit amet mattis vulputate enim nulla aliquet porttitor lacus luctus accumsan tortor posuere ac ut consequat semper viverra nam libero justo laoreet sit amet cursus sit amet dictum sit amet justo donec enim diam vulputate.",
  is_shareable: true,
  is_active: true,
  start_date: dayjs("2015-04-30T14:47:29+00:00").toDate(),
  end_date: null,
  experienceable_id: 1,
  experienceable_type: "applicant",
  is_education_requirement: false,
  type: "experience_personal",
  ...overrides,
});

const fakeExperiences = (): Experience[] => [
  fakeExperienceWork(),
  fakeExperienceEducation(),
  fakeExperienceCommunity(),
  fakeExperienceAward(),
  fakeExperiencePersonal(),
];

export default fakeExperiences;
