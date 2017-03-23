'use strict';

var nodebb = {};

exports.filter_widget_render_minecraft_stats = function(widget, callback)
{
	nodebb.app.render('widgets/minecraft_stats', { html: '<div id="tablediv"></div>' }, function(err, html)
	{
		callback(null, html);
	});
};

exports.filter_widgets_get_widgets = function(widget, callback)
{
	widget = widget.concat([
	{
		widget: 'minecraft_stats',
		name: 'Minecraft stats',
		content: '',
		description: 'A widget that shows stats from Mincraft data files'
	}]);
	callback(null, widget);
};

exports.static_app_load = function(data, callback)
{
	nodebb.app = data.app;
	console.log('Loading Jenkler Minecraft stats widget');
	callback();
};
