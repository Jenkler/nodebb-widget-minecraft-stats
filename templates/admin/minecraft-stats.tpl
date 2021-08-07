<form class="minecraft-stats-settings" role="form">
  <div class="row">
    <div class="col-sm-2 col-xs-12 settings-header">Minecraft Stats</div>
    <div class="col-sm-10 col-xs-12">
      <p class="lead">A widget that shows stats from Mincraft data files</p>
      <div class="form-group">
        <label for="users">Users</label>
        <input class="form-control" id="users" name="users" placeholder="Comma separated list of users. Leave empty for all users." title="Users" type="text">
      </div>
      <div class="form-group">
        <label for="limit">limit</label>
        <input class="form-control" id="limit" name="limit" placeholder="Number of played hours before shown. Default is 0." title="Limit" type="text">
      </div>
    </div>
  </div>
</form>

<button class="floating-button mdl-button mdl-button--colored mdl-button--fab mdl-js-button mdl-js-ripple-effect" id="save">
  <i class="material-icons">save</i>
</button>
