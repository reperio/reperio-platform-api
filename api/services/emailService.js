class EmailService {
    async sendVerificationEmail(userId, email, uow, request, applicationId) {
        const messageHelper = await request.app.getNewMessageHelper();
        const forgotPassword = await uow.forgotPasswordsRepository.addEntry(userId);
        let tokenUrl = `${request.server.app.config.authWebAppUrl}/passwordManagement/${forgotPassword.id}/create`;
        let encodedNext = encodeURIComponent(request.server.app.config.webAppUrl);
        let emailContent;

        let application = await uow.applicationsRepository.getApplicationById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        switch (application.name) {
            case 'Managed IT Services': // Reperio Managed IT Services
                const appURI = new URL(application.clientUrl);
                encodedNext = encodeURIComponent(appURI.origin + '/login');
                tokenUrl = `${tokenUrl}?next=${encodedNext}&email=${encodeURIComponent(email)}`; 
                emailContent = `Thanks for completing our survey, <a href="${tokenUrl}">click here</a> to set your password and go register your first desktop!`
                break;
        
            default:
                tokenUrl = `${tokenUrl}?next=${encodedNext}&email=${encodeURIComponent(email)}`; 
                emailContent = `Please <a href="${tokenUrl}">verify</a> your email address.`;
                break;
        }

        const message = {
            to: email,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Email verification',
            contents: emailContent
        };

        return await messageHelper.processMessage(message);
    }

    async sendInviteEmail(invitedUser, existingUser, invitingUser, organization, applicationId, uow, request) {
        const messageHelper = await request.app.getNewMessageHelper();
        const tokenEntry = await uow.forgotPasswordsRepository.addEntry(invitedUser.id);
        let emailContent;

        let application = await uow.applicationsRepository.getApplicationById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }
        const appURI = new URL(application.clientUrl);

        if (existingUser) {
            //* login -> MITS invite accept
            const encodedNext = encodeURIComponent(`${appURI.origin}/invitation/${invitedUser.id}?organizationId=${organization.id}&token=${tokenEntry.id}`);
            const tokenUrl = `${request.server.app.config.authWebAppUrl}/login?next=${encodedNext}&email=${encodeURIComponent(invitedUser.primaryEmailAddress)}`
            emailContent = `You have been invited to join ${organization.name} by ${invitingUser.firstName} ${invitingUser.lastName}! Please <a href="${tokenUrl}">Click Here</a> to join.`;
        } else {
            //* create password -> login -> MITS invite accept
            const passwordEntry = await uow.forgotPasswordsRepository.addEntry(invitedUser.id); // TODO: might need to reverse order of token creation
            const encodedNext = encodeURIComponent(`${appURI.origin}/invitation/${invitedUser.id}?organizationId=${organization.id}&token=${tokenEntry.id}`);
            const tokenUrl = `${request.server.app.config.authWebAppUrl}/passwordManagement/${passwordEntry.id}/create?next=${encodedNext}&email=${encodeURIComponent(invitedUser.primaryEmailAddress)}`;
            emailContent = `You have been invited to join ${organization.name} by ${invitingUser.firstName} ${invitingUser.lastName}! <br/><br/> Please <a href="${tokenUrl}">Click Here</a> to join and create a Reperio user account.`;
        }

        const message = {
            to: invitedUser.primaryEmailAddress,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Invitation to Reperio Organization',
            contents: emailContent
        };

        return await messageHelper.processMessage(message);
    }

    async sendForgotPasswordEmail(userId, email, uow, request) {
        const messageHelper = await request.app.getNewMessageHelper();
        const forgotPassword = await uow.forgotPasswordsRepository.addEntry(userId);
        const tokenUrl = `${request.server.app.config.authWebAppUrl}/passwordManagement/${forgotPassword.id}/reset?email=${encodeURIComponent(email)}`

        const message = {
            to: email,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: 'Reset password',
            contents: `We got a request to reset your password. Please use this <a href="${tokenUrl}">link</a> to reset it.`
        };

        return await messageHelper.processMessage(message);
    }

    async sendNotificationEmail(uow, request, applicationId, addressee, body) {
        const messageHelper = await request.app.getNewMessageHelper();
        let application = await uow.applicationsRepository.getApplicationById(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        const message = {
            to: addressee,
            from: request.server.app.config.email.sender,
            type: 'email',
            subject: `This is a notification from application: ${application.name}`,
            contents: body
        };

        return await messageHelper.processMessage(message);
    }
}

const emailService = new EmailService();

module.exports = emailService;