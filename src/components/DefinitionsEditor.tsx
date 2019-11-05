import * as React from 'react';
//import { UnControlled as CodeMirror } from 'react-codemirror2';

import { ClusterDefinitionContext } from '../store/Contexts';
import LoadPanel from './LoadPanel';

// tslint:disable-next-line:no-var-requires
require('codemirror/mode/javascript/javascript');

interface IEditorState {
  code: string
}

class DefinitionsEditor extends React.Component<{}, IEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      code: ""
    };
  }

  public render() {
    return (
      <ClusterDefinitionContext.Consumer>
        {clusterDefinition => (
          <div>
            <LoadPanel />
            {/*<CodeMirror
              value={this.state.code}
              options={{
                lineNumbers: true,
                mode: 'application/json',
                theme: 'material'
              }}
              onChange={clusterDefinition.validate} />
              */}
          </div>
        )}
      </ClusterDefinitionContext.Consumer>
    );
  }
}

export default DefinitionsEditor;