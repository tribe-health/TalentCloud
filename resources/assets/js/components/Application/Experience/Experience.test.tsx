import React from "react";
import { mount } from "enzyme";
import { ExperienceStep } from "./Experience";
import { fakeSkills } from "../../../fakeData/fakeSkills";
import {
  educationStatuses,
  educationTypes,
  recipientTypes,
  recogntitionTypes,
} from "../../../stories/Application/ExperienceModals.stories";
import fakeExperienceSkills from "../../../fakeData/fakeExperienceSkills";
import fakeExperiences from "../../../fakeData/fakeExperience";
import IntlContainer from "../../../IntlContainer";
import ExperienceIntro from "./ExperienceIntro";
import { fakeCriteria } from "../../../fakeData/fakeCriteria";
import { educationMessages } from "../../JobBuilder/Details/JobDetailsMessages";
import { ClassificationId } from "../../../models/lookupConstants";

describe("Application Timeline - My Experience", (): void => {
  it("should render ExperienceStep with items", (): void => {
    const wrapper = mount(
      <IntlContainer locale="en">
        <ExperienceStep
          criteria={fakeCriteria()}
          educationStatuses={educationStatuses}
          educationTypes={educationTypes}
          experienceSkills={fakeExperienceSkills()}
          experiences={fakeExperiences()}
          handleContinue={() => {}}
          handleDeleteExperience={async () => {}}
          handleQuit={() => {}}
          handleReturn={() => {}}
          handleSubmitExperience={async () => {}}
          jobId={1}
          jobClassificationId={ClassificationId.CS}
          jobEducationRequirements={educationMessages.CS.defaultMessage}
          recipientTypes={recipientTypes}
          recognitionTypes={recogntitionTypes}
          skills={fakeSkills()}
        />
        ,
      </IntlContainer>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should render ExperienceStep without any experiences", (): void => {
    const wrapper = mount(
      <IntlContainer locale="en">
        <ExperienceStep
          criteria={fakeCriteria()}
          educationStatuses={educationStatuses}
          educationTypes={educationTypes}
          experienceSkills={[]}
          experiences={[]}
          handleContinue={() => {}}
          handleDeleteExperience={async () => {}}
          handleQuit={() => {}}
          handleReturn={() => {}}
          handleSubmitExperience={async () => {}}
          jobId={1}
          jobClassificationId={ClassificationId.CS}
          jobEducationRequirements={educationMessages.CS.defaultMessage}
          recipientTypes={recipientTypes}
          recognitionTypes={recogntitionTypes}
          skills={fakeSkills()}
        />
      </IntlContainer>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should render Experience Intro", (): void => {
    const wrapper = mount(
      <IntlContainer locale="en">
        <ExperienceIntro handleStart={() => {}} />
      </IntlContainer>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
