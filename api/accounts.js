module.exports = [
    {
        method: 'GET',
        path: '/test',
        handler: (req, h) => {
            return {id: 1, name: 'Test account'};
        },
        config: {
            auth: false
        }
    }
];

