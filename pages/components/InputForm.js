import {
  TextField,
  Checkbox,
  ChoiceList,
  Select,
  Subheading,
  TextStyle,
  Stack,
  Layout,
} from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";

export default function InputForm(props) {
  const { id } = props.subProductValues;
  const [data, setData] = useState(props.subProductValues);

  const [selected, setSelected] = useState("hidden");
  const handleSelectChange = useCallback((value) => setSelected(value), []);

  const [hideLabel, setHideLabel] = useState(true);
  const handleHideLabel = useCallback(
    (newChecked) => setHideLabel(newChecked),
    []
  );

  const [choiceList, setChoiceList] = useState(["hidden"]);

  const handleChoiceList = useCallback((value) => setChoiceList(value), []);

  const handleChange = useCallback(
    (newValue) => {
      setData((prevState) => {
        return { ...prevState, value: newValue };
      });
      updateParent();
    },
    [data]
  );

  const updateParent = () => {
    Preview();
    props.handleSubProductChange(data, id);
  };

  const Preview = () => {
    const { value, label } = data;
    const optionList = [];
    const options = value.split("\n");

    for (let i = 0; i < options.length; i++) {
      if (options[i] !== "") {
        optionList.push({
          label: options[i],
          value: options[i].replace(/\s+/g, "-").toLowerCase(),
        });
      }
    }
    if (data.input === "select" && optionList !== "") {
      return (
        <Select
          label={hideLabel ? "" : label}
          options={optionList}
          onChange={handleSelectChange}
          value={selected}
        />
      );
    }

    if (data.input === "checkbox" && optionList !== "") {
      return (
        <ChoiceList
          title="Cuatom Options"
          label={label}
          choices={optionList}
          selected={choiceList}
          onChange={handleChoiceList}
          allowMultiple={true}
          titleHidden={true}
        />
      );
    }
    return <TextStyle variation="subdued">No supplier listed</TextStyle>;
  };

  return (
    <Stack distribution="fill">
      <Layout.Section>
        <Subheading>{`${data.label} options`}</Subheading>
        <TextField onChange={handleChange} value={data.value} multiline />
        {data.input === "select" ? (
          <Checkbox
            label="Hide Label"
            checked={hideLabel}
            onChange={handleHideLabel}
          />
        ) : undefined}
      </Layout.Section>
      <Layout.Section secondary>
        <Subheading>Preview</Subheading>
        <Preview />
      </Layout.Section>
    </Stack>
  );
}
