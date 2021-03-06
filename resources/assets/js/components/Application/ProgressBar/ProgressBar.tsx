import * as React from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Link } from "../../../models/app";
import { getLocale } from "../../../helpers/localize";
import { navigate } from "../../../helpers/router";
import { readableTimeFromNow } from "../../../helpers/dates";
import { ProgressBarStatus } from "../../../models/lookupConstants";

export const stepNames = defineMessages({
  welcome: {
    id: "application.progressBar.welcome",
    defaultMessage: "Welcome",
  },
  step01: {
    id: "application.progressBar.step01",
    defaultMessage: "Step 1/6",
  },
  step02: {
    id: "application.progressBar.step02",
    defaultMessage: "Step 2/6",
  },
  step03: {
    id: "application.progressBar.step03",
    defaultMessage: "Step 3/6",
  },
  step04: {
    id: "application.progressBar.step04",
    defaultMessage: "Step 4/6",
  },
  step05: {
    id: "application.progressBar.step05",
    defaultMessage: "Step 5/6",
  },
  step06: {
    id: "application.progressBar.step06",
    defaultMessage: "Step 6/6",
  },
});

// Returns the list item element that corresponds to the steps status.
const createStep = (
  link: Link,
  status: ProgressBarStatus,
  loading: boolean,
): React.ReactElement => {
  switch (status) {
    case "complete":
      return (
        <li key={link.title}>
          <span data-c-visibility="invisible">
            <FormattedMessage
              id="application.progressbar.completedStepLabel"
              defaultMessage="Completed: "
              description="Visually hidden text used to indicate the completed steps."
            />
          </span>
          <a
            href={link.url}
            title={link.title}
            onClick={(e) => {
              e.preventDefault();
              navigate(link.url);
            }}
          >
            <span data-c-visibility="invisible">{link.text}</span>
            <i
              className={`${
                loading ? "blinking-animation" : ""
              } fas fa-check-circle`}
              data-c-color="go"
            />
          </a>
        </li>
      );
    case "current":
      return (
        <li key={link.title} title={link.title}>
          <span data-c-visibility="invisible">
            <FormattedMessage
              id="application.progressbar.currentStepLabel"
              defaultMessage="Current: "
              description="Visually hidden text used to indicate the current steps."
            />
          </span>
          <span data-c-visibility="invisible">{link.text}</span>
          <i
            className={`${loading ? "blinking-animation" : ""} far fa-circle`}
            data-c-color="white"
          />
        </li>
      );
    case "error":
      return (
        <li key={link.title}>
          <span data-c-visibility="invisible">
            <FormattedMessage
              id="application.progressbar.errorStepLabel"
              defaultMessage="Error: "
              description="Visually hidden text used to indicate the steps with errors."
            />
          </span>
          <a
            href={link.url}
            title={link.title}
            onClick={(e) => {
              e.preventDefault();
              navigate(link.url);
            }}
          >
            <span data-c-visibility="invisible">{link.text}</span>
            <i
              className={`${
                loading ? "blinking-animation" : ""
              } fas fa-exclamation-circle`}
              data-c-color="stop"
            />
          </a>
        </li>
      );
    default:
      return (
        <li key={link.title} title={link.title}>
          <span data-c-visibility="invisible">{link.text}</span>
          <i className="fas fa-circle" data-c-color="white" />
        </li>
      );
  }
};

export interface ProgressBarProps {
  /** The closing date of the job poster. */
  closeDateTime: Date | null;
  /** The current step number. This is required for the informational steps, since they do not use a list item. */
  currentTitle: string;
  /** List of the steps. */
  steps: { link: Link; status: ProgressBarStatus; loading: boolean }[];
}

export const ProgressBar: React.FunctionComponent<ProgressBarProps> = ({
  steps,
  closeDateTime,
  currentTitle,
}) => {
  const intl = useIntl();
  const locale = getLocale(intl.locale);

  return (
    <div data-c-background="black(100)" data-c-padding="tb(1)">
      <div data-c-container="large">
        <div data-c-grid="gutter(all, 1)">
          <div data-c-grid-item="tl(1of2)" data-c-align="base(center) tl(left)">
            <span data-c-color="white">{currentTitle}</span>
            <ol className="applicant-application-progress-bar">
              {steps.map(
                ({ link, status, loading }): React.ReactElement =>
                  createStep(link, status, loading),
              )}
            </ol>
          </div>
          <div
            data-c-grid-item="tl(1of2)"
            data-c-align="base(center) tl(right)"
          >
            <span data-c-color="white">
              <FormattedMessage
                id="application.progressbar.applicationDeadline"
                defaultMessage="Application Deadline: {timeLeft}"
                description="Label for the application deadline"
                values={{
                  timeLeft: closeDateTime
                    ? readableTimeFromNow(locale, closeDateTime)
                    : "",
                }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
