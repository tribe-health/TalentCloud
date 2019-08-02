import {
  getJobEndpoint,
  parseJobResponse,
  parseJob,
  parseTasksResponse,
  getTasksEndpoint,
} from "../../api/job";
import { Job, Criteria, JobPosterKeyTask } from "../../models/types";
import {
  AsyncFsaActions,
  RSAActionTemplate,
  asyncGet,
  asyncPut,
  asyncPost,
} from "../asyncAction";
import { Action } from "../createAction";

export const FETCH_JOB_STARTED = "JOB: GET STARTED";
export const FETCH_JOB_SUCCEEDED = "JOB: GET SUCCEEDED";
export const FETCH_JOB_FAILED = "JOB: GET FAILED";

export type FetchJobAction = AsyncFsaActions<
  typeof FETCH_JOB_STARTED,
  typeof FETCH_JOB_SUCCEEDED,
  typeof FETCH_JOB_FAILED,
  { job: Job; criteria: Criteria[] },
  { id: number }
>;

export const fetchJob = (
  id: number,
): RSAActionTemplate<
  typeof FETCH_JOB_STARTED,
  typeof FETCH_JOB_SUCCEEDED,
  typeof FETCH_JOB_FAILED,
  { job: Job; criteria: Criteria[] },
  { id: number }
> =>
  asyncGet(
    getJobEndpoint(id),
    FETCH_JOB_STARTED,
    FETCH_JOB_SUCCEEDED,
    FETCH_JOB_FAILED,
    parseJobResponse,
    { id },
  );

export const CREATE_JOB_STARTED = "JOB: CREATE STARTED";
export const CREATE_JOB_SUCCEEDED = "JOB: CREATE SUCCEEDED";
export const CREATE_JOB_FAILED = "JOB: CREATE FAILED";

export type CreateJobAction = AsyncFsaActions<
  typeof CREATE_JOB_STARTED,
  typeof CREATE_JOB_SUCCEEDED,
  typeof CREATE_JOB_FAILED,
  Job,
  {}
>;

export const createJob = (
  job: Job,
): RSAActionTemplate<
  typeof CREATE_JOB_STARTED,
  typeof CREATE_JOB_SUCCEEDED,
  typeof CREATE_JOB_FAILED,
  Job,
  {}
> =>
  asyncPost(
    getJobEndpoint(null),
    job,
    CREATE_JOB_STARTED,
    CREATE_JOB_SUCCEEDED,
    CREATE_JOB_FAILED,
    parseJob,
    {},
  );

export const UPDATE_JOB_STARTED = "JOB: UPDATE STARTED";
export const UPDATE_JOB_SUCCEEDED = "JOB: UPDATE SUCCEEDED";
export const UPDATE_JOB_FAILED = "JOB: UPDATE FAILED";

export type UpdateJobAction = AsyncFsaActions<
  typeof UPDATE_JOB_STARTED,
  typeof UPDATE_JOB_SUCCEEDED,
  typeof UPDATE_JOB_FAILED,
  Job,
  { id: number }
>;

export const updateJob = (
  job: Job,
): RSAActionTemplate<
  typeof UPDATE_JOB_STARTED,
  typeof UPDATE_JOB_SUCCEEDED,
  typeof UPDATE_JOB_FAILED,
  Job,
  { id: number }
> =>
  asyncPut(
    getJobEndpoint(job.id),
    job,
    UPDATE_JOB_STARTED,
    UPDATE_JOB_SUCCEEDED,
    UPDATE_JOB_FAILED,
    parseJob,
    { id: job.id },
  );

export const EDIT_JOB = "JOB: EDIT";
export type EditJobAction = Action<typeof EDIT_JOB, Job>;
export const editJob = (job: Job): EditJobAction => ({
  type: EDIT_JOB,
  payload: job,
});

export const CLEAR_JOB_EDIT = "JOB: CLEAR EDITS";
export type ClearEditJobAction = Action<typeof CLEAR_JOB_EDIT, number>;
export const clearJobEdit = (jobId: number): ClearEditJobAction => ({
  type: CLEAR_JOB_EDIT,
  payload: jobId,
});

export const SET_SELECTED_JOB = "JOB: SET SELECTED";
export type SetSelectedJobAction = Action<
  typeof SET_SELECTED_JOB,
  { jobId: number | null }
>;
export const setSelectedJob = (jobId: number | null): SetSelectedJobAction => ({
  type: SET_SELECTED_JOB,
  payload: { jobId },
});

export const FETCH_JOB_TASKS_STARTED = "JOB TASKS: GET STARTED";
export const FETCH_JOB_TASKS_SUCCEEDED = "JOB TASKS: GET SUCCEEDED";
export const FETCH_JOB_TASKS_FAILED = "JOB TASKS: GET FAILED";

export type FetchJobTasksAction = AsyncFsaActions<
  typeof FETCH_JOB_TASKS_STARTED,
  typeof FETCH_JOB_TASKS_SUCCEEDED,
  typeof FETCH_JOB_TASKS_FAILED,
  JobPosterKeyTask[],
  { jobId: number }
>;

export const fetchJobTasks = (
  jobId: number,
): RSAActionTemplate<
  typeof FETCH_JOB_TASKS_STARTED,
  typeof FETCH_JOB_TASKS_SUCCEEDED,
  typeof FETCH_JOB_TASKS_FAILED,
  JobPosterKeyTask[],
  { jobId: number }
> =>
  asyncGet(
    getTasksEndpoint(jobId),
    FETCH_JOB_TASKS_STARTED,
    FETCH_JOB_TASKS_SUCCEEDED,
    FETCH_JOB_TASKS_FAILED,
    parseTasksResponse,
    { jobId },
  );

export const BATCH_UPDATE_JOB_TASKS_STARTED = "JOB TASKS: BATCH UPDATE STARTED";
export const BATCH_UPDATE_JOB_TASKS_SUCCEEDED =
  "JOB TASKS: BATCH UPDATE SUCCEEDED";
export const BATCH_UPDATE_JOB_TASKS_FAILED = "JOB TASKS: BATCH UPDATE FAILED";

export type BatchUpdateJobTasksAction = AsyncFsaActions<
  typeof BATCH_UPDATE_JOB_TASKS_STARTED,
  typeof BATCH_UPDATE_JOB_TASKS_SUCCEEDED,
  typeof BATCH_UPDATE_JOB_TASKS_FAILED,
  JobPosterKeyTask[],
  { jobId: number }
>;

export const batchUpdateJobTasks = (
  jobId: number,
  tasks: JobPosterKeyTask[],
): RSAActionTemplate<
  typeof BATCH_UPDATE_JOB_TASKS_STARTED,
  typeof BATCH_UPDATE_JOB_TASKS_SUCCEEDED,
  typeof BATCH_UPDATE_JOB_TASKS_FAILED,
  JobPosterKeyTask[],
  { jobId: number }
> =>
  asyncPut(
    getTasksEndpoint(jobId),
    tasks,
    BATCH_UPDATE_JOB_TASKS_STARTED,
    BATCH_UPDATE_JOB_TASKS_SUCCEEDED,
    BATCH_UPDATE_JOB_TASKS_FAILED,
    parseTasksResponse,
    { jobId },
  );

export type JobAction =
  | FetchJobAction
  | CreateJobAction
  | UpdateJobAction
  | EditJobAction
  | ClearEditJobAction
  | SetSelectedJobAction
  | FetchJobTasksAction
  | BatchUpdateJobTasksAction;

export default { fetchJob };
