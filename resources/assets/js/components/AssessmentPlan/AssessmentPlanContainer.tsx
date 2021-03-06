import React, { useEffect } from "react";
import { connect } from "react-redux";
import { StandardAction, ErrorAction } from "redux-api-middleware";
import AssessmentPlan from "./AssessmentPlan";
import { Job, AssessmentPlanNotification, Skill } from "../../models/types";
import { RootState } from "../../store/store";
import { getJob } from "../../store/Job/jobSelector";
import { fetchJob } from "../../store/Job/jobActions";
import { fetchAssessmentPlan } from "../../store/AssessmentPlan/assessmentPlanActions";
import { fetchSkills } from "../../store/Skill/skillActions";
import { getUnreadNotificationsByJob } from "../../store/AssessmentPlanNotification/assessmentPlanNotificationSelectors";
import { fetchAssessmentPlanNotifications } from "../../store/AssessmentPlanNotification/assessmentPlanNotificationActions";
import { DispatchType } from "../../configureStore";
import { Portal } from "../../models/app";

interface AssessmentPlanContainerProps {
  jobId: number;
}

const mapStateToProps = (
  state: RootState,
  ownProps: AssessmentPlanContainerProps,
): {
  job: Job | null;
  notifications: AssessmentPlanNotification[];
} => ({
  job: getJob(state, ownProps),
  notifications: getUnreadNotificationsByJob(state, ownProps),
});

const mapDispatchToProps = (
  dispatch: DispatchType,
  ownProps: AssessmentPlanContainerProps,
): {
  dispatchFetchJob: () => void;
  dispatchFetchAssessmentPlan: () => void;
  dispatchFetchSkills: () => void;
  dispatchFetchNotifications: () => void;
} => ({
  dispatchFetchJob: (): void => {
    dispatch(fetchJob(ownProps.jobId));
  },
  dispatchFetchAssessmentPlan: (): void =>
    dispatch(fetchAssessmentPlan(ownProps.jobId)),
  dispatchFetchSkills: (): Promise<
    | StandardAction<"FETCH_SKILLS_SUCCEEDED", PromiseLike<Skill[]>, {}>
    | ErrorAction<"FETCH_SKILLS_FAILED", Error, {}>
  > => dispatch(fetchSkills()),
  dispatchFetchNotifications: (): void =>
    dispatch(fetchAssessmentPlanNotifications(ownProps.jobId)),
});

interface AssessmentPlanFetchContainerProps {
  jobId: number;
  job: Job | null;
  notifications: AssessmentPlanNotification[];
  portal: Portal;
  dispatchFetchJob: () => void;
  dispatchFetchAssessmentPlan: () => void;
  dispatchFetchSkills: () => void;
  dispatchFetchNotifications: () => void;
}

const AssessmentPlanFetchContainer: React.FunctionComponent<AssessmentPlanFetchContainerProps> = ({
  jobId,
  job,
  notifications,
  portal,
  dispatchFetchJob,
  dispatchFetchAssessmentPlan,
  dispatchFetchSkills,
  dispatchFetchNotifications,
}): React.ReactElement => {
  // Similar to componentDidMount and componentDidUpdate:
  useEffect((): void => {
    dispatchFetchJob();
  }, [dispatchFetchJob, jobId]);
  useEffect((): void => {
    dispatchFetchAssessmentPlan();
  }, [dispatchFetchAssessmentPlan, jobId]);
  useEffect((): void => {
    dispatchFetchSkills();
  }, [dispatchFetchSkills]);
  useEffect((): void => {
    dispatchFetchNotifications();
  }, [dispatchFetchNotifications]);
  return (
    <AssessmentPlan job={job} notifications={notifications} portal={portal} />
  );
};
const AssessmentPlanContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AssessmentPlanFetchContainer);

export default AssessmentPlanContainer;
