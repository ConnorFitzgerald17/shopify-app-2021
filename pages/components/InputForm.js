import {
  TextField,
  Card,
  ChoiceList,
  Select,
  Frame,
  TextStyle,
  FormLayout,
} from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";

export default function InputForm(props) {
  const { id } = props.subProductValues;
  const [data, setData] = useState(props.subProductValues);

  const [selected, setSelected] = useState("hidden");
  const handleSelectChange = useCallback((value) => setSelected(value), []);

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
    const { value } = data;
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
          label="Preview"
          options={optionList}
          onChange={handleSelectChange}
          value={selected}
        />
      );
    }

    if (data.input === "checkbox" && optionList !== "") {
      return (
        <ChoiceList
          title="Company name"
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
    <Card.Section>
      <TextField
        label={`${data.label} options`}
        onChange={handleChange}
        value={data.value}
        multiline
      />
      <Preview />
    </Card.Section>
  );
}
