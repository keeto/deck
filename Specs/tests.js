exports.setup = function(Testigo, Global, EngineName, Source){

	require('./suites/Import').setup(Testigo, Global, EngineName, Source);
	require('./suites/Route').setup(Testigo);
	require('./suites/Router').setup(Testigo);

};