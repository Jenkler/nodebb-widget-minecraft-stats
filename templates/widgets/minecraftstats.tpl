<style type="text/css">
.list {
  font-family: sans-serif;
}

#stats table {
  font-size: 1vw;
  width: 100%; 
}

td {
  padding: 5px; 
  border: solid 1px #eee;
}

input {
  border:solid 1px #ccc;
  border-radius: 5px;
  padding:7px 14px;
  margin-bottom:10px
}
input:focus {
  outline:none;
  border-color:#aaa;
}
.sort {
  padding:8px 30px;
  border-radius: 6px;
  border:none;
  display:inline-block;
  color:#fff;
  text-decoration: none;
  background-color: #28a8e0;
  height:30px;
}
.sort:hover {
  text-decoration: none;
  background-color:#1b8aba;
}
.sort:focus {
  outline:none;
}
.sort:after {
  display:inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid transparent;
  content:"";
  position: relative;
  top:-10px;
  right:-5px;
}
.sort.asc:after {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #fff;
  content:"";
  position: relative;
  top:4px;
  right:-5px;
}
.sort.desc:after {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #fff;
  content:"";
  position: relative;
  top:-4px;
  right:-5px;
}
.pagination li {
  display:inline-block;
    padding:5px;
}
</style>

<div id="stats">
  <input class="search" placeholder="Search"/>
  <table>
    <thead>
      <tr>
        <th>Stats</th>
        {thead}
      </tr>
    </thead>
    <tbody class="list">
      {tbody}
    </tbody>
  </table>
  <ul class="pagination"></ul>
</div>

<script src="/assets/plugins/nodebb-widget-minecraft-stats/static/list.min.js"></script>
<script>
var userList = new List('stats', {
	valueNames: ['name'],
	page: 25,
	pagination: true
});
</script>
