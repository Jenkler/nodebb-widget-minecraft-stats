<style type="text/css">
.search {
  border: solid 1px #eee;
  margin: 10px 0px;
  padding: 5px;
}
.scroll {
  overflow-x: auto;
  white-space: nowrap;
}
.table {
  border-collapse: collapse;
  display: table;
}
.tbody {
  display: table-row-group;
}
.td {
  border:solid 1px #eee; 
  display: table-cell;
  padding: 5px; 
}
.thead {
  display: table-header-group;
  font-weight: bold;
}
.tr {
  display: table-row;
}
</style>

<div id="stats">
  <input class="search" placeholder="Search"/>
  <div class="scroll">  
    <div class="table">
      <div class="thead">
        <div class="tr">
          <div class="td">Stats</div>
          {thead}
        </div>
      </div>
      <div class="list tbody">
        {tbody}
      </div>
    </div>
  </div>
  <div class="pagination"></div>
<div>

<script src="/assets/plugins/nodebb-widget-minecraft-stats/static/list.min.js"></script>
<script>
var userList = new List('stats', {
	valueNames: ['name'],
	page: 25,
	pagination: true
});
</script>
