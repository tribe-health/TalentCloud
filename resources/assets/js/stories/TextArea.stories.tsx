import React from "react";
import { storiesOf } from "@storybook/react";
import { text, boolean, number } from "@storybook/addon-knobs";
import { withIntl } from "storybook-addon-intl";
import { action } from "@storybook/addon-actions";
import TextArea from "../components/TextArea";

const stories = storiesOf("Form Components/TextArea", module).addDecorator(
  withIntl,
);

stories.add(
  "Plain",
  (): React.ReactElement => {
    const addWordLimit = boolean("Add Word Limit", false);
    const wordLimit = number("Word Limit", 100);
    return (
      <div data-c-margin="top(triple) rl(double)">
        <TextArea
          id={text("ID", "sample-input")}
          name={text("Name", "What a name")}
          label={text("Label", "Plain old textarea")}
          required={boolean("Required", false)}
          invalid={boolean("Invalid", false)}
          placeholder={text("Placeholder", "Put some text in this area.")}
          grid="base(1of1)"
          minLength={number("Minimum Length", 0)}
          maxLength={number("Maximum Length", 30)}
          value={text("Value", "")}
          errorText={text("Error Text", "")}
          onChange={action("Contents changed")}
          onBlur={action("Lost focus")}
          wordLimit={addWordLimit ? wordLimit : undefined}
          rightMessage={
            <span data-c-color="black">
              {text("Right message", "Extra msg")}
            </span>
          }
        />
      </div>
    );
  },
);
