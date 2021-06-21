import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import DashboardConfigurationSubnetForm from "./DashboardConfigurationSubnetForm";

import { actions as subnetActions } from "app/store/subnet";
import {
  fabric as fabricFactory,
  fabricState as fabricStateFactory,
  rootState as rootStateFactory,
  subnet as subnetFactory,
  subnetState as subnetStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("DashboardConfigurationSubnetForm", () => {
  it("displays a spinner if subnets have not loaded", () => {
    const state = rootStateFactory({
      subnet: subnetStateFactory({ loaded: false }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <DashboardConfigurationSubnetForm />
      </Provider>
    );

    expect(wrapper.find("Spinner").exists()).toBe(true);
  });

  it("displays a spinner if fabrics have not loaded", () => {
    const state = rootStateFactory({
      fabric: fabricStateFactory({ loaded: false }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <DashboardConfigurationSubnetForm />
      </Provider>
    );

    expect(wrapper.find("Spinner").exists()).toBe(true);
  });

  it("renders the form if fabrics and subnets have loaded", () => {
    const state = rootStateFactory({
      fabric: fabricStateFactory({ loaded: true }),
      subnet: subnetStateFactory({ loaded: true }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <DashboardConfigurationSubnetForm />
      </Provider>
    );

    expect(wrapper.find("FormikForm").exists()).toBe(true);
  });

  it("displays links for the subnet and its fabric", () => {
    const subnet = subnetFactory({ id: 1, active_discovery: true, vlan: 2 });
    const fabric = fabricFactory({ id: 3, vlan_ids: [2] });
    const state = rootStateFactory({
      fabric: fabricStateFactory({ items: [fabric], loaded: true }),
      subnet: subnetStateFactory({ items: [subnet], loaded: true }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <DashboardConfigurationSubnetForm />
      </Provider>
    );

    expect(wrapper.find("a[data-test='subnet-link']").prop("href")).toBe(
      "/MAAS/l/subnet/1"
    );
    expect(wrapper.find("a[data-test='fabric-link']").prop("href")).toBe(
      "/MAAS/l/fabric/3"
    );
  });

  it("dispatches actions to update subnet active discovery if they have changed", () => {
    const subnets = [
      subnetFactory({ id: 1, active_discovery: true }),
      subnetFactory({ id: 2, active_discovery: true }),
      subnetFactory({ id: 3, active_discovery: false }),
      subnetFactory({ id: 4, active_discovery: false }),
    ];
    const state = rootStateFactory({
      fabric: fabricStateFactory({ loaded: true }),
      subnet: subnetStateFactory({ items: subnets, loaded: true }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <DashboardConfigurationSubnetForm />
      </Provider>
    );
    wrapper.find("Formik").invoke("onSubmit")(
      {
        1: true, // true to true = unchanged
        2: false, // true to false = changed
        3: true, // false to true = changed
        4: false, // false to false = unchanged
      },
      { resetForm: jest.fn() }
    );

    const expectedActions = [
      subnetActions.update({ id: 2, active_discovery: false }),
      subnetActions.update({ id: 3, active_discovery: true }),
    ];
    const actualActions = store.getActions();
    expect(
      actualActions.filter((action) => action.type === "subnet/update")
    ).toStrictEqual(expectedActions);
  });
});