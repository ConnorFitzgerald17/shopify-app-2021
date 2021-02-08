import {
  Layout,
  AnnotatedSection,
  Card,
  FormLayout,
  Form,
  Page,
  TextField,
  Button,
  Select,
  Frame,
  EmptyState,
  Toast,
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
    const { selectedInputs } = this.state;
    const options = [
      { label: "Select", value: "select" },
      { label: "Text", value: "text" },
      { label: "Checkbox", value: "checkbox" },
    ];

    const app = this.context;
    const redirectToProduct = () => {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, "/");
    };
    const EditProuct = (props) => {
      const [selectedLabel, setValue] = useState("");
      const [selectedInputs, setInputs] = useState({});

      const handleChange = useCallback((newValue) => setValue(newValue), []);

      const [selectedType, setType] = useState("select");
      const handleSelectChange = useCallback(
        (newValue) => setType(newValue),
        []
      );

      const handleSubProductChange = (val, id) => {
        console.log(val);
        console.log(selectedInputs[id]);
        setInputs({
          ...selectedInputs,
          [id]: val,
        });
      };

      const handleButton = () => {
        const newInput = {
          id: uuidv4(),
          value: "",
          input: selectedType,
          label: selectedLabel,
        };
        setInputs({
          ...selectedInputs,
          [newInput.id]: newInput,
        });
      };
      if (store.get("item")) {
        const { title, tags, id } = store.get("item");
        return (
          <Page
            title={`Editing ${title}`}
            primaryAction={{
              content: "Save",
            }}
          >
            <Layout>
              <Layout.AnnotatedSection
                title="Products Tags"
                description={tags ? tags : "No Tags"}
              >
                <Card sectioned>
                  <Card.Section>
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
                    <Button onClick={handleButton}>
                      Add custom {selectedType}
                    </Button>
                  </Card.Section>
                  {Object.keys(selectedInputs).map((val, key) => {
                    return (
                      <InputForm
                        key={key}
                        subProductValues={selectedInputs[val]}
                        handleSubProductChange={handleSubProductChange}
                      />
                    );
                  })}
                </Card>
              </Layout.AnnotatedSection>
            </Layout>
          </Page>
        );
      } else {
        return (
          <EmptyState
            heading="No Product Selected"
            action={{
              content: "Select Products",
              onAction: () => redirectToProduct(),
            }}
            fullWidth={false}
            image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
            imageContained={false}
          >
            <p>Please select a product before returning to this page.</p>
          </EmptyState>
        );
      }
    };

    return <EditProuct />;
  }
}

export default Index;
