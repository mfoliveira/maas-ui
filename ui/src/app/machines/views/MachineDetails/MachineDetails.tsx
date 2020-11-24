import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";

import MachineHeader from "./MachineHeader";
import NetworkNotifications from "./MachineNetwork/NetworkNotifications";
import MachineStorage from "./MachineStorage";
import StorageNotifications from "./MachineStorage/StorageNotifications";
import MachineSummary, { SelectedAction } from "./MachineSummary";
import SummaryNotifications from "./MachineSummary/SummaryNotifications";
import MachineTests from "./MachineTests";

import Section from "app/base/components/Section";
import { actions as machineActions } from "app/store/machine";
import machineSelectors from "app/store/machine/selectors";

import type { RouteParams } from "app/base/types";
import type { RootState } from "app/store/root/types";

const MachineDetails = (): JSX.Element => {
  const dispatch = useDispatch();
  const params = useParams<RouteParams>();
  const { id } = params;
  const machine = useSelector((state: RootState) =>
    machineSelectors.getById(state, id)
  );
  const machinesLoaded = useSelector(machineSelectors.loaded);
  const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(
    null
  );

  useEffect(() => {
    dispatch(machineActions.get(id));
    // Set machine as active to ensure all machine data is sent from the server.
    dispatch(machineActions.setActive(id));

    // Unset active machine on cleanup.
    return () => {
      dispatch(machineActions.setActive(null));
    };
  }, [dispatch, id]);

  // If machine has been deleted, redirect to machine list.
  if (machinesLoaded && !machine) {
    return <Redirect to="/machines" />;
  }

  return (
    <Section
      header={
        <MachineHeader
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
        />
      }
      headerClassName="u-no-padding--bottom"
    >
      {machine && (
        <Switch>
          <Route exact path="/machine/:id/summary">
            <SummaryNotifications id={id} />
            <MachineSummary setSelectedAction={setSelectedAction} />
          </Route>
          <Route exact path="/machine/:id/network">
            <NetworkNotifications id={id} />
          </Route>
          <Route exact path="/machine/:id/storage">
            <StorageNotifications id={id} />
            <MachineStorage />
          </Route>
          <Route exact path="/machine/:id/tests">
            <MachineTests />
          </Route>
          <Route exact path="/machine/:id">
            <Redirect to={`/machine/${id}/summary`} />
          </Route>
        </Switch>
      )}
    </Section>
  );
};

export default MachineDetails;