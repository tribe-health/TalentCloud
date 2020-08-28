import React from "react";
import { useIntl } from "react-intl";
import makeProgressBarSteps from "../ProgressBar/progressHelpers";
import ProgressBar, { stepNames } from "../ProgressBar/ProgressBar";
import { fakeApplication } from "../../../fakeData/fakeApplications";
import Skills from "./Skills";
import { ExperienceSkill } from "../../../models/types";
import { fakeCriteria } from "../../../fakeData/fakeCriteria";
import fakeExperiences from "../../../fakeData/fakeExperience";
import fakeExperienceSkills from "../../../fakeData/fakeExperienceSkills";
import { fakeSkills } from "../../../fakeData/fakeSkills";

interface SkillsPageProps {
  applicationId: number;
}

export const SkillsPage: React.FunctionComponent<SkillsPageProps> = ({
  applicationId,
}) => {
  const intl = useIntl();

  const application = fakeApplication(); // TODO: get real application.
  const criteria = fakeCriteria(); // TODO: Get criteria associated with job.
  const experiences = fakeExperiences(); // TODO: get experienciences associated with application.
  const experienceSkills = fakeExperienceSkills(); // TODO: Get experienceSkills associated with experiences.

  // TODO: load constants from backend.
  const skills = fakeSkills();

  const handleUpdateExpSkill = async (
    experience: ExperienceSkill,
  ): Promise<ExperienceSkill> => {
    // TODO: Save experience skill to server.
    return experience;
  };
  const handleDeleteExpSkill = async (
    experience: ExperienceSkill,
  ): Promise<ExperienceSkill> => {
    // TODO: Delete experience skill
    return experience;
  };
  const closeDate = new Date(); // TODO: get from application.
  return (
    <>
      <ProgressBar
        closeDateTime={closeDate}
        currentTitle={intl.formatMessage(stepNames.step01)}
        steps={makeProgressBarSteps(application, intl, "skills")}
      />
      <Skills
        criteria={criteria}
        experiences={experiences}
        experienceSkills={experienceSkills}
        skills={skills}
        handleUpdateExperienceJustification={handleUpdateExpSkill}
        handleRemoveExperienceJustification={handleDeleteExpSkill}
      />
    </>
  );
};

export default SkillsPage;
