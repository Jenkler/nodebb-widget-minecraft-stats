'use strict';

let cron = {};
let fs = require('fs');
let minecraft = {};
let nodebb = {};
let userdata = {};

function cmToDistance(cm) {
  let out = '';
  if(cm >= 100000) {
    let km = Math.floor(cm / 100000);
    cm = cm - (km * 100000);
    out = out + km + ' km ';
  }
  if(cm >= 100) {
    let m = Math.floor(cm / 100);
    cm = cm - (m * 100);
    out = out + m + ' m ';
  }
  if(cm >= 1) {
    cm = Math.floor(cm);
    out = out + cm + ' cm ';
  }
  return out;
}
function checkCron(name, seconds) {
  let current = Math.floor(new Date() / 1000);
  if(!cron.hasOwnProperty(name)) {
    cron[name] = current;
	return true;
  }
  if((current - cron[name]) > seconds) {
    cron[name] = current;
    return true;
  } else return false;
}
function getJsonData(path) {
  path = __dirname + '/' + path + '.json';
  if(fs.existsSync(path)) {
    try {
      return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch(error) {
      console.error('Error: Unable to process ' + path);
      return {};
    }
  } else {
    console.error('Error: Unable to load ' + path);
    return {};
  }
}
function keyExists(data) {
  let args = Array.prototype.slice.call(arguments, 1);
  for(var i = 0; i < args.length; i++) {
    if(!data || !data.hasOwnProperty(args[i])) {
      return false;
    }
    data = data[args[i]];
  }
  return true;
}
function sort(data) {
  const out = {};
  Object.keys(data).sort().forEach(function(key) {
    out[key] = data[key];
  });
  return out;
}
function tickToTime(tick) {
  let seconds = tick / 20;
  let out = '';
  if(seconds >= 86400) {
    let days = Math.floor(seconds / 86400);
    seconds = seconds - (days * 86400);
    out = out + days + ' d ';
  }
  if(seconds >= 3600) {
    let hours = Math.floor(seconds / 3600);
    seconds = seconds - (hours * 3600);
    out = out + hours + ' h ';
  }
  if(seconds >= 60) {
    let minutes = Math.floor(seconds / 60);
    seconds = seconds - (minutes * 60);
    out = out + minutes + ' m ';
  }
  if(seconds >= 1) {
    seconds = Math.floor(seconds);
    out = out + seconds + ' s ';
  }
  return out;
}

exports.filterWidgetRenderMinecraftstats = function(data, callback) {
  minecraft['sort'] = {};
  minecraft['users'] = {};
  let tbody = '';
  let thead = '';

  for(let key in minecraft['usercache']) {
    let uuid = minecraft['usercache'][key]['uuid'];
    if(checkCron(uuid, 3600)) userdata[uuid] = getJsonData('../../public/minecraft/stats/' + uuid);
    if(!keyExists(userdata, uuid, 'stats', 'minecraft:custom', 'minecraft:play_one_minute')) continue;
    if(userdata[uuid]['stats']['minecraft:custom']['minecraft:play_one_minute'] < 72000) continue;
    for(let key2 in userdata[uuid]['stats']) {
      let group = key2.split(':').pop().replace(/_/g,' ');
      for(let key3 in userdata[uuid]['stats'][key2]) {
        if(!keyExists(minecraft, 'users', minecraft['usercache'][key]['name'])) minecraft['users'][minecraft['usercache'][key]['name']] = {};
        let name = group + ' ' + key3.split(':').pop().replace(/_/g,' ');
        name = name.replace('custom ', '');
        minecraft['users'][minecraft['usercache'][key]['name']][name] = userdata[uuid]['stats'][key2][key3];
        minecraft['sort'][name] = '';
      }
    }
  }
  minecraft['sort'] = sort(minecraft['sort']);
  minecraft['users'] = sort(minecraft['users']);
  for(let key in minecraft['users']) {
    thead += '<th>' + key + '</th>';
  }
  let typeTick = ['play one minute', 'sneak time', 'time since death', 'time since rest'];
  let typeDistance = ['crouch one cm', 'fall one cm', 'fly one cm', 'sprint one cm', 'walk on water one cm', 'walk under water one cm', 'walk one cm'];
  for(let key in minecraft['sort']) {
   	tbody += 
    '<tr>' +
    '  <td class="name">' + key[0].toUpperCase() + key.substring(1) + '</td>';
    for(let key2 in minecraft['users']) {
      let item = keyExists(minecraft, 'users', key2, key) ? minecraft['users'][key2][key] : 0;
      if(typeTick.includes(key)) item = tickToTime(item);
      else if(typeDistance.includes(key)) item = cmToDistance(item);
      tbody += '<td>' + item  + '</td>';
    }
    tbody += '</tr>';
  }
  nodebb.app.render('widgets/minecraftstats', { tbody: tbody, thead: thead }, function(err, html) {
    data.html = html;
    callback(err, data);
  });
};
exports.filterWidgetsGetWidgets = function(data, callback) {
  data = data.concat([
  {
    widget: 'minecraftstats',
    name: 'Minecraft stats',
    content: '',
    description: 'A widget that shows stats from Mincraft data files'
  }]);
  callback(null, data);
};
exports.staticAppLoad = function(data, callback) {
  console.log('Loading Jenkler Minecraft stats widget ' + require('./package.json').version);
  minecraft['usercache'] = getJsonData('../../public/minecraft/usercache');
  nodebb.app = data.app;
  callback();
};
