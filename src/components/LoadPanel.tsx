import * as React from 'react';
import { Button, Icon, Input } from 'semantic-ui-react';
import Axios, { AxiosInstance } from 'axios';
import cookies from 'react-cookies'
import { ClusterDefinitionContext, ConnectionStateContext } from '../store/Contexts';
import { IConsumer, IConnectionState, createDefaultConnectionState } from '../store/Connection';

type ReloadFunction = (value: string) => void;

interface ILoadPanelState {
    apiClient: AxiosInstance | null,
    onReload: ReloadFunction,
    isConnected: boolean,
    host: string,
    username: string,
    password: string,
    connectionState: IConnectionState,
}

class LoadPanel extends React.Component<{}, ILoadPanelState> {

    constructor(props) {
        super(props);

        const host = cookies.load('host') || 'localhost:15672';
        const username = cookies.load('username') || 'guest';
        const password = cookies.load('password') || 'guest';

        this.state = {
            apiClient: null,
            onReload: props.reloadCallback,
            isConnected: false,
            host,
            username,
            password,
            connectionState: createDefaultConnectionState(),
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleReload = this.handleReload.bind(this);
    }

    async componentDidMount() {
        await this.connect();

    }

    async connect() {
        console.log('connecting...');
        try {
            const apiClient = Axios.create({
                baseURL: `http://${this.state.host}/api/`,
                timeout: 10000,
                auth: {
                    username: this.state.username,
                    password: this.state.password,
                }
            });

            await apiClient.request({ method: 'get', url: 'definitions' });

            this.setState({ apiClient, isConnected: true });

            console.log('connection successful...');
        } catch {
            this.setState({ isConnected: false });

            console.log('connection failed...');
        }
    }

    async reload(): Promise<any[]> {
        if (this.state.apiClient === null) {
            return [];
        }

        const definition = await this.state.apiClient.request({ method: 'get', url: 'definitions' });
        const consumers = await this.state.apiClient.request({ method: 'get', url: 'consumers' });

        return [definition.request.response, consumers.data as IConsumer[]];
    };

    handleConnect = e => {
        e.preventDefault();
        this.connect();
    };

    handleReload = (updateCluster, updateConsumer) => {
        return async e => {
            e.preventDefault();
            const [definition, consumers] = await this.reload();

            updateCluster(null, null, definition);
            updateConsumer(consumers);
        };
    }

    handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;

        let obj: any;
        if (name === 'host') {
            obj = { host: value };
            cookies.save('host', value, { path: '/' });
        } else if (name === 'username') {
            obj = { username: value };
            cookies.save('username', value, { path: '/' });
        } else if (name === 'password') {
            obj = { password: value };
            cookies.save('password', value, { path: '/' });
        } else {
            return;
        }

        this.setState(obj);
    };

    public render() {
        return (
            <ClusterDefinitionContext.Consumer>
                {clusterDefinition => (
                    <ConnectionStateContext.Consumer>
                        {connectionState => (
                            <form>
                                <Input
                                    name="host"
                                    label="Host"
                                    placeholder="Hostname (address:port)"
                                    onChange={this.handleChange}
                                    value={this.state.host} /><br />
                                <Input
                                    name="username"
                                    label="Username"
                                    placeholder="Username"
                                    onChange={this.handleChange}
                                    value={this.state.username} />
                                <Input
                                    type="password"
                                    name="password"
                                    label="Password"
                                    placeholder="Password"
                                    onChange={this.handleChange}
                                    value={this.state.password} /><br />
                                <Button onClick={this.handleConnect} secondary><Icon name={this.state.isConnected ? 'check' : 'ban'} /> Connect</Button>
                                <Button content="Reload" onClick={this.handleReload(clusterDefinition.validate, connectionState.update)} primary />
                            </form>
                        )}
                    </ConnectionStateContext.Consumer>
                )}
            </ClusterDefinitionContext.Consumer>
        );
    }
}

export default LoadPanel;