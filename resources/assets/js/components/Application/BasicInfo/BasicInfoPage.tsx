/* eslint-disable camelcase */
import React from "react";
import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";
import BasicInfo from "./BasicInfo";
import makeProgressBarSteps from "../ProgressBar/progressHelpers";
import ProgressBar, { stepNames } from "../ProgressBar/ProgressBar";
import { getLocale } from "../../../helpers/localize";
import { navigate } from "../../../helpers/router";
import {
  applicationIndex,
  applicationExperienceIntro,
  applicationWelcome,
} from "../../../helpers/routes";
import { ApplicationNormalized } from "../../../models/types";
import { DispatchType } from "../../../configureStore";
import { updateApplication as updateApplicationAction } from "../../../store/Application/applicationActions";
import { loadingMessages } from "../applicationMessages";
import {
  useApplication,
  useFetchAllApplicationData,
  useJob,
  useJobApplicationSteps,
  useTouchApplicationStep,
} from "../../../hooks/applicationHooks";

interface BasicInfoPageProps {
  applicationId: number;
}

const BasicInfoPage: React.FunctionComponent<BasicInfoPageProps> = ({
  applicationId,
}) => {
  const intl = useIntl();
  const locale = getLocale(intl.locale);
  const dispatch = useDispatch<DispatchType>();

  // Fetch all un-loaded data that may be required for the Application.
  useFetchAllApplicationData(applicationId, dispatch);

  const application = useApplication(applicationId);
  const jobId = application?.job_poster_id;
  const job = useJob(jobId);
  const steps = useJobApplicationSteps();

  const stepsAreUpdating = useTouchApplicationStep(
    applicationId,
    "basic",
    dispatch,
  );

  const updateApplication = async (
    editedApplication: ApplicationNormalized,
  ): Promise<void> => {
    await dispatch(updateApplicationAction(editedApplication));
  };

  const handleContinue = async (
    values: ApplicationNormalized,
  ): Promise<void> => {
    await updateApplication(values);
    navigate(applicationExperienceIntro(locale, applicationId));
  };
  const handleReturn = async (values: ApplicationNormalized): Promise<void> => {
    await updateApplication(values);
    navigate(applicationWelcome(locale, applicationId));
  };
  const handleQuit = async (values: ApplicationNormalized): Promise<void> => {
    await updateApplication(values);
    // Because the Applications Index is outside of the Application SPA, we navigate to it differently.
    window.location.href = applicationIndex(locale);
  };

  const closeDate = job?.close_date_time ?? null;
  const showLoadingState = application === null || job === null;
  return (
    <>
      {application !== null && (
        <ProgressBar
          closeDateTime={closeDate}
          currentTitle={intl.formatMessage(stepNames.step01)}
          steps={makeProgressBarSteps(
            applicationId,
            steps,
            intl,
            "basic",
            stepsAreUpdating,
          )}
        />
      )}
      {showLoadingState && (
        <h2
          data-c-heading="h2"
          data-c-align="center"
          data-c-padding="top(2) bottom(3)"
        >
          {intl.formatMessage(loadingMessages.loading)}
        </h2>
      )}
      {application !== null && job !== null && (
        <BasicInfo
          application={application}
          job={job}
          handleContinue={handleContinue}
          handleReturn={handleReturn}
          handleQuit={handleQuit}
        />
      )}
    </>
  );
};

export default BasicInfoPage;
