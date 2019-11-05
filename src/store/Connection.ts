import produce from 'immer';
import { IQueue } from './ClusterDefinition';

/*
export interface IClientProperties {
  conntected: string;
  connection_name: string | undefined;
  machine_name: string;
  platform: string;
  user: string;
  version: string;
}
*/

export interface IChannel {
  connection_name: string,
  name: string,
  node: string,
  peer_host: string,
  peer_port: string,
  user: string,
}

export interface IConsumer {
  active: boolean,
  channel_details: IChannel,
  queue: IQueue,
}

export interface IConnectionState {
  consumers: IConsumer[],
  update?: (consumers: IConsumer[]) => void,
}

export function createDefaultConnectionState() : IConnectionState {
  return {
    consumers: [],
    update: (consumers: IConsumer[]) => null,
  };
}