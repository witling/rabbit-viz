import * as React from 'react';
import { Button, Icon, Input } from 'semantic-ui-react';
import Axios, { AxiosInstance } from 'axios';
import { ClusterDefinitionContext } from '../store/Contexts';
import cookies from 'react-cookies'

type ReloadFunction = (value: string) => void;

interface ILoadPanelState {
    apiClient: AxiosInstance | null,
    onReload: ReloadFunction,
    isConnected: boolean,
    host: string,
    username: string,
    password: string,
}

class LoadPanel extends React.Component<{ reloadCallback: ReloadFunction }, ILoadPanelState> {

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

            this.setState({ apiClient, isConnected: true });
            console.log('connection successful...');
        } catch {
            this.setState({ isConnected: false });
            console.log('connection failed...');
        }
    }

    reload() {
        setTimeout(() => {
            if (this.state.apiClient === null) {
                return;
            }
            const onReload = this.state.onReload;
            this.state.apiClient
                .request({ method: 'get', url: 'definitions' })
                .then(result => {
                    console.log(result.request.response);
                    onReload(result.data);
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

    handleReload = e => {
        e.preventDefault();
        this.reload();
    };

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
                <Button content="Reload" onClick={this.handleReload} primary />
            </form>
        );
    }
}

export default LoadPanel;