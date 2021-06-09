import type {
  BootResourceAction,
  BootResourceSourceType,
  BootResourceType,
} from "./enum";

import type { Model } from "app/store/types/model";

export type BootResourceStatuses = {
  [BootResourceAction.POLL]: boolean;
};

export type BootResource = Model & {
  arch: string;
  complete: boolean;
  downloading: boolean;
  icon: "in-progress" | "queued" | "succeeded" | "waiting";
  lastUpdate: string;
  name: string;
  numberOfNodes: number;
  rtype: BootResourceType;
  size: string;
  status: string;
  title: string;
};

export type BootResourceUbuntuSource = {
  keyring_data: string;
  keyring_filename: string;
  source_type: BootResourceSourceType;
  url: string;
};

export type BootResourceUbuntuRelease = {
  checked: boolean;
  deleted: boolean;
  name: string;
  title: string;
  unsupported_arches: string[];
};

export type BootResourceUbuntuArch = {
  checked: boolean;
  deleted: boolean;
  name: string;
  title: string;
};

export type BootResourceUbuntu = {
  arches: BootResourceUbuntuArch[];
  commissioning_series: string;
  releases: BootResourceUbuntuRelease[];
  sources: BootResourceUbuntuSource[];
};

export type BootResourceOtherImage = {
  checked: boolean;
  deleted: boolean;
  name: string;
  title: string;
};
export type BootResourceUbuntuCoreImage = {
  checked: boolean;
  deleted: boolean;
  name: string;
  title: string;
};

export type BootResourceEventError = {
  error: string;
  event: string;
};

export type BootResourceState = {
  connectionError: boolean;
  eventErrors: BootResourceEventError[];
  otherImages: BootResourceOtherImage[];
  rackImportRunning: boolean;
  regionImportRunning: boolean;
  resources: BootResource[];
  statuses: BootResourceStatuses;
  ubuntu: BootResourceUbuntu | null;
  ubuntuCoreImages: BootResourceUbuntuCoreImage[];
};