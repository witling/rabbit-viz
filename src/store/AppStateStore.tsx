import produce from 'immer';
import * as React from 'react';
import { createDefaultClusterDefinition, IClusterDefinition, IDefinition } from './ClusterDefinition';
import { ConnectionStateContext, ClusterDefinitionContext, ViewStateContext } from './Contexts';
import { createDefaultConnectionState, IConnectionState } from './Connection';
import { createDefaultViewState, IViewState } from './ViewState';

interface IAppState {
  clusterDefinition: IClusterDefinition,
  viewState: IViewState,
  connectionState: IConnectionState,
}

export default class AppStateStore extends React.Component<{}, IAppState> {
  constructor(props) {
    super(props);

    this.state = {
      clusterDefinition: produce<IClusterDefinition>(createDefaultClusterDefinition(), draft => {
        draft.validate = this.validateDefinitionsJson.bind(this)
      }),

      viewState: produce<IViewState>(createDefaultViewState(), draft => {
        draft.selectVhost = (evt, data) => {
          this.setState(produce<IAppState>(next => {
            next.viewState.currentVhost = data.value;
          }));
        };

        draft.setZoomFunction = (callback: () => void) => {
          this.setState(produce<IAppState>(next => {
            next.viewState.zoomToFit = callback;
          }));
        };

        draft.toggleShowRoutingKeys = () => {
          this.setState(produce<IAppState>(next => {
            next.viewState.showRoutingKeys = !next.viewState.showRoutingKeys;
          }));
        };

        draft.toggleShowConnections = () => {
          this.setState(produce<IAppState>(next => {
            next.viewState.showConnections = !next.viewState.showConnections;
          }))
        };
      }),

      connectionState: produce<IConnectionState>(createDefaultConnectionState(), draft => {
        draft.update = (consumers) => {
          this.setState(produce<IAppState>(next => {
            next.connectionState.consumers = consumers;
          }));
        };
      }),
    }
  }

  public render() {
    return (
      <ViewStateContext.Provider value={this.state.viewState}>
        <ClusterDefinitionContext.Provider value={this.state.clusterDefinition}>
          <ConnectionStateContext.Provider value={this.state.connectionState}>
            {this.props.children}
          </ConnectionStateContext.Provider>
        </ClusterDefinitionContext.Provider>
      </ViewStateContext.Provider>
    );
  }

  private validateDefinitionsJson(editor: any, data: any, value: string) {
    if (value.length > 0) {
      try {
        const valueJson = JSON.parse(value);

        valueJson.vhosts = valueJson.vhosts.sort((v1, v2) => {
          if (v1.name > v2.name) { return 1; }
          if (v1.name < v2.name) { return -1; }
          return 0;
        });

        this.setState(produce<IAppState>(draft => {
          draft.clusterDefinition.isValid = true;
          draft.viewState.errors = [];
          draft.clusterDefinition.definition = valueJson as IDefinition;
        }));
      } catch (error) {
        this.setState(produce<IAppState>(draft => {
          draft.clusterDefinition.isValid = false;
          draft.viewState.errors = [(error as Error).message];
          draft.clusterDefinition.definition = {
            bindings: [],
            exchanges: [],
            parameters: [],
            policies: [],
            queues: [],
            vhosts: []
          };
        }));
        return;
      }
    }
    else {
      this.setState(produce<IAppState>(draft => {
        draft.clusterDefinition.isValid = true;
        draft.viewState.errors = [];
        draft.clusterDefinition.definition = {
          bindings: [],
          exchanges: [],
          parameters: [],
          policies: [],
          queues: [],
          vhosts: []
        };
      }));
    }
  }
}