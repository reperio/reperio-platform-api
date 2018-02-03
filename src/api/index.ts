
const plugin = {
    name: 'platform-api-routes',
    register: (server, options) => {
        server.route({
            method: 'GET',
            path: '/',
            handler: (req: Request, h: any) => {
                return 'hello api';
            },
            config: {
                auth: false
            }
        });
    }
}

export default plugin;
