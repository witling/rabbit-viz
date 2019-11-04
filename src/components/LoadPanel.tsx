import * as React from 'react';
import { Button, Input } from 'semantic-ui-react';
import Axios, { AxiosInstance } from 'axios';
import { ClusterDefinitionContext } from '../store/Contexts';
import cookies from 'react-cookies'

type ReloadFunction = (editor: any, data: any, value: string) => void;

interface ILoadPanelState {
    apiClient: AxiosInstance | null,
    reloadFunc?: ReloadFunction,
    host: string,
    username: string,
    password: string,
}

class LoadPanel extends React.Component<{}, ILoadPanelState> {

    constructor(props) {
        super(props);

        const host = cookies.load('host') || 'localhost:15672';
        const username = cookies.load('username') || 'guest';
        const password = cookies.load('password') || 'guest';

        this.state = {
            apiClient: null,
            host,
            username,
            password,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleReload = this.handleReload.bind(this);
    }

    componentDidMount() {
        this.connect();
        this.reload();
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

            this.setState({ apiClient });
            console.log('connection successful...');
        } catch {
            console.log('connection failed...');
        }
    }

    reload() {
        setTimeout(() => {
            if (this.state.apiClient === null || this.state.reloadFunc === undefined) {
                return;
            }
            const reloadFunc = this.state.reloadFunc;
            this.state.apiClient.request({ method: 'get', url: 'definitions' })
                .then(result => {
                    console.log(result.request.response);
                    reloadFunc(null, null, result.request.response);
                })
                .catch(err => {
                    console.log(err);
                });
        }, 50);
    }

    handleConnect = e => {
        e.preventDefault();
        this.connect();
    };

    handleReload = reloadFunc => {
        return e => {
            e.preventDefault();
            if (this.state.reloadFunc === undefined) {
                this.setState({ reloadFunc });
            }
            this.reload();
        }
    };

    handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;

        let obj: any;
        if(name === 'host') {
            obj = { host: value };
            cookies.save('host', value, { path: '/' });
        } else if(name === 'username') {
            obj = { username: value };
            cookies.save('username', value, { path: '/' });
        } else if(name === 'password') {
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
                    <form>
                        <Input name="host" onChange={this.handleChange} value={this.state.host} placeholder="Hostname (address:port)" />
                        <Input name="username" onChange={this.handleChange} value={this.state.username} placeholder="Username" />
                        <Input name="password" onChange={this.handleChange} value={this.state.password} placeholder="Password" />
                        <Button content="Connect" onClick={this.handleConnect} secondary/>
                        <Button content="Reload" onClick={this.handleReload(clusterDefinition.validate)} primary/>
                    </form>
                )}
            </ClusterDefinitionContext.Consumer>
        );
    }
}

export default LoadPanel;