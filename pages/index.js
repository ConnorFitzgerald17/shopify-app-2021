import {
  EmptyState,
  Page,
  Card,
  TextStyle,
  ResourceList,
  TextContainer,
  Badge,
  Heading,
  Button,
  Stack,
} from "@shopify/polaris";
import { ResourcePicker, Context } from "@shopify/app-bridge-react";
import { parseGid, composeGid } from "@shopify/admin-graphql-api-utilities";
import { Redirect } from "@shopify/app-bridge/actions";
import axios from "axios";
import store from "store-js";

const HOST = "https://a4c37fd0c249.ngrok.io";

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

    let previousSelected = this.state.listOfProducts.map((list) => {
      return list.id.toString();
    });

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

    const promotedBulkActions = [
      {
        content: "Remove Product",
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
        <p>
          You can use the Files section to upload images, videos, and other
          documents
        </p>
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
        <Card title="Online store dashboard" sectioned>
          <ResourceList
            emptyState={emptyStateMarkup}
            loading={this.state.isLoading}
            showHeader
            selectedItems={this.state.selectedItems}
            onSelectionChange={(products) =>
              this.handleProductListSelection(products)
            }
            selectable
            items={this.state.listOfProducts}
            promotedBulkActions={promotedBulkActions}
            renderItem={(item) => {
              const { id, title, tags, images } = item;
              return (
                <ResourceList.Item id={id}>
                  <Stack distribution="equalSpacing">
                    <Stack.Item>
                      <TextContainer spacing="loose">
                        <Heading>
                          <TextStyle variation="strong">{title}</TextStyle>
                        </Heading>
                        <Badge size="small" status="info">
                          Tags: {tags ? tags : "No Tags"}
                        </Badge>
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
                        Edit product
                      </Button>
                    </Stack.Item>
                  </Stack>
                </ResourceList.Item>
              );
            }}
          ></ResourceList>
        </Card>
      </Page>
    );
  }
}

export default Index;
