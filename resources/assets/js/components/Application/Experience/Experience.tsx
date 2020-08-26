/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import * as React from "react";
import { FormattedMessage, useIntl, defineMessages } from "react-intl";
import {
  Skill,
  ExperienceEducation,
  ExperienceWork,
  ExperienceCommunity,
  Experience,
  ExperiencePersonal,
  ExperienceAward,
  ExperienceSkill,
  Criteria,
} from "../../../models/types";
import { localizeFieldNonNull, getLocale } from "../../../helpers/localize";
import { SkillTypeId, CriteriaTypeId } from "../../../models/lookupConstants";
import EducationExperienceModal, {
  messages as educationMessages,
  EducationType,
  EducationStatus,
  EducationExperienceSubmitData,
} from "../ExperienceModals/EducationExperienceModal";

import { EducationSubformProps } from "../ExperienceModals/EducationSubform";
import WorkExperienceModal, {
  messages as workMessages,
  WorkExperienceSubmitData,
} from "../ExperienceModals/WorkExperienceModal";
import CommunityExperienceModal, {
  messages as communityMessages,
  CommunityExperienceSubmitData,
} from "../ExperienceModals/CommunityExperienceModal";
import PersonalExperienceModal, {
  messages as personalMessages,
  PersonalExperienceSubmitData,
} from "../ExperienceModals/PersonalExperienceModal";
import AwardExperienceModal, {
  messages as awardMessages,
  AwardRecipientType,
  AwardRecognitionType,
  AwardExperienceSubmitData,
} from "../ExperienceModals/AwardExperienceModal";
import ExperienceEducationAccordion from "../ExperienceAccordions/ExperienceEducationAccordion";
import ExperienceWorkAccordion from "../ExperienceAccordions/ExperienceWorkAccordion";
import ExperienceCommunityAccordion from "../ExperienceAccordions/ExperienceCommunityAccordion";
import ExperiencePersonalAccordion from "../ExperienceAccordions/ExperiencePersonalAccordion";
import ExperienceAwardAccordion from "../ExperienceAccordions/ExperienceAwardAccordion";
import { mapToObject, hasKey } from "../../../helpers/queries";
import { getSkillOfCriteria } from "../helpers";

const messages = defineMessages({
  educationTypeMissing: {
    id: "application.experience.educationTypeMissing",
    defaultMessage: "Education type not found",
    description: "Error message for when the education type cannot be found.",
  },
  educationStatusMissing: {
    id: "application.experience.educationStatusMissing",
    defaultMessage: "Education status not found",
    description: "Error message for when the education status cannot be found.",
  },
  awardRecipientMissing: {
    id: "application.experience.awardRecipientMissing",
    defaultMessage: "Award recipient not found",
    description: "Error message for when the award recipient cannot be found.",
  },
  awardRecognitionMissing: {
    id: "application.experience.awardRecognitionMissing",
    defaultMessage: "Award recognition not found",
    description:
      "Error message for when the award recognition cannot be found.",
  },
  errorRenderingExperience: {
    id: "application.experience.errorRenderingExperience",
    defaultMessage: "Experience failed to render (experience type missing).",
    description: "Error message displayed when experience fails to render.",
  },
});

// TODO: Move method to Experience selectors file or utility file.
export const getSkillsOfExperience = (
  experienceSkills: ExperienceSkill[],
  experience: Experience,
  skills: Skill[],
): Skill[] => {
  const experienceSkillsByType = experienceSkills.filter(
    (experienceSkill) =>
      experience.type === experienceSkill.experience_type &&
      experience.id === experienceSkill.experience_id,
  );

  const experiencesBySkillId = mapToObject(
    experienceSkillsByType,
    (item) => item.skill_id,
  );
  return skills.filter((skill) => hasKey(experiencesBySkillId, skill.id));
};

// Gets a list of all required skills that haven't been connected to a experience yet.
const getDisconnectedRequiredSkills = (
  experiences: Experience[],
  experienceSkills: ExperienceSkill[],
  essentialSkills: Skill[],
): Skill[] => {
  const connectedRequiredSkills = experiences.reduce(
    (skills: Skill[], experience: Experience) => {
      const requiredSkills = getSkillsOfExperience(
        experienceSkills,
        experience,
        essentialSkills,
      ).filter((skill) => !skills.includes(skill));

      return [...skills, ...requiredSkills];
    },
    [],
  );

  return essentialSkills.filter(
    (skill) => !connectedRequiredSkills.includes(skill),
  );
};

export type ExperienceSubmitData =
  | EducationExperienceSubmitData
  | WorkExperienceSubmitData
  | CommunityExperienceSubmitData
  | PersonalExperienceSubmitData
  | AwardExperienceSubmitData;

interface ExperienceProps {
  experiences: Experience[];
  educationStatuses: EducationStatus[];
  educationTypes: EducationType[];
  experienceSkills: ExperienceSkill[];
  criteria: Criteria[];
  skills: Skill[];
  experienceRequirements: EducationSubformProps;
  jobId: number;
  recipientTypes: AwardRecipientType[];
  recognitionTypes: AwardRecognitionType[];
  handleSubmitExperience: (data: ExperienceSubmitData) => Promise<void>;
  handleDeleteExperience: (
    id: number,
    type: Experience["type"],
  ) => Promise<void>;
  handleContinue: () => void;
  handleQuit: () => void;
  handleReturn: () => void;
}

const MyExperience: React.FunctionComponent<ExperienceProps> = ({
  experiences,
  educationStatuses,
  educationTypes,
  experienceSkills,
  criteria,
  skills,
  experienceRequirements,
  handleSubmitExperience,
  handleDeleteExperience,
  jobId,
  recipientTypes,
  recognitionTypes,
  handleContinue,
  handleQuit,
  handleReturn,
}) => {
  const intl = useIntl();
  const locale = getLocale(intl.locale);

  const [experienceData, setExperienceData] = React.useState<
    | (Experience & {
        savedOptionalSkills: Skill[];
        savedRequiredSkills: Skill[];
      })
    | null
  >(null);

  const [isModalVisible, setIsModalVisible] = React.useState<{
    id: Experience["type"] | "";
    visible: boolean;
  }>({
    id: "",
    visible: false,
  });

  const filteredSkills = criteria.reduce(
    (result, criterion): { essential: Skill[]; asset: Skill[] } => {
      const skillOfCriterion = getSkillOfCriteria(criterion, skills);
      if (skillOfCriterion) {
        if (criterion.criteria_type_id === CriteriaTypeId.Essential) {
          result.essential.push(skillOfCriterion);
        }
        if (criterion.criteria_type_id === CriteriaTypeId.Asset) {
          result.asset.push(skillOfCriterion);
        }
      }
      return result;
    },
    { essential: [], asset: [] } as { essential: Skill[]; asset: Skill[] },
  );

  const essentialSkills = filteredSkills.essential;
  const assetSkills = filteredSkills.asset;

  getDisconnectedRequiredSkills(experiences, experienceSkills, essentialSkills);

  const [
    disconnectedRequiredSkills,
    setDisconnectedRequiredSkills,
  ] = React.useState<Skill[]>(
    getDisconnectedRequiredSkills(
      experiences,
      experienceSkills,
      essentialSkills,
    ),
  );

  const openModal = (id: Experience["type"]): void => {
    setIsModalVisible({ id, visible: true });
  };

  const closeModal = (): void => {
    setDisconnectedRequiredSkills(
      getDisconnectedRequiredSkills(
        experiences,
        experienceSkills,
        essentialSkills,
      ),
    );
    setExperienceData(null);
    setIsModalVisible({ id: "", visible: false });
  };

  const submitExperience = (data: ExperienceSubmitData): Promise<void> =>
    handleSubmitExperience(data).then(closeModal);

  const editExperience = (
    experience: Experience,
    savedOptionalSkills: Skill[],
    savedRequiredSkills: Skill[],
  ): void => {
    setExperienceData({
      ...experience,
      savedOptionalSkills,
      savedRequiredSkills,
    });
    setIsModalVisible({ id: experience.type, visible: true });
  };

  const deleteExperience = (experience: Experience): Promise<void> =>
    handleDeleteExperience(experience.id, experience.type).then(closeModal);

  const softSkills = [...assetSkills, ...essentialSkills].filter(
    (skill) => skill.skill_type_id === SkillTypeId.Soft,
  );

  const modalButtons: {
    [key: string]: { id: Experience["type"]; title: string; icon: string };
  } = {
    education: {
      id: "experience_education",
      title: intl.formatMessage(educationMessages.modalTitle),
      icon: "fas fa-book",
    },
    work: {
      id: "experience_work",
      title: intl.formatMessage(workMessages.modalTitle),
      icon: "fas fa-briefcase",
    },
    community: {
      id: "experience_community",
      title: intl.formatMessage(communityMessages.modalTitle),
      icon: "fas fa-carry",
    },
    personal: {
      id: "experience_personal",
      title: intl.formatMessage(personalMessages.modalTitle),
      icon: "fas fa-mountain",
    },
    award: {
      id: "experience_award",
      title: intl.formatMessage(awardMessages.modalTitle),
      icon: "fas fa-trophy",
    },
  };

  const modalButton = ({ id, title, icon }): React.ReactElement => (
    <div key={id} data-c-grid-item="base(1of2) tp(1of3) tl(1of5)">
      <button
        className="application-experience-trigger"
        data-c-card
        data-c-background="c1(100)"
        data-c-radius="rounded"
        title={title}
        data-c-dialog-id={id}
        data-c-dialog-action="open"
        type="button"
        onClick={(): void => openModal(id)}
      >
        <i className={icon} aria-hidden="true" />
        <span data-c-font-size="regular" data-c-font-weight="bold">
          {title}
        </span>
      </button>
    </div>
  );

  const modalRoot = document.getElementById("modal-root");

  const experienceAccordion = (
    experience: Experience,
    irrelevantSkillCount: number,
    relevantSkills: ExperienceSkill[],
    handleEdit: () => void,
    handleDelete: () => void,
  ): React.ReactElement => {
    switch (experience.type) {
      case "experience_education":
        return (
          <ExperienceEducationAccordion
            key={`${experience.id}-${experience.type}`}
            areaOfStudy={experience.area_of_study}
            educationType={localizeFieldNonNull(
              locale,
              experience,
              "education_type",
            )}
            endDate={experience.end_date}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            institution={experience.institution}
            irrelevantSkillCount={irrelevantSkillCount}
            isActive={experience.is_active}
            isEducationJustification={experience.is_education_requirement}
            relevantSkills={relevantSkills}
            skills={skills}
            showButtons
            showSkillDetails
            startDate={experience.start_date}
            status={localizeFieldNonNull(
              locale,
              experience,
              "education_status",
            )}
            thesisTitle={experience.thesis_title}
          />
        );
      case "experience_work":
        return (
          <ExperienceWorkAccordion
            key={`${experience.id}-${experience.type}`}
            endDate={experience.end_date}
            group={experience.group}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            irrelevantSkillCount={irrelevantSkillCount}
            isActive={experience.is_active}
            isEducationJustification={experience.is_education_requirement}
            organization={experience.organization}
            relevantSkills={relevantSkills}
            skills={skills}
            showButtons
            showSkillDetails
            startDate={experience.start_date}
            title={experience.title}
          />
        );
      case "experience_community":
        return (
          <ExperienceCommunityAccordion
            key={`${experience.id}-${experience.type}`}
            endDate={experience.end_date}
            group={experience.group}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            irrelevantSkillCount={irrelevantSkillCount}
            isActive={experience.is_active}
            isEducationJustification={experience.is_education_requirement}
            project={experience.project}
            relevantSkills={relevantSkills}
            skills={skills}
            showButtons
            showSkillDetails
            startDate={experience.start_date}
            title={experience.title}
          />
        );
      case "experience_personal":
        return (
          <ExperiencePersonalAccordion
            key={`${experience.id}-${experience.type}`}
            description={experience.description}
            endDate={experience.end_date}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            irrelevantSkillCount={irrelevantSkillCount}
            isActive={experience.is_active}
            isEducationJustification={experience.is_education_requirement}
            isShareable={experience.is_shareable}
            relevantSkills={relevantSkills}
            skills={skills}
            showButtons
            showSkillDetails
            startDate={experience.start_date}
            title={experience.title}
          />
        );
      case "experience_award":
        return (
          <ExperienceAwardAccordion
            key={`${experience.id}-${experience.type}`}
            awardedDate={experience.awarded_date}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            irrelevantSkillCount={irrelevantSkillCount}
            isEducationJustification={experience.is_education_requirement}
            issuer={experience.issued_by}
            recipient={localizeFieldNonNull(
              locale,
              experience,
              "award_recipient_type",
            )}
            relevantSkills={relevantSkills}
            skills={skills}
            scope={localizeFieldNonNull(
              locale,
              experience,
              "award_recognition_type",
            )}
            showButtons
            showSkillDetails
            title={experience.title}
          />
        );
      default:
        return (
          <div
            data-c-background="gray(10)"
            data-c-radius="rounded"
            data-c-border="all(thin, solid, gray)"
            data-c-margin="top(1)"
            data-c-padding="all(1)"
          >
            <div data-c-align="base(center)">
              <p data-c-color="stop">
                {intl.formatMessage(messages.errorRenderingExperience)}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div data-c-container="medium">
        <h2 data-c-heading="h2" data-c-margin="top(3) bottom(1)">
          <FormattedMessage
            id="application.experience.header"
            defaultMessage="My Experience"
            description="Heading text on the experience step of the Application Timeline."
          />
        </h2>
        <p data-c-margin="bottom(1)">
          <FormattedMessage
            id="application.experience.preamble"
            defaultMessage="Use the buttons below to add experiences you want to share with the manager. Experiences you have added in the past also appear below, and you can edit them to link them to skills required for this job when necessary."
            description="First section of text on the experience step of the Application Timeline."
          />
        </p>
        <div data-c-grid="gutter(all, 1)">
          {essentialSkills.length > 0 && (
            <div data-c-grid-item="tl(1of2)">
              <p data-c-margin="bottom(.5)">
                <FormattedMessage
                  id="application.experience.essentialSkillsListIntro"
                  description="Text before the list of essential skills on the experience step of the Application Timeline."
                  defaultMessage="This job <span>requires</span> the following skills:"
                  values={{
                    span: (chunks): React.ReactElement => (
                      <span data-c-font-weight="bold" data-c-color="c2">
                        {chunks}
                      </span>
                    ),
                  }}
                />
              </p>
              <ul data-c-margin="bottom(1)">
                {essentialSkills.map((skill) => (
                  <li key={skill.id}>
                    {localizeFieldNonNull(locale, skill, "name")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {assetSkills.length > 0 && (
            <div data-c-grid-item="tl(1of2)">
              <p data-c-margin="bottom(.5)">
                <FormattedMessage
                  id="application.experience.assetSkillsListIntro"
                  defaultMessage="These skills are beneficial, but not required:"
                  description="Text before the list of asset skills on the experience step of the Application Timeline."
                />
              </p>
              <ul data-c-margin="bottom(1)">
                {assetSkills.map((skill) => (
                  <li key={skill.id}>
                    {localizeFieldNonNull(locale, skill, "name")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p data-c-color="gray" data-c-margin="bottom(2)">
          <FormattedMessage
            id="application.experience.softSkillsList"
            defaultMessage="Don't forget, {skill} will be evaluated later in the hiring process."
            description="List of soft skills that will be evaluated later."
            values={{
              skill: (
                <>
                  {softSkills.map((skill, index) => {
                    const and = " and ";
                    const lastElement = index === softSkills.length - 1;
                    return (
                      <>
                        {lastElement && softSkills.length > 1 && and}
                        <span key={skill.id} data-c-font-weight="bold">
                          {localizeFieldNonNull(locale, skill, "name")}
                        </span>
                        {!lastElement && softSkills.length > 2 && ", "}
                      </>
                    );
                  })}
                </>
              ),
            }}
          />
        </p>
        {/* Experience Modal Buttons */}
        <div data-c-grid="gutter(all, 1)">
          {Object.keys(modalButtons).map((id) => modalButton(modalButtons[id]))}
        </div>
        {/* Experience Accordion List */}
        {experiences && experiences.length > 0 ? (
          <div className="experience-list" data-c-margin="top(2)">
            <div data-c-accordion-group>
              {experiences.map((experience) => {
                const savedOptionalSkills = getSkillsOfExperience(
                  experienceSkills,
                  experience,
                  assetSkills,
                );
                const savedRequiredSkills = getSkillsOfExperience(
                  experienceSkills,
                  experience,
                  essentialSkills,
                );
                const relevantSkills: ExperienceSkill[] =
                  savedRequiredSkills.map((skill) => {
                    const experienceSkill = experienceSkills.find(
                      ({ experience_id, experience_type, skill_id }) =>
                        experience_id === experience.experienceable_id &&
                        skill_id === skill.id &&
                        experience_type === experience.type,
                    );
                    return {
                      id: experienceSkill?.id ?? 0,
                      skill_id: experienceSkill?.skill_id ?? 0,
                      experience_id: experienceSkill?.experience_id ?? 0,
                      experience_type: experienceSkill?.experience_type ?? "",
                      justification: experienceSkill?.justification ?? "",
                      created_at: experienceSkill?.created_at ?? new Date(),
                      updated_at: experienceSkill?.updated_at ?? new Date(),
                    };
                  }) ?? [];

                // Number of skills attached to Experience but are not part of the jobs skill criteria.
                const irrelevantSkillCount =
                  experienceSkills.filter(
                    (experienceSkill) =>
                      experienceSkill.experience_id === experience.id &&
                      experienceSkill.experience_type === experience.type,
                  ).length -
                  (savedOptionalSkills.length + savedRequiredSkills.length);

                return experienceAccordion(
                  experience,
                  irrelevantSkillCount,
                  relevantSkills,
                  () =>
                    editExperience(
                      experience,
                      savedOptionalSkills,
                      savedRequiredSkills,
                    ),
                  () => deleteExperience(experience),
                );
              })}
            </div>
          </div>
        ) : (
          <div
            data-c-background="gray(10)"
            data-c-radius="rounded"
            data-c-border="all(thin, solid, gray)"
            data-c-margin="top(2)"
            data-c-padding="all(1)"
          >
            <div data-c-align="base(center)">
              <p data-c-color="gray">
                <FormattedMessage
                  id="application.experience.noExperiences"
                  defaultMessage="Looks like you don't have any experience added yet. Use the buttons above to add experience. Don't forget that experience will always be saved to your profile so that you can use it on future applications!"
                  description="Message displayed when application has no experiences."
                />
              </p>
            </div>
          </div>
        )}
        {disconnectedRequiredSkills && disconnectedRequiredSkills.length > 0 && (
          <p data-c-color="stop" data-c-margin="top(2)">
            <FormattedMessage
              id="application.experience.unconnectedSkills"
              defaultMessage="The following required skill(s) are not connected to your experience:"
              description="Message showing list of required skills that are not connected to a experience."
            />{" "}
            {disconnectedRequiredSkills.map((skill) => (
              <>
                <span
                  data-c-tag="stop"
                  data-c-radius="pill"
                  data-c-font-size="small"
                >
                  {localizeFieldNonNull(locale, skill, "name")}
                </span>{" "}
              </>
            ))}
          </p>
        )}
      </div>
      <div data-c-container="medium" data-c-padding="tb(2)">
        <hr data-c-hr="thin(c1)" data-c-margin="bottom(2)" />
        <div data-c-grid="gutter">
          <div
            data-c-alignment="base(centre) tp(left)"
            data-c-grid-item="tp(1of2)"
          >
            <button
              data-c-button="outline(c2)"
              data-c-radius="rounded"
              type="button"
              onClick={(): void => handleReturn()}
            >
              <FormattedMessage
                id="application.experience.returnButtonLabel"
                defaultMessage="Save & Return to Previous Step"
                description="The text displayed on the Save & Return button of the Applicant Timeline form."
              />
            </button>
          </div>
          <div
            data-c-alignment="base(centre) tp(right)"
            data-c-grid-item="tp(1of2)"
          >
            <button
              data-c-button="outline(c2)"
              data-c-radius="rounded"
              type="button"
              onClick={(): void => handleQuit()}
            >
              <FormattedMessage
                id="application.experience.quitButtonLabel"
                defaultMessage="Save & Quit"
                description="The text displayed on the Save & Return button of the Applicant Timeline form."
              />
            </button>
            <button
              data-c-button="solid(c1)"
              data-c-radius="rounded"
              data-c-margin="left(1)"
              type="button"
              onClick={(): void => handleContinue()}
            >
              <FormattedMessage
                id="application.experience.submitButtonLabel"
                defaultMessage="Save & Continue"
                description="The text displayed on the submit button for the Job Details form."
              />
            </button>
          </div>
        </div>
      </div>

      <div data-c-dialog-overlay={isModalVisible.visible ? "active" : ""} />
      <EducationExperienceModal
        educationStatuses={educationStatuses}
        educationTypes={educationTypes}
        experienceEducation={experienceData as ExperienceEducation}
        experienceRequirments={experienceRequirements}
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        modalId={modalButtons.education.id}
        onModalCancel={closeModal}
        onModalConfirm={submitExperience}
        optionalSkills={assetSkills}
        parentElement={modalRoot}
        requiredSkills={essentialSkills}
        savedOptionalSkills={experienceData?.savedOptionalSkills ?? []}
        savedRequiredSkills={experienceData?.savedRequiredSkills ?? []}
        visible={
          isModalVisible.visible &&
          isModalVisible.id === modalButtons.education.id
        }
      />
      <WorkExperienceModal
        experienceRequirments={experienceRequirements}
        experienceWork={experienceData as ExperienceWork}
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        modalId={modalButtons.work.id}
        onModalCancel={closeModal}
        onModalConfirm={submitExperience}
        optionalSkills={assetSkills}
        parentElement={modalRoot}
        requiredSkills={essentialSkills}
        savedOptionalSkills={experienceData?.savedOptionalSkills ?? []}
        savedRequiredSkills={experienceData?.savedRequiredSkills ?? []}
        visible={
          isModalVisible.visible && isModalVisible.id === modalButtons.work.id
        }
      />
      <CommunityExperienceModal
        experienceCommunity={experienceData as ExperienceCommunity}
        experienceRequirments={experienceRequirements}
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        modalId={modalButtons.community.id}
        onModalCancel={closeModal}
        onModalConfirm={submitExperience}
        optionalSkills={assetSkills}
        parentElement={modalRoot}
        requiredSkills={essentialSkills}
        savedOptionalSkills={experienceData?.savedOptionalSkills ?? []}
        savedRequiredSkills={experienceData?.savedRequiredSkills ?? []}
        visible={
          isModalVisible.visible &&
          isModalVisible.id === modalButtons.community.id
        }
      />
      <PersonalExperienceModal
        experiencePersonal={experienceData as ExperiencePersonal}
        experienceRequirments={experienceRequirements}
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        modalId={modalButtons.personal.id}
        onModalCancel={closeModal}
        onModalConfirm={submitExperience}
        optionalSkills={assetSkills}
        parentElement={modalRoot}
        requiredSkills={essentialSkills}
        savedOptionalSkills={experienceData?.savedOptionalSkills ?? []}
        savedRequiredSkills={experienceData?.savedRequiredSkills ?? []}
        visible={
          isModalVisible.visible &&
          isModalVisible.id === modalButtons.personal.id
        }
      />
      <AwardExperienceModal
        experienceAward={experienceData as ExperienceAward}
        experienceRequirments={experienceRequirements}
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        modalId={modalButtons.award.id}
        onModalCancel={closeModal}
        onModalConfirm={submitExperience}
        optionalSkills={assetSkills}
        parentElement={modalRoot}
        recipientTypes={recipientTypes}
        recognitionTypes={recognitionTypes}
        requiredSkills={essentialSkills}
        savedOptionalSkills={experienceData?.savedOptionalSkills ?? []}
        savedRequiredSkills={experienceData?.savedRequiredSkills ?? []}
        visible={
          isModalVisible.visible && isModalVisible.id === modalButtons.award.id
        }
      />
    </>
  );
};

export default MyExperience;
