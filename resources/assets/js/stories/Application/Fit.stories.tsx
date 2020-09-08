/* eslint-disable @typescript-eslint/camelcase */
import React from "react";
import { storiesOf } from "@storybook/react";
import { withIntl } from "storybook-addon-intl";
import { action } from "@storybook/addon-actions";
import Fit from "../../components/Application/Fit/Fit";
import {
  fakeJobQuestions,
  fakeJobApplicationAnswers,
} from "../../fakeData/fakeJob";

const stories = storiesOf("Application|Fit", module).addDecorator(withIntl);

stories.add(
  "Fit",
  (): React.ReactElement => (
    <Fit
      jobQuestions={fakeJobQuestions()}
      jobApplicationAnswers={fakeJobApplicationAnswers()}
      handleSubmit={async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        action("Confirmed")(x);
      }}
      handleContinue={action("Save and Continue")}
      handleQuit={action("Save and Quit")}
      handleReturn={action("Save and Return")}
    />
  ),
);