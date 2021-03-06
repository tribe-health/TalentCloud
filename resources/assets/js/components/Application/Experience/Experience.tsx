/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import * as React from "react";
import { FormattedMessage, useIntl, IntlShape } from "react-intl";
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
import {
  SkillTypeId,
  CriteriaTypeId,
  getKeyByValue,
  ClassificationId,
  //ClassificationId,
} from "../../../models/lookupConstants";
import EducationExperienceModal, {
  messages as educationMessages,
  EducationType,
  EducationStatus,
  EducationExperienceSubmitData,
} from "../ExperienceModals/EducationExperienceModal";

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
import { ExperienceEducationAccordion } from "../ExperienceAccordions/ExperienceEducationAccordion";
import { ExperienceWorkAccordion } from "../ExperienceAccordions/ExperienceWorkAccordion";
import { ExperienceCommunityAccordion } from "../ExperienceAccordions/ExperienceCommunityAccordion";
import { ExperiencePersonalAccordion } from "../ExperienceAccordions/ExperiencePersonalAccordion";
import { ExperienceAwardAccordion } from "../ExperienceAccordions/ExperienceAwardAccordion";
import {
  getSkillOfCriteria,
  getSkillsOfExperience,
  getDisconnectedRequiredSkills,
} from "../helpers";
import { navigationMessages, experienceMessages } from "../applicationMessages";
import { notEmpty, removeDuplicatesById } from "../../../helpers/queries";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

export function modalButtonProps(
  intl: IntlShape,
): { [key: string]: { id: Experience["type"]; title: string; icon: string } } {
  return {
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
      icon: "fas fa-people-carry",
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
}

export const ModalButton: React.FunctionComponent<{
  id: Experience["type"];
  title: string;
  icon: string;
  openModal: (id: Experience["type"]) => void;
}> = ({ id, title, icon, openModal }) => {
  return (
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
};

const applicationExperienceAccordion = (
  experience: Experience,
  irrelevantSkillCount: number,
  relevantSkills: ExperienceSkill[],
  skills: Skill[],
  handleEdit: () => void,
  handleDelete: () => Promise<void>,
): React.ReactElement | null => {
  switch (experience.type) {
    case "experience_education":
      return (
        <ExperienceEducationAccordion
          key={`${experience.id}-${experience.type}`}
          experience={experience}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          irrelevantSkillCount={irrelevantSkillCount}
          relevantSkills={relevantSkills}
          skills={skills}
          showButtons
          showSkillDetails
        />
      );
    case "experience_work":
      return (
        <ExperienceWorkAccordion
          key={`${experience.id}-${experience.type}`}
          experience={experience}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          irrelevantSkillCount={irrelevantSkillCount}
          relevantSkills={relevantSkills}
          skills={skills}
          showButtons
          showSkillDetails
        />
      );
    case "experience_community":
      return (
        <ExperienceCommunityAccordion
          key={`${experience.id}-${experience.type}`}
          experience={experience}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          irrelevantSkillCount={irrelevantSkillCount}
          relevantSkills={relevantSkills}
          skills={skills}
          showButtons
          showSkillDetails
        />
      );
    case "experience_personal":
      return (
        <ExperiencePersonalAccordion
          key={`${experience.id}-${experience.type}`}
          experience={experience}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          irrelevantSkillCount={irrelevantSkillCount}
          relevantSkills={relevantSkills}
          skills={skills}
          showButtons
          showSkillDetails
        />
      );
    case "experience_award":
      return (
        <ExperienceAwardAccordion
          key={`${experience.id}-${experience.type}`}
          experience={experience}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          irrelevantSkillCount={irrelevantSkillCount}
          relevantSkills={relevantSkills}
          skills={skills}
          showButtons
          showSkillDetails
        />
      );
    default:
      return null;
  }
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
  jobId: number;
  jobClassificationId: number | null;
  jobEducationRequirements: string | null;
  recipientTypes: AwardRecipientType[];
  recognitionTypes: AwardRecognitionType[];
  handleDeleteExperience: (
    id: number,
    type: Experience["type"],
  ) => Promise<void>;
  handleSubmitExperience: (data: ExperienceSubmitData) => Promise<void>;
}

export const MyExperience: React.FunctionComponent<ExperienceProps> = ({
  experiences,
  educationStatuses,
  educationTypes,
  experienceSkills,
  criteria,
  skills,
  handleSubmitExperience,
  handleDeleteExperience,
  jobId,
  jobClassificationId,
  jobEducationRequirements,
  recipientTypes,
  recognitionTypes,
}) => {
  const intl = useIntl();
  const locale = getLocale(intl.locale);

  const jobClassification =
    jobClassificationId !== null
      ? getKeyByValue(ClassificationId, jobClassificationId)
      : "";

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

  const essentialSkills = removeDuplicatesById(filteredSkills.essential);
  const assetSkills = removeDuplicatesById(filteredSkills.asset);

  const disconnectedRequiredSkills = getDisconnectedRequiredSkills(
    experiences,
    experienceSkills,
    essentialSkills,
  );

  const openModal = (id: Experience["type"]): void => {
    setIsModalVisible({ id, visible: true });
  };

  const closeModal = (): void => {
    setExperienceData(null);
    setIsModalVisible({ id: "", visible: false });
  };

  const submitExperience = (data) =>
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

  const softSkills = removeDuplicatesById(
    [...assetSkills, ...essentialSkills].filter(
      (skill) => skill.skill_type_id === SkillTypeId.Soft,
    ),
  );

  const modalButtons = modalButtonProps(intl);

  const modalRoot = document.getElementById("modal-root");

  return (
    <>
      <div data-c-container="medium">
        <h2 data-c-heading="h2" data-c-margin="top(3) bottom(1)">
          {intl.formatMessage(experienceMessages.heading)}
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
                      <React.Fragment key={skill.id}>
                        {lastElement && softSkills.length > 1 && and}
                        <span key={skill.id} data-c-font-weight="bold">
                          {localizeFieldNonNull(locale, skill, "name")}
                        </span>
                        {!lastElement && softSkills.length > 2 && ", "}
                      </React.Fragment>
                    );
                  })}
                </>
              ),
            }}
          />
        </p>
        {/* Experience Modal Buttons */}
        <div data-c-grid="gutter(all, 1)">
          {Object.values(modalButtons).map((buttonProps) => {
            const { id, title, icon } = buttonProps;
            return (
              <ModalButton
                key={id}
                id={id}
                title={title}
                icon={icon}
                openModal={openModal}
              />
            );
          })}
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
                const relevantSkills: ExperienceSkill[] = savedRequiredSkills
                  .map((skill) => {
                    return experienceSkills.find(
                      ({ experience_id, experience_type, skill_id }) =>
                        experience_id === experience.id &&
                        skill_id === skill.id &&
                        experience_type === experience.type,
                    );
                  })
                  .filter(notEmpty);

                const handleEdit = () =>
                  editExperience(
                    experience,
                    savedOptionalSkills,
                    savedRequiredSkills,
                  );
                const handleDelete = () => deleteExperience(experience);

                const errorAccordion = () => (
                  <div
                    data-c-background="gray(10)"
                    data-c-radius="rounded"
                    data-c-border="all(thin, solid, gray)"
                    data-c-margin="top(1)"
                    data-c-padding="all(1)"
                  >
                    <div data-c-align="base(center)">
                      <p data-c-color="stop">
                        {intl.formatMessage(
                          experienceMessages.errorRenderingExperience,
                        )}
                      </p>
                    </div>
                  </div>
                );

                // Number of skills attached to Experience but are not part of the jobs skill criteria.
                const irrelevantSkillCount =
                  experienceSkills.filter(
                    (experienceSkill) =>
                      experienceSkill.experience_id === experience.id &&
                      experienceSkill.experience_type === experience.type,
                  ).length -
                  (savedOptionalSkills.length + savedRequiredSkills.length);

                return (
                  applicationExperienceAccordion(
                    experience,
                    irrelevantSkillCount,
                    relevantSkills,
                    skills,
                    handleEdit,
                    handleDelete,
                  ) ?? errorAccordion()
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
              <React.Fragment key={skill.id}>
                <span
                  data-c-tag="stop"
                  data-c-radius="pill"
                  data-c-font-size="small"
                >
                  {localizeFieldNonNull(locale, skill, "name")}
                </span>{" "}
              </React.Fragment>
            ))}
          </p>
        )}
      </div>

      <div data-c-dialog-overlay={isModalVisible.visible ? "active" : ""} />
      <EducationExperienceModal
        educationStatuses={educationStatuses}
        educationTypes={educationTypes}
        experienceEducation={experienceData as ExperienceEducation}
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        jobClassification={jobClassification}
        jobEducationRequirements={jobEducationRequirements}
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
        experienceWork={experienceData as ExperienceWork}
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        jobClassification={jobClassification}
        jobEducationRequirements={jobEducationRequirements}
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
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        jobClassification={jobClassification}
        jobEducationRequirements={jobEducationRequirements}
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
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        jobClassification={jobClassification}
        jobEducationRequirements={jobEducationRequirements}
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
        experienceableId={experienceData?.experienceable_id ?? 0}
        experienceableType={
          experienceData?.experienceable_type ?? "application"
        }
        jobId={jobId}
        jobClassification={jobClassification}
        jobEducationRequirements={jobEducationRequirements}
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

interface ExperienceStepProps {
  experiences: Experience[];
  educationStatuses: EducationStatus[];
  educationTypes: EducationType[];
  experienceSkills: ExperienceSkill[];
  criteria: Criteria[];
  skills: Skill[];
  jobId: number;
  jobClassificationId: number | null;
  jobEducationRequirements: string | null;
  recipientTypes: AwardRecipientType[];
  recognitionTypes: AwardRecognitionType[];
  handleDeleteExperience: (
    id: number,
    type: Experience["type"],
  ) => Promise<void>;
  handleSubmitExperience: (data: ExperienceSubmitData) => Promise<void>;
  handleContinue: () => void;
  handleQuit: () => void;
  handleReturn: () => void;
}

export const ExperienceStep: React.FunctionComponent<ExperienceStepProps> = ({
  experiences,
  educationStatuses,
  educationTypes,
  experienceSkills,
  criteria,
  skills,
  handleSubmitExperience,
  handleDeleteExperience,
  jobId,
  jobClassificationId,
  jobEducationRequirements,
  recipientTypes,
  recognitionTypes,
  handleContinue,
  handleQuit,
  handleReturn,
}) => {
  const intl = useIntl();
  return (
    <>
      <MyExperience
        experiences={experiences}
        educationStatuses={educationStatuses}
        educationTypes={educationTypes}
        experienceSkills={experienceSkills}
        criteria={criteria}
        skills={skills}
        jobId={jobId}
        jobClassificationId={jobClassificationId}
        jobEducationRequirements={jobEducationRequirements}
        recipientTypes={recipientTypes}
        recognitionTypes={recognitionTypes}
        handleSubmitExperience={handleSubmitExperience}
        handleDeleteExperience={handleDeleteExperience}
      />
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
              {intl.formatMessage(navigationMessages.return)}
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
              {intl.formatMessage(navigationMessages.quit)}
            </button>
            <button
              data-c-button="solid(c1)"
              data-c-radius="rounded"
              data-c-margin="left(1)"
              type="button"
              onClick={(): void => handleContinue()}
            >
              {intl.formatMessage(navigationMessages.continue)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExperienceStep;
