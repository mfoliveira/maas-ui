import { useEffect } from "react";

import {
  Button,
  Col,
  Icon,
  MainTable,
  Row,
  Spinner,
  Strip,
} from "@canonical/react-components";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import TableHeader from "app/base/components/TableHeader";
import { useTableSort } from "app/base/hooks";
import { SortDirection } from "app/base/types";
import CPUColumn from "app/kvm/components/CPUColumn";
import NameColumn from "app/kvm/components/NameColumn";
import RAMColumn from "app/kvm/components/RAMColumn";
import StorageColumn from "app/kvm/components/StorageColumn";
import TagsColumn from "app/kvm/components/TagsColumn";
import { KVMHeaderViews } from "app/kvm/constants";
import type { KVMSetHeaderContent } from "app/kvm/types";
import kvmURLs from "app/kvm/urls";
import podSelectors from "app/store/pod/selectors";
import type { Pod } from "app/store/pod/types";
import { actions as poolActions } from "app/store/resourcepool";
import poolSelectors from "app/store/resourcepool/selectors";
import type { ResourcePool } from "app/store/resourcepool/types";
import type { RootState } from "app/store/root/types";
import type { VMCluster } from "app/store/vmcluster/types";
import { isComparable } from "app/utils";

type Props = {
  clusterId: VMCluster["id"];
  setHeaderContent: KVMSetHeaderContent;
};

type SortKey = keyof Pod | "cpu" | "pool" | "ram" | "storage" | "vms";

const getSortValue = (
  sortKey: SortKey,
  pod: Pod,
  pools?: ResourcePool[]
): string | number | null => {
  const { cores, memory, storage, vm_count } = pod.resources;
  const pool = pools?.find((pool) => pod.pool === pool.id);
  switch (sortKey) {
    case "pool":
      return pool?.name || "unknown";
    case "cpu":
      return cores.allocated_tracked;
    case "ram":
      return (
        memory.general.allocated_tracked + memory.hugepages.allocated_tracked
      );
    case "storage":
      return storage.allocated_tracked;
    case "vms":
      return vm_count.tracked;
  }
  const value = pod[sortKey];
  return isComparable(value) ? value : null;
};

const generateRows = (
  clusterId: VMCluster["id"],
  clusterHosts: Pod[],
  pools: ResourcePool[],
  setHeaderContent: KVMSetHeaderContent
) =>
  clusterHosts.map((host) => {
    const pool = pools.find((pool) => pool.id === host.pool);
    return {
      key: `cluster-host-${host.id}`,
      columns: [
        {
          className: "name-col",
          content: (
            <NameColumn
              name={host.name}
              secondary={host.power_parameters.power_address}
              url={kvmURLs.lxd.cluster.vms.host({ clusterId, hostId: host.id })}
            />
          ),
        },
        {
          className: "vms-col u-align--right",
          content: host.resources.vm_count.tracked,
        },
        {
          className: "tags-col",
          content: <TagsColumn tags={host.tags} />,
        },
        {
          className: "pool-col",
          content: <span data-test="host-pool-name">{pool?.name}</span>,
        },
        {
          className: "cpu-col",
          content: (
            <CPUColumn
              cores={host.resources.cores}
              overCommit={host.cpu_over_commit_ratio}
            />
          ),
        },
        {
          className: "ram-col",
          content: (
            <RAMColumn
              memory={host.resources.memory}
              overCommit={host.memory_over_commit_ratio}
            />
          ),
        },
        {
          className: "storage-col",
          content: (
            <StorageColumn
              defaultPoolID={host.default_storage_pool}
              podId={host.id}
              storage={host.resources.storage}
            />
          ),
        },
        {
          className: "actions-col",
          content: (
            <div className="u-flex--end">
              <Button
                className="no-background u-no-margin"
                hasIcon
                data-test="vm-host-compose"
                onClick={() =>
                  setHeaderContent({
                    view: KVMHeaderViews.COMPOSE_VM,
                    extras: { hostId: host.id },
                  })
                }
              >
                <Icon name="plus" />
              </Button>
              <div className="u-nudge-right--small">
                <Button
                  className="no-background u-no-margin"
                  data-test="vm-host-settings"
                  element={Link}
                  hasIcon
                  to={kvmURLs.lxd.cluster.host.edit({
                    clusterId,
                    hostId: host.id,
                  })}
                >
                  <Icon name="settings" />
                </Button>
              </div>
            </div>
          ),
        },
      ],
    };
  });

const LXDClusterHostsTable = ({
  clusterId,
  setHeaderContent,
}: Props): JSX.Element => {
  const dispatch = useDispatch();
  const clusterHosts = useSelector((state: RootState) =>
    podSelectors.lxdHostsInClusterById(state, clusterId)
  );
  const pools = useSelector(poolSelectors.all);
  const podsLoaded = useSelector(podSelectors.loaded);
  const poolsLoaded = useSelector(poolSelectors.loaded);
  const loaded = poolsLoaded && podsLoaded;
  const { currentSort, sortRows, updateSort } = useTableSort<
    Pod,
    SortKey,
    ResourcePool[]
  >(getSortValue, {
    key: "name",
    direction: SortDirection.DESCENDING,
  });
  const sortedClusterHosts = sortRows(clusterHosts, pools);

  useEffect(() => {
    dispatch(poolActions.fetch());
  }, [dispatch]);

  return (
    <Row>
      <Col size={12}>
        <MainTable
          className="lxd-cluster-hosts-table"
          headers={[
            {
              className: "name-col",
              content: (
                <>
                  <TableHeader
                    currentSort={currentSort}
                    data-test="name-header"
                    onClick={() => updateSort("name")}
                    sortKey="name"
                  >
                    KVM host
                  </TableHeader>
                  <TableHeader>Address</TableHeader>
                </>
              ),
            },
            {
              className: "vms-col u-align--right",
              content: (
                <TableHeader
                  currentSort={currentSort}
                  data-test="vms-header"
                  onClick={() => updateSort("vms")}
                  sortKey="vms"
                >
                  VM<span className="u-no-text-transform">s</span>
                </TableHeader>
              ),
            },
            {
              className: "tags-col",
              content: <TableHeader data-test="tags-header">Tags</TableHeader>,
            },
            {
              className: "pool-col",
              content: (
                <TableHeader
                  data-test="pool-header"
                  currentSort={currentSort}
                  onClick={() => updateSort("pool")}
                  sortKey="pool"
                >
                  Resource pool
                </TableHeader>
              ),
            },
            {
              className: "cpu-col",
              content: (
                <TableHeader
                  data-test="cpu-header"
                  currentSort={currentSort}
                  onClick={() => updateSort("cpu")}
                  sortKey="cpu"
                >
                  CPU cores
                </TableHeader>
              ),
            },
            {
              className: "ram-col",
              content: (
                <TableHeader
                  data-test="ram-header"
                  currentSort={currentSort}
                  onClick={() => updateSort("ram")}
                  sortKey="ram"
                >
                  RAM
                </TableHeader>
              ),
            },
            {
              className: "storage-col",
              content: (
                <TableHeader
                  data-test="storage-header"
                  currentSort={currentSort}
                  onClick={() => updateSort("storage")}
                  sortKey="storage"
                >
                  Storage
                </TableHeader>
              ),
            },
            {
              className: "actions-col",
              content: null,
            },
          ]}
          paginate={50}
          rows={
            loaded
              ? generateRows(
                  clusterId,
                  sortedClusterHosts,
                  pools,
                  setHeaderContent
                )
              : []
          }
        />
        {!loaded && (
          <Strip className="u-align--center" data-test="loading" shallow>
            <Spinner text="Loading..." />
          </Strip>
        )}
      </Col>
    </Row>
  );
};

export default LXDClusterHostsTable;