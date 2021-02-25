import {
  EmptyState,
  OptionList,
  Card,
  TextField,
  Frame,
  Page,
  Button,
  Select,
  DisplayText,
  TextStyle,
  Toast,
  Layout,
} from "@shopify/polaris";
import { Context } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import store from "store-js";
import { v4 as uuidv4 } from "uuid";
import { useState, useCallback } from "react";
import InputForm from "./components/InputForm";

class Index extends React.Component {
  static contextType = Context;

  state = {
    open: false,
    selectedInputs: {},
    subProductValues: {},
  };

  // componentDidMount() {
  //   const result = someAPICall();

  //   this.setState({
  //     subProductValues: result
  //   })
  // }

  componentWillUnmount() {
    store.remove("item");
  }

  render() {
    const options = [
      { label: "Select", value: "select" },
      { label: "Text", value: "text" },
      { label: "Checkbox", value: "checkbox" },
    ];
    const Lmao = (props) => {
      const [selectedLabel, setValue] = useState("");
      const [selectedInputs, setInputs] = useState({});
      const [toastText, setToastText] = useState("");

      const [active, setActive] = useState(false);
      const toggleActive = useCallback(
        () => setActive((active) => !active),
        []
      );
      const toastMarkup = active ? (
        <Toast content={toastText} onDismiss={toggleActive} duration={2000} />
      ) : null;

      const handleChange = useCallback((newValue) => setValue(newValue), []);

      const [selectedType, setType] = useState("select");
      const handleSelectChange = useCallback(
        (newValue) => setType(newValue),
        []
      );

      const handleButton = () => {
        if (selectedLabel === "") {
          setToastText("Name of field is empty.");
          toggleActive();
          return;
        }
        const newRandomId = uuidv4();
        const newInput = {
          id: newRandomId,
          value: "",
          input: selectedType,
          label: selectedLabel,
        };
        setInputs((prevState) => ({
          ...prevState,
          [newInput.id]: newInput,
        }));
      };

      const deleteInput = (uniqueId) => {
        delete selectedInputs[uniqueId];
        setInputs({ ...selectedInputs });
      };

      const handleSubProductChange = (val, id) => {
        setInputs((prevState) => {
          return { ...prevState, [id]: val };
        });
      };

      const { yeet } = props;
      if (yeet.length) {
        return (
          <Card>
            <Card.Section>
              <DisplayText size="medium">Currently editing {yeet}</DisplayText>
              <TextField
                label="Name of custom field"
                onChange={handleChange}
                value={selectedLabel}
              />
              <Select
                label="Add Field"
                helpText="* limit of 5 additional fields"
                options={options}
                onChange={handleSelectChange}
                value={selectedType}
                id="add-inputs"
              />
              <Button primary onClick={handleButton}>
                Add custom {selectedType}
              </Button>
            </Card.Section>

            {Object.keys(selectedInputs).map((val, key) => {
              return (
                <Card.Section
                  key={key}
                  title={
                    <DisplayText size="small">
                      Custom {selectedInputs[val].input}
                    </DisplayText>
                  }
                  actions={[
                    {
                      content: "Delete",
                      destructive: true,
                      onAction: () => deleteInput(val),
                    },
                  ]}
                >
                  <InputForm
                    key={key}
                    subProductValues={selectedInputs[val]}
                    handleSubProductChange={handleSubProductChange}
                  />
                </Card.Section>
              );
            })}
            {toastMarkup}
          </Card>
        );
      } else {
        return (
          <Card>
            <Card.Section>
              <EmptyState heading="No option set selected.">
                <p>Please select an option set from above, or create one.</p>
              </EmptyState>
            </Card.Section>
          </Card>
        );
      }
    };

    const EditProuct = (props) => {
      const [selected, setSelected] = useState([]);
      const [optionSets, setOptionSets] = useState([]);

      const yeetus = useCallback((yeet) => {
        setSelected(yeet);
      }, []);

      const [newOptionSet, setOptionSet] = useState("");

      const handleNewOptionSet = useCallback(
        (newValue) => setOptionSet(newValue),
        []
      );
      const [toastText, setToastText] = useState("");

      const [active, setActive] = useState(false);
      const toggleActive = useCallback(
        () => setActive((active) => !active),
        []
      );
      const toastMarkup = active ? (
        <Toast content={toastText} onDismiss={toggleActive} duration={2000} />
      ) : null;

      const addOptionSet = (e) => {
        const trimmed = newOptionSet.trim();
        console.log(trimmed);
        if (trimmed === "") {
          setToastText("Option set is empty.");
          toggleActive();
          return;
        }
        const arrayYeet = {
          value: trimmed,
          label: trimmed,
        };
        if (!optionSets.some((e) => e.label === trimmed)) {
          setOptionSets((prevState) => [...prevState, arrayYeet]);
        } else {
          setToastText("Option set already exists.");

          toggleActive();
        }
      };
      return (
        <Page
          title={`Option Sets`}
          primaryAction={{
            content: "Save",
          }}
        >
          <Frame>
            <Card
              primaryFooterAction={{
                content: "Create Option Set",
                onAction: addOptionSet,
              }}
            >
              <Card.Section>
                <TextField
                  label="Create New Option Set"
                  value={newOptionSet}
                  onChange={handleNewOptionSet}
                />
              </Card.Section>
              {toastMarkup}
            </Card>

            <Card>
              <Card.Section title="Available Option Sets">
                {optionSets.length ? (
                  <OptionList
                    onChange={yeetus}
                    options={optionSets}
                    selected={selected}
                  />
                ) : (
                  <TextStyle variation="subdued">
                    No Option Sets Found
                  </TextStyle>
                )}
              </Card.Section>
            </Card>
            <Card>
              <Lmao yeet={selected} />
            </Card>
          </Frame>
        </Page>
      );
    };

    return <EditProuct />;
  }
}

export default Index;
