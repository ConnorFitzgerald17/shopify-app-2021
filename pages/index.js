import {
  EmptyState,
  Page,
  Card,
  TextStyle,
  ResourceList,
  TextContainer,
  ResourceItem,
  Heading,
  Button,
  Stack,
  Thumbnail,
} from "@shopify/polaris";
import { EditMajor } from "@shopify/polaris-icons";
import { ResourcePicker, Context } from "@shopify/app-bridge-react";
import { parseGid, composeGid } from "@shopify/admin-graphql-api-utilities";
import { Redirect } from "@shopify/app-bridge/actions";
import axios from "axios";
import store from "store-js";

const HOST = "https://4943b50934ce.ngrok.io";

class Index extends React.Component {
  static contextType = Context;

  state = {
    open: false,
    selectedProducts: [],
    listOfProducts: [],
    isLoading: false,
  };

  handleSeclection = async (data) => {
    let selectedIds = data.selection.map((selections) => {
      return parseGid(selections.id);
    });

    console.log(this.state.listOfProducts.length);
    let previousSelected = this.state.listOfProducts.length
      ? this.state.listOfProducts.map((list) => {
          return list.id.toString();
        })
      : null;

    const areEqual = (first, second) => {
      if (first.length !== second.length) {
        return false;
      }
      for (let i = 0; i < first.length; i++) {
        if (!second.includes(first[i])) {
          return false;
        }
      }
      return true;
    };

    if (!areEqual(selectedIds, previousSelected)) {
      await axios.post(`${HOST}/api/update_selected`, {
        id: selectedIds,
      });
      this.setState({ isLoading: true });
      await this.getProductInfo();
      this.setState({ isLoading: false });
    }

    this.setState({ open: false });
  };

  handleOpen = async () => {
    let productList = [];
    await axios.post(`${HOST}/api/get_selected`).then((res) => {
      const { products } = res.data;
      if (products) {
        products.forEach(async (id) => {
          productList.push({
            id: composeGid("Product", id),
          });
        });
      }
    });

    this.setState({
      selectedProducts: productList,
    });

    this.setState({ open: true });
  };

  async componentDidMount() {
    this.setState({ isLoading: true });
    await this.getProductInfo();
    this.setState({ isLoading: false });
  }

  getProductInfo = async () => {
    await axios.post(`${HOST}/api/get_product_info`).then((res) => {
      if (res.data.products) {
        this.setState({ listOfProducts: res.data.products });
      } else {
        this.setState({ listOfProducts: "" });
      }
    });
  };

  handleProductListSelection = (products) => {
    this.setState({ selectedItems: products });
  };

  removeProduct = async () => {
    const { listOfProducts, selectedItems } = this.state;
    let updateProducts = [];
    for (var i = 0; i < listOfProducts.length; i++) {
      updateProducts.push(listOfProducts[i].id);
    }

    const filteredItems = updateProducts.filter(
      (item) => !selectedItems.includes(item)
    );

    await axios
      .post(`${HOST}/api/remove_product`, { id: filteredItems })
      .then(() => {
        this.setState({ selectedItems: [] });
      });

    this.setState({ isLoading: true });
    await this.getProductInfo();
    this.setState({ isLoading: false });
  };

  render() {
    const app = this.context;
    const redirectToProduct = () => {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, "/edit-product");
    };
    const resourceName = {
      singular: "product",
      plural: "products",
    };

    const promotedBulkActions = [
      {
        content: "Remove Product(s)",
        onAction: this.removeProduct,
      },
    ];

    const emptyStateMarkup = !this.state.listOfProducts.length ? (
      <EmptyState
        heading="Select Products"
        action={{
          content: "Select Products",
          onAction: this.handleOpen,
        }}
        image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
      >
        <p>To begin please select a product to start editing.</p>
      </EmptyState>
    ) : undefined;
    return (
      <Page
        title="Product Selector"
        primaryAction={{
          content: "Select Products",
          onAction: this.handleOpen,
        }}
      >
        <ResourcePicker
          resourceType="Product"
          open={this.state.open}
          showVariants={false}
          initialSelectionIds={this.state.selectedProducts}
          onSelection={(resources) => this.handleSeclection(resources)}
          onCancel={() => this.setState({ open: false })}
          actionVerb={"select"}
        ></ResourcePicker>
        <Card>
          <ResourceList
            resourceName={resourceName}
            emptyState={emptyStateMarkup}
            loading={this.state.isLoading}
            selectedItems={this.state.selectedItems}
            onSelectionChange={(products) =>
              this.handleProductListSelection(products)
            }
            showHeader
            items={this.state.listOfProducts}
            promotedBulkActions={promotedBulkActions}
            renderItem={(item) => {
              const { id, title, tags, images } = item;
              let placeholder;
              if (images.length) {
                placeholder = <Thumbnail source={images[0].src} />;
              } else {
                placeholder = (
                  <Thumbnail source="https://burst.shopifycdn.com/photos/green-orange-and-yellow-ink.jpg" />
                );
              }

              return (
                <ResourceItem id={id} media={placeholder}>
                  <Stack distribution="equalSpacing">
                    <Stack.Item>
                      <TextContainer spacing="loose">
                        <Heading>
                          <TextStyle variation="strong">{title}</TextStyle>
                        </Heading>
                        <TextContainer>
                          <TextStyle>Tags: {tags ? tags : "No Tags"}</TextStyle>
                        </TextContainer>
                      </TextContainer>
                    </Stack.Item>
                    <Stack.Item>
                      <Button
                        plain
                        size="slim"
                        onClick={() => {
                          store.set("item", item);
                          redirectToProduct();
                        }}
                      >
                        <Stack>
                          <TextStyle>Edit Product</TextStyle>
                        </Stack>
                      </Button>
                    </Stack.Item>
                  </Stack>
                </ResourceItem>
              );
            }}
          />
        </Card>
      </Page>
    );
  }
}

export default Index;
