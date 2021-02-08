import { Modal, TextContainer } from "@shopify/polaris";
import { parseGid, composeGid } from "@shopify/admin-graphql-api-utilities";
import axios from "axios";

const HOST = "https://5599621a1176.ngrok.io";

const EditModal = (props) => {
  const [active, setActive] = React.useState(false);
  const { selectedProduct } = props;
  const handleChange = React.useCallback(() => setActive(!active), [active]);
  console.log(selectedProduct);
  return (
    <Modal
      open={active}
      large={true}
      title={`Edit yeet`}
      primaryAction={{
        content: "Add Instagram",
        onAction: handleChange,
      }}
      secondaryActions={[
        {
          content: "Learn more",
          onAction: handleChange,
        },
      ]}
    >
      <Modal.Section>
        <TextContainer>
          <p>
            Use Instagram posts to share your products with millions of people.
            Let shoppers buy from your store without leaving Instagram.
          </p>
        </TextContainer>
      </Modal.Section>
    </Modal>
  );
};

export default EditModal;
