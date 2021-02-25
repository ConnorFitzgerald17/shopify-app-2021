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
  const [customTextValue, setTextValue] = useState("");
  const handleTextChange = useCallback(
    (newValue) => setTextValue(newValue),
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

    if (value === "") {
      return <p>No Options Provided</p>;
    }

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
    if (data.input === "text" && optionList !== "") {
      return (
        <TextField
          label={hideLabel ? "" : label}
          onChange={handleTextChange}
          value={customTextValue}
        />
      );
    }
  };

  return (
    <Layout>
      <Layout.Section>
        <Subheading>Preview</Subheading>
        <Preview />
      </Layout.Section>
      <Layout.Section>
        <Subheading>{`${data.label} options`}</Subheading>
        <TextField onChange={handleChange} value={data.value} multiline />
        {data.input !== "checkbox" ? (
          <Checkbox
            label="Hide Label"
            checked={hideLabel}
            onChange={handleHideLabel}
          />
        ) : undefined}
      </Layout.Section>
    </Layout>
  );
}
