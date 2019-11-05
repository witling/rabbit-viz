import * as React from 'react';

import { createDefaultClusterDefinition, IClusterDefinition } from '../store/ClusterDefinition';
import { createDefaultViewState, IViewState } from '../store/ViewState';
import { createDefaultConnectionState, IConnectionState } from './Connection';

export const ClusterDefinitionContext = React.createContext<IClusterDefinition>(createDefaultClusterDefinition());

export const ViewStateContext = React.createContext<IViewState>(createDefaultViewState());

export const ConnectionStateContext = React.createContext<IConnectionState>(createDefaultConnectionState());