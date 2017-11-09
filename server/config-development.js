module.exports = {
	log_level: 'silly',
	db_logging: false,

	plugins: [
		{
			name: 'phone_provisioner',
			path: '../../phone_provisioner',
			vhost: 'provisioning.reper.io'
		}
	]
};