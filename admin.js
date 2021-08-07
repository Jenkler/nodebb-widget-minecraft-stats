'use strict';

define('admin/minecraft-stats', ['settings'], function(Settings) {
  let ACP = {};
  ACP.init = function() {
    Settings.load('minecraft-stats', $('.minecraft-stats-settings'));
    $('#save').on('click', function() {
      Settings.save('minecraft-stats', $('.minecraft-stats-settings'), function() {
        app.alert({
          alert_id: 'minecraft-stats-saved',
          message: 'Updated Minecraft Stats settings',
          timeout: 2000,
          title: 'Settings Saved',
          type: 'success'
        });
      });
    });
  };
  return ACP;
});
