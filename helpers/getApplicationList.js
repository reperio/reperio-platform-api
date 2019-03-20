const UnitOfWork = require('../db');

const getApplicationList = async () => {
    const uow = new UnitOfWork();
    const apps = await uow.applicationsRepository.getAllApplications();

    const result = apps.reduce((map, app) => {
        map[app.secretKey] = app;
        return map;
    }, {});

    return result;
};

module.exports = {getApplicationList};