'use strict';

const fs = require('fs');
const meta = require.main.require('./src/meta');
let cron = {};
let minecraft = {};
let nodebb = {};
let userdata = {};

const cmToDistance = async (data) => {
  let out = '';
  if(data >= 100000) {
    let km = Math.floor(data / 100000);
    data = data - (km * 100000);
    out = out + km + 'km ';
  }
  if(data >= 100) {
    let m = Math.floor(data / 100);
    data = data - (m * 100);
    out = out + m + 'm ';
  }
  if(data >= 1) {
    data = Math.floor(data);
    out = out + data + 'cm ';
  }
  return out;
}
const checkCron = async (name, seconds) => {
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
const getJsonData = async (data) => {
  let path = __dirname + '/' + data + '.json';
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
const numberSpace = async (data) => {
  return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
const renderAdmin = async (req, res) => {
  res.render('admin/minecraft-stats', {});
}
const sort = async (data) => {
  return Object.keys(data).sort().reduce((r, k) => (r[k] = data[k], r), {});
}
const tickToTime = async (data) => {
  let seconds = data / 20;
  let out = '';
  if(seconds >= 86400) {
    let days = Math.floor(seconds / 86400);
    seconds = seconds - (days * 86400);
    out = out + days + 'd ';
  }
  if(seconds >= 3600) {
    let hours = Math.floor(seconds / 3600);
    seconds = seconds - (hours * 3600);
    out = out + hours + 'h ';
  }
  if(seconds >= 60) {
    let minutes = Math.floor(seconds / 60);
    seconds = seconds - (minutes * 60);
    out = out + minutes + 'm ';
  }
  if(seconds >= 1) {
    seconds = Math.floor(seconds);
    out = out + seconds + 's ';
  }
  return out;
}

exports.filterAdminHeaderBuild = async (data) => {
  data.plugins.push({
    icon: 'fa-link',
    name: 'Minecraft Stats',
    route: '/minecraft-stats'
  });
  return data;
};
exports.filterWidgetRenderMinecraftStats = async (data) => {
  minecraft['sort'] = {};
  minecraft['users'] = {};
  let tbody = '';
  let thead = '';
  let settings = await meta.settings.get('minecraft-stats');
  let limit = Number(settings?.limit ?? 0) ? Number(settings?.limit ?? 0) * 20 * 60 * 60 : 0;
  let users = (settings?.users ?? '').split(',').map((x) => { return x.trim().split(' ')[0]; });
  for(let key in minecraft['usercache']) {
    let uuid = minecraft['usercache'][key]['uuid'];
    if(users[0] != '') if(users.indexOf(minecraft['usercache'][key]['name']) === -1) continue;
    if(await checkCron(uuid, 3600)) userdata[uuid] = await getJsonData('../../public/minecraft/stats/' + uuid);
    if((userdata?.[uuid]?.['stats']?.['minecraft:custom']?.['minecraft:play_one_minute'] ?? 0) < limit) continue;
    for(let key2 in userdata[uuid]['stats']) {
      let group = key2.split(':').pop().replace(/_/g,' ');
      for(let key3 in userdata[uuid]['stats'][key2]) {
        if(!minecraft?.['users']?.[minecraft['usercache'][key]['name']] ?? '') minecraft['users'][minecraft['usercache'][key]['name']] = {};
        let name = group + ' ' + key3.split(':').pop().replace(/_/g,' ');
        name = name.replace('custom ', '');
        minecraft['users'][minecraft['usercache'][key]['name']][name] = userdata[uuid]['stats'][key2][key3];
        minecraft['sort'][name] = '';
      }
    }
  }
  minecraft['sort'] = await sort(minecraft['sort']);
  minecraft['users'] = await sort(minecraft['users']);
  for(let key in minecraft['users']) {
    thead += '<div class="td">' + key + '</div>';
  }
  let typeTick = ['play one minute', 'sneak time', 'time since death', 'time since rest'];
  let typeDistance = ['boat one cm', 'climb one cm', 'crouch one cm', 'fall one cm', 'fly one cm', 'horse one cm', 'minecart one cm',
  'pig one cm', 'sprint one cm', 'swim one cm', 'walk on water one cm', 'walk under water one cm', 'walk one cm'];

  for(let key in minecraft['sort']) {
    tbody += 
    '<div class="tr">' +
    '  <div class="name td">' + key[0].toUpperCase() + key.substring(1) + '</div>';
    for(let key2 in minecraft['users']) {
      let item = minecraft?.['users']?.[key2]?.[key] ?? 0;
      if(!item == 0) {
        if(typeTick.includes(key)) item = await tickToTime(item);
        else if(typeDistance.includes(key)) item = await cmToDistance(item);
        else item = await numberSpace(item);
      }
      tbody += '<div class="td">' + item  + '</div>';
    }
    tbody += '</div>';
  }
  data.html = await nodebb.app.renderAsync('widgets/minecraft-stats', { tbody: tbody, thead: thead });
  return data;
};
exports.filterWidgetsGetWidgets = async (data) => {
  data.push({
    content: '',
    description: 'A widget that shows stats from Mincraft data files',
    name: 'Minecraft Stats',
    widget: 'minecraft-stats'
  });
  return data;
};
exports.staticAppLoad = async (data) => {
  console.log('Loading Jenkler Minecraft Stats widget ' + require('./package.json').version);
  data.router.get('/admin/minecraft-stats', data.middleware.admin.buildHeader, renderAdmin);
  data.router.get('/api/admin/minecraft-stats', renderAdmin);
  minecraft['usercache'] = await getJsonData('../../public/minecraft/usercache');
  nodebb.app = data.app;
};
