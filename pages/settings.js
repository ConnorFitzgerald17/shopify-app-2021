import { EmptyState, Layout, Page, Button, Form } from "@shopify/polaris";
import { parseGid } from "@shopify/admin-graphql-api-utilities";

class Index extends React.Component {
  state = {
    open: false,
  };

  render() {
    return (
      <Page
        title="App Settings"
        primaryAction={{
          content: "Save",
        }}
      ></Page>
    );
  }
}

export default Index;
