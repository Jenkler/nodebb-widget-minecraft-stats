var jsTreeTable =  (function(){
	function depthFirst(tree, func, childrenAttr) {
		childrenAttr = childrenAttr || 'children'
		function i_depthFirst(node) {
			if (node[childrenAttr]) {
				$.each(node[childrenAttr], function(i, child) {
					i_depthFirst(child)
				})
			}
			func(node)
		}
		$.each(tree, function(i, root) {
			i_depthFirst(root)
		})
		return tree
	}
	
	/*
	 * make a deep copy of the object
	 */
	function copy(data){
		return JSON.parse(JSON.stringify(data))
	}
	
	function makeTree (data, idAttr, refAttr, childrenAttr) {
		var data_tmp = data
		idAttr = idAttr || 'id'
		refAttr = refAttr || 'parent'
		childrenAttr = childrenAttr || 'children'
	
		var byName = []
		$.each(data_tmp, function(i, entry) {
			byName[entry[idAttr]] = entry
		})
		var tree = []
		$.each(data_tmp, function(i, entry) {
			var parents = entry[refAttr]
			if(!$.isArray(parents)){
				parents = [parents]
			}
			if(parents.length == 0){
				tree.push(entry)
			} else {
				var inTree = false;
				$.each(parents, function(i,parentID){
					var parent = byName[parentID]
					if (parent) {
						if (!parent[childrenAttr]) {
							parent[childrenAttr] = []
						}
						if($.inArray(entry, parent[childrenAttr])< 0)
							parent[childrenAttr].push(entry)
						inTree = true
					} 
				})
				if(!inTree){
					tree.push(entry)
				}
			}
		})
		return tree
	}
	
	function renderTree(tree, childrenAttr, idAttr, attrs, renderer, tableAttributes) {
		childrenAttr = childrenAttr || 'children'
		idAttr = idAttr || 'id'
		tableAttributes = tableAttributes || {}
		var maxLevel = 0;
		var ret = []
	
		var table = $("<table>")
		$.each(tableAttributes, function(key, value){
			if(key == 'class' && value != 'jsTT') {
				table.addClass(value)
			} else {
				table.attr(key, value)			
			}
		})
		var thead = $("<thead>")
		var tr = $("<tr>")
		var tbody = $("<tbody>")
	
		table.append(thead)
		thead.append(tr)
		table.append(tbody)
		if (attrs) {
			$.each(attrs, function(attr, desc) {
				$(tr).append($('<th>' + desc + '</th>'))
			})
		} else {
			$(tr).append($('<th>' + idAttr + '</th>'))
			$.each(tree[0], function(key, value) {
				if (key != childrenAttr && key != idAttr)
					$(tr).append($('<th>' + key + '</th>'))
			})
		}
	
		function render(node, parent) {
			var tr = $("<tr>")
			$(tr).attr('data-tt-id', node[idAttr])
			$(tr).attr('data-tt-level', node['data-tt-level'])
			if(!node[childrenAttr] || node[childrenAttr].length == 0)
				$(tr).attr('data-tt-isleaf', true)
			else
				$(tr).attr('data-tt-isnode', true)
			if (parent) {
				$(tr).attr('data-tt-parent-id', parent[idAttr])
			}
			if (renderer) {
				renderer($(tr), node)
			}else if (attrs) {
				$.each(attrs, function(attr, desc) {
					$(tr).append($('<td>' + node[attr] + '</td>'))
				})
			} else {
				$(tr).append($('<td>' + node[idAttr] + '</td>'))
				$.each(node, function(key, value) {
					if (key != childrenAttr && key != idAttr && key != 'data-tt-level')
						$(tr).append($('<td>' + value + '</td>'))
				})
			}
			tbody.append(tr)
		}
	
		function i_renderTree(subTree, childrenAttr, level, parent) {
			maxLevel = Math.max(maxLevel, level)
			$.each(subTree, function(i, node) {
				node['data-tt-level'] = level
				render(node, parent)
				if (node[childrenAttr]) {
					$.each(node[childrenAttr], function(i, child) {
						i_renderTree([ child ], childrenAttr, level + 1, node)
					})
				}
			})
		}
		i_renderTree(tree, childrenAttr, 1)
		if (tree[0])
			tree[0].maxLevel = maxLevel
		return table
	}
	
	function attr2attr(nodes, attrs){
		$.each(nodes,  function(i, node) {
			$.each(attrs,  function(j, at) {
				node[at] = $(node).attr(at)
			})	
		})
		return nodes
	}
	
	function treeTable(table){
		table.addClass('jsTT')
		table.expandLevel = function (n) {
			$("tr[data-tt-level]", table).each(function(index) {
				var level = parseInt($(this).attr('data-tt-level'))
				if (level > n-1) {
					this.trCollapse(true)
				} else if (level == n-1){
					this.trExpand(true)
				}
			})
		}
		function getLevel(node){
			var level = node.attr('data-tt-level')
			if(level != undefined ) return parseInt(level)
			var parentID = node.attr('data-tt-parent-id')
			if( parentID == undefined){
				return 0
			} else {
				return getLevel($('tr[data-tt-id="'+parentID+'"]', table).first()) + 1
			} 
		}
		$("tr[data-tt-id]", table).each(function(i,node){
			node = $(node)
			node.attr('data-tt-level', getLevel(node)) 
		})
		var dat = $("tr[data-tt-level]", table).get()
		$.each(dat,  function(j, d) {
			d.trChildrenVisible = false
			d.trChildren = []
		})	
		dat  = attr2attr(dat, ['data-tt-id', 'data-tt-parent-id'])
		dat = makeTree(dat, 'data-tt-id', 'data-tt-parent-id', 'trChildren')
		
		var imgExpand = "data:image/png;base64,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"
		var imgCollapse = "data:image/png;base64,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"
		$("tr[data-tt-level]", table).each(function(index, tr) {
			var level = $(tr).attr('data-tt-level')
			var td = $("td",tr).first()
			if(tr.trChildren.length>0){
				td.prepend($('<img id="state" style="cursor:pointer" src="'+imgExpand+'"/>'))			
			}  else {
				td.prepend($('<span style="padding-left:16px;" /></span>'))
			}
			td.prepend($('<span style="padding-left:'+(15*parseInt(level-1))+'px;" /></span>'))
			td.css('white-space','nowrap')
			tr.trExpand = function(changeState){
				if(this.trChildren.length < 1) return
				if(changeState) {
					this.trChildrenVisible = true
					$('#state', this).get(0).src= imgCollapse
				} 
				var doit = changeState || this.trChildrenVisible
				$.each(this.trChildren, function(i, ctr) {
					if(doit) $(ctr).css('display', 'table-row')
					ctr.trExpand()
				})
			}
			tr.trCollapse = function(changeState){
				if(this.trChildren.length < 1) return
				if(changeState) {
					this.trChildrenVisible = false
					$('#state', this).get(0).src=imgExpand
				}
				$.each(this.trChildren, function(i, ctr) {
					$(ctr).css('display', 'none')
					ctr.trCollapse()
				})
			}
			$(tr).click(function() {
				this.trChildrenVisible ? this.trCollapse(true) : this.trExpand(true)
			})
		})
		return table
	}
	
	
	function appendTreetable(tree, options) {
		function inALine(nodes) {
			var tr = $('<tr>')
			$.each(nodes, function(i, node){
				tr.append($('<td style="padding-right: 20px;">').append(node))
			})
			return $('<table border="0"/>').append(tr)
			
		}
		options = options || {}
		options.idAttr = (options.idAttr || 'id')
		options.childrenAttr = (options.childrenAttr || 'children')
		var controls = (options.controls || [])
	
		if (!options.mountPoint)
			options.mountPoint = $('body')
		
		if (options.depthFirst)
			depthFirst(tree, options.depthFirst, options.childrenAttr)
		var rendered = renderTree(tree, options.childrenAttr, options.idAttr,
				options.renderedAttr, options.renderer, options.tableAttributes)
	
		treeTable(rendered)
		if (options.replaceContent) {
			options.mountPoint.html('')
		}
		var initialExpandLevel = options.initialExpandLevel ? parseInt(options.initialExpandLevel) : -1
		initialExpandLevel = Math.min(initialExpandLevel, tree[0].maxLevel)
		rendered.expandLevel(initialExpandLevel)
		if(options.slider){
			var slider = $('<div style="margin-right: 15px;">')
			slider.width('200px')
			slider.slider({
				min : 1,
				max : tree[0].maxLevel,
				range : "min",
				value : initialExpandLevel,
				slide : function(event, ui) {
					rendered.expandLevel(ui.value)
				}
			})
			controls = [slider].concat(options.controls)
		}
		
	    if(controls.length >0){
	    	options.mountPoint.append(inALine(controls))    	
	    }
		options.mountPoint.append(rendered)
		return rendered
	}
	
	return {
		depthFirst : depthFirst,
		makeTree : makeTree,
		renderTree : renderTree,
		attr2attr : attr2attr,
		treeTable : treeTable,
		appendTreetable : appendTreetable,
		jsTreeTable : 'HEAD',
		register : function(target){
			$.each(this, function(key, value){ if(key != 'register') target[key] = value})
		}
	}
})();

var gottencount = 0;
var _currentattributes = [], _usernames, _data;
var separateAxes = false;


// stat.entityKilledBy.Creeper => Stat: Entity Killed By: Creeper
function getStatName(statid, shorter) {
    if (shorter === void 0) { shorter = statid; }
    return statnames[statid] || toTitleCase(shorter.replace(/_/g, " ").replace(/([A-Z])/g, ' $1').replace(/\./g, ": "));
}
// uppercase first letter of every word
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1); });
}

function cm_to_distance(cm)
{
	var distance = '';
	if(cm >= 100000)
	{
		var km = Math.floor(cm / 100000);
		cm = cm - (km * 100000);
		distance = distance + km + ' km ';
	}
        if(cm >= 100)
	{
	        var m = Math.floor(cm / 100);
		cm = cm - (m * 100);
		distance = distance + m + ' m ';
        }
        if(cm >= 1)
	{
               cm = Math.floor(cm);
               distance = distance + cm + ' cm ';
        }
	return distance;
}

function tick_to_time(tick)
{
	var seconds = tick / 20;
	var time = '';
	if(seconds >= 86400)
	{
		var days = Math.floor(seconds / 86400);
		seconds = seconds - (days * 86400);
		time = time + days + ' d ';
	}
        if(seconds >= 3600)
	{
	        var hours = Math.floor(seconds / 3600);
		seconds = seconds - (hours * 3600);
		time = time + hours + ' h ';
        }
        if(seconds >= 60)
	{
	        var minutes = Math.floor(seconds / 60);
		seconds = seconds - (minutes * 60);
		time = time + minutes + ' m ';
        }
        if(seconds >= 1)
	{
               seconds = Math.floor(seconds);
               time = time + seconds + ' s ';
        }
	return time;
}


var statnames = {
    "stat.playOneMinute": "Play Time"
};
function statvalToDataval(stat, arr) {
    if (stat === "achievement.exploreAllBiomes")
        return arr.map(function (x) { return x.progress.length; });
    return arr;
}

function parsedata(userdata)
{
        var data = [];
	var attrs = [];
	for(var i = 0; i < userdata.length; i++)
	{
		var user = userdata[i];
        for(var attr in user)
		{
			if(attr.indexOf('achievement') >= 0) continue;
			attr = attr.replace('stat.', '');
			var inx = attrs.indexOf(attr);
            if(inx < 0)
			{
				inx = attrs.push(attr) - 1;
				data[inx] = new Array(userdata.length);
				for (var k = 0; k < data[inx].length; k++)
					data[inx][k] = 0;
            }

            if(attr == 'playOneMinute' || attr == 'sneakTime' || attr == 'timeSinceDeath') data[inx][i] = tick_to_time(user["stat." + attr]);
            else if(attr == 'crouchOneCm' || attr == 'diveOneCm' || attr == 'fallOneCm' || attr == 'flyOneCm' || attr == 'sprintOneCm' || attr == 'swimOneCm' || attr == 'walkOneCm') data[inx][i] = cm_to_distance(user["stat." + attr]);
            else data[inx][i] = user["stat." + attr];
            
        }
    }
    attrs.forEach(function (e, i) { return data[i]._sort = e; });
    attrs = attrs.sort(function (a, b) { return a.localeCompare(b); });
    data = data.sort(function (a, b) { return a._sort.localeCompare(b._sort); });
    return {
        data: data,
        attrs: attrs
    };
}
function maketable(users, data) {
    var headers = $("<tr>");
    $("<th class='firstcolumn'>Stats</th>").appendTo(headers);
    users.forEach(function (user) { return $("<th>").text(user).appendTo(headers); });
    var table = $("<table id='table' class='table table-striped'>").append(headers);
    var ins = [];
    var prefixExisting = {};
    data.data.forEach(function (row, i) {
        var attr = data.attrs[i];
        var dotIndex = attr.indexOf("."), lastDotIndex = -1;
        var prefix = "", lastprefix = "";
        while (dotIndex >= 0) {
            prefix = attr.substr(0, dotIndex);
            if (!prefixExisting[prefix]) {
                prefixExisting[prefix] = true;
                var statname = getStatName(attr.substring(lastDotIndex + 1, dotIndex));
             if(lastprefix == '') var display = 'table-row';
             else var display = 'none';
             
              ins.push($("<tr><td>" + statname + "</td></tr>")
                    .attr("data-tt-id", prefix)
                    .attr("style", "display:" + display)                                        
                    .attr("data-tt-parent-id", lastprefix));
            }
            lastDotIndex = dotIndex;
            dotIndex = attr.indexOf(".", dotIndex + 1);
            lastprefix = prefix;
        }
        if(prefix == '') var display = 'table-row';
        else var display = 'none';        
        ins.push($("<tr>")
            .attr("data-tt-parent-id", prefix)
            .attr("data-tt-id", attr)
            .attr("style", "display:" + display)
            .attr("id", "attr-" + attr)
            .click(function () {
            var attr = $(this).data("ttId");
            var attrs = _currentattributes.slice();
            var inx = attrs.indexOf(attr);
            if (inx >= 0)
                attrs.splice(inx, 1);
            else
                attrs.push(attr);
        })
            .append($("<td>").text(getStatName(attr.substr(lastDotIndex + 1))))
            .append(statvalToDataval(attr, row).map(function (val) {
            return $("<td>").text(val);
        })));
    });
    table.append(ins);
	return table;
}

$(function ()
{
	var current_time = (new Date()).getTime();
	var config_usercachepath = "/assets/minecraft/usercache.json?v=" + current_time;	
	var config_userMinimumOntime = 600;
	var config_statspath = "/assets/minecraft/stats/"

	$.getJSON(config_usercachepath, function (r) {
		var targetcount = r.length;
		var userdata = [];
		var users = [];
		for (var u = 0; u < r.length; u++) {
			var user = r[u];
			function getresp(user, resp) {
				if (resp['stat.playOneMinute'] < 20 * config_userMinimumOntime)
					return;
				userdata.push(resp);
				users.push(user);
			}
			$.getJSON(config_statspath + user.uuid + ".json?v=" + current_time, getresp.bind(null, user))
				.fail(function () {
				console.log("user " + user.name + " not found");
			})
				.always(function () {
				gottencount++;
				if (gottencount == targetcount) {
					if (gottencount === 0)
						console.error("No data gotten!");
					else
					{
						var data = parsedata(userdata);
						if (data.attrs.length === 0)
							throw new Error("No Stats found");
						var usernames = users.map(function (x) {
							return x.name || x.id;
						});
						maketable(usernames, data).appendTo("#tablediv");
						jsTreeTable.treeTable($('#table'));
						_data = data;
						_usernames = usernames;
						var opts = {};
						data.attrs.forEach(function (attr) {
							var prefix = attr.split(".")[0];
							var suffix = attr.substring(prefix.length + 1);
							opts[prefix] = opts[prefix] || $("<optgroup>").attr("label", getStatName(prefix));
							$("<option>").val(attr).text(getStatName(attr, suffix)).appendTo(opts[prefix]);
						});
					}	
				}
			});
		}
	});
});
