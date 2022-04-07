import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import AddTagForm, { Label } from "./AddTagForm";

import * as baseHooks from "app/base/hooks/base";
import type { RootState } from "app/store/root/types";
import { actions as tagActions } from "app/store/tag";
import { Label as KernelOptionsLabel } from "app/tags/components/KernelOptionsField";
import tagsURLs from "app/tags/urls";
import {
  tag as tagFactory,
  rootState as rootStateFactory,
  tagState as tagStateFactory,
} from "testing/factories";

const mockStore = configureStore();

let state: RootState;

beforeEach(() => {
  state = rootStateFactory({
    tag: tagStateFactory(),
  });
  jest
    .spyOn(baseHooks, "useCycled")
    .mockImplementation(() => [false, () => null]);
});

afterEach(() => {
  jest.restoreAllMocks();
});

it("dispatches an action to create a tag", async () => {
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: "/tags", key: "testKey" }]}>
        <AddTagForm name="new-tag" onTagCreated={jest.fn()} />
      </MemoryRouter>
    </Provider>
  );
  userEvent.type(
    screen.getByRole("textbox", { name: Label.Comment }),
    "comment1"
  );
  userEvent.type(
    screen.getByRole("textbox", { name: KernelOptionsLabel.KernelOptions }),
    "options1"
  );
  fireEvent.submit(screen.getByRole("form"));
  const expected = tagActions.create({
    comment: "comment1",
    kernel_opts: "options1",
    name: "new-tag",
  });
  await waitFor(() =>
    expect(
      store.getActions().find((action) => action.type === expected.type)
    ).toStrictEqual(expected)
  );
});

it("returns the newly created tag on save", async () => {
  const onTagCreated = jest.fn();
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: "/tags", key: "testKey" }]}>
        <Route
          exact
          path={tagsURLs.tags.index}
          component={() => (
            <AddTagForm name="new-tag" onTagCreated={onTagCreated} />
          )}
        />
      </MemoryRouter>
    </Provider>
  );
  // Simulate the state.tag.saved state going from `save: false` to `saved:
  // true` which happens when the tag is successfully saved. This in turn will
  // mean that the form `onSuccess` prop will get called so that the component
  // knows that the tag was created.
  jest
    .spyOn(baseHooks, "useCycled")
    .mockImplementation(() => [true, () => null]);
  const newTag = tagFactory({ id: 8, name: "new-tag" });
  state.tag = tagStateFactory({
    items: [newTag],
    saved: true,
  });
  fireEvent.submit(screen.getByRole("form"));
  await waitFor(() => expect(onTagCreated).toHaveBeenCalledWith(newTag));
});