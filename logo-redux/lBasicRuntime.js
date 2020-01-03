function basicVar ( name )
{
	this.name = name;
	this.val = 0;
}

function lBasicRuntime( lang, visu, lbp )
{
	this.running = false;
	
	this.visu = visu;	
	this.lang = lang;
	this.lBP = lbp;
	
	var parent = this; // nice trick
	
	this.varTable = []; // name: basicVar
	
		/* run-time functions */
		
		this.opGetVal = function ( tok )
		{
			//if ( !tok ) { debugOut( "getVal on null" ); return; }
			
			if ( tok[0] == "str" )
			{
				var v = this.getVar( tok[1] );
				if ( v ) return v.val;
			}
			return tok[1];
		};
		
		// val = valence
		
		this.opAdd = function (ls, rs, valence, prepost)
			{
				if ( valence == 'b' )
					return (parent.opGetVal(ls) - 0) + (parent.opGetVal(rs) - 0);
				else
					return (parent.opGetVal(rs) - 0);
			};
		this.opMin = function (ls, rs, valence, prepost)
			{
				return parent.opGetVal(ls) - parent.opGetVal(rs);
			};
		this.opMul = function (ls, rs, valence, prepost)
			{ 
				//alert( "val " + val + "\n" + ls + "\n----\n" + enumerate(rs) );
				return parent.opGetVal(ls) * parent.opGetVal(rs);
			};
		this.opDiv = function (ls, rs, valence, prepost)
			{
				return parent.opGetVal(ls) / parent.opGetVal(rs);
			};
		
		this.opEqu = function (ls, rs, valence, prepost)
			{
				//alert( "set: " + ls[1] + "/" + parent.opGetVal(rs) );
				parent.getVar(ls[1]).val = parent.opGetVal(rs);
				return ls[1] + " (" + parent.opGetVal(ls) + ")";
			};
		this.opCom = function (ls, rs, valence, prepost)
			{
				/*alert( "comp: " + parent.opGetVal(ls) + "/" + parent.opGetVal(rs) + "\n\n" +
						enumerate(ls) + "---\n" + enumerate(rs) );*/
				return parent.opGetVal(ls) == parent.opGetVal(rs);
			};
		this.opNE = function ( ls, rs, valence, prepost )
			{
				return !parent.opCom( ls, rs, valence, prepost );
			};
		this.opLT = function (ls, rs, valence, prepost)
			{
				return parent.opGetVal(ls) < parent.opGetVal(rs);
			};
		this.opGT = function (ls, rs, valence, prepost)
			{
				return parent.opGetVal(ls) > parent.opGetVal(rs);
			};
		this.opPP = function (ls, rs, valence, prepost)
			{
				var v = parent.getVar(ls[1]);
				v.val++
				return v.name + " (" + v.val + ")";
			};
		this.opLogicAnd = function (ls, rs, valence, prepost)
			{
				var v1 = parent.opGetVal(ls) == "true";
				var v2 = parent.opGetVal(rs) == "true";
				//alert( "and!\n" + v1 + " && " + v2 + " = " + (v1 && v2) );
				return v1 && v2 ? "true" : "false";
			};
		this.opLogicOr = function (ls, rs, valence, prepost)
			{
				var v1 = parent.opGetVal(ls) == "true";
				var v2 = parent.opGetVal(rs) == "true";
				//alert( "or!\n" + v1 + " || " + v2 + " = " + (v1 || v2) );
				return v1 || v2 ? "true" : "false";
			};
		this.opLogicNot = function (ls, rs, valence, prepost)
			{
				//alert( "not!: " + ls + "/" + rs );
				return !(parent.opGetVal(rs) == "true") ? "true" : "false";
			};
		
		this.lang.opFuncMap[ "+" ] = this.opAdd;
		this.lang.opFuncMap[ "-" ] = this.opMin;
		this.lang.opFuncMap[ "*" ] = this.opMul;
		this.lang.opFuncMap[ "/" ] = this.opDiv;
		
		this.lang.opFuncMap[ "=" ] = this.opEqu;
		this.lang.opFuncMap[ "==" ] = this.opCom;
		
		this.lang.opFuncMap[ "!=" ] = this.opNE;
		
		this.lang.opFuncMap[ ">" ] = this.opGT;
		this.lang.opFuncMap[ "<" ] = this.opLT;
		
		this.lang.opFuncMap[ "++" ] = this.opPP;
		
		this.lang.opFuncMap[ "&&" ] = this.opLogicAnd;
		this.lang.opFuncMap[ "and" ] = this.opLogicAnd;
		
		this.lang.opFuncMap[ "||" ] = this.opLogicOr;
		this.lang.opFuncMap[ "or" ] = this.opLogicOr;
		
		this.lang.opFuncMap[ "!" ] = this.opLogicNot;
		this.lang.opFuncMap[ "not" ] = this.opLogicNot;
		
		this.funcSetColor = function ( r )
							{
								var params = parent.getParamsFromNode(r);
								//alert( enumerate(params) );
								
								parent.lBP.addMove( "setColor", params );
							};
		
		this.lang.setBIFunc( "setColor", this.funcSetColor );
	
	this.setVar = function ( name, val )
	{
		var v = this.getVar( name )
		if ( v )
			v.val = val;
		else
			alert( "can't set var: " + name );
					
		debugOut( 'set var: ' + name + " = " + val );
	};
	
	this.getVar = function ( name )
	{
		for ( var i = 0; i < parent.varTable.length; i++ )
		{
			var v = parent.varTable[i][name];
			if ( v )
			{
				debugOut( 'get var: ' + name + "/" + enumerate(v) );
				return v;
			}
		}
		debugOut( 'get var NOT found: ' + name );
		
		return null;
	};
	
	this.declareVar = function ( name )
	{
		var r = new basicVar( name );
		
		this.varTable[0][ name ] = r;
		
		debugOut( 'declare var: ' + name );
		
		return r;
	};
	
	this.runFuncStack = [];
	
	this.returnVal = null;
	
	this.curSelNode = function ()
	{
		return parent.runFuncStack[0][ parent.runFuncStack[0].runLinePtr ];
	};
	
	this.getParamsFromNode = function ( n )
	{
		var crn = n;
		var tstack = [ crn ];
		var ret = [];
		
		while ( crn.op )
		{
			//alert( "to1:\n" + enumerate( crn )  );
			if ( crn.op[1] == "," )
			{
				if ( crn.l.op )
				{
					if ( crn.l.op[1] == ',' )
					{
						crn = crn.l;
						tstack.push( crn );
						continue;
					}
					else
					{
						alert( "param error 2" );
						return;
					}
				}
				else
				{
					//alert( "acme:" + enumerate( crn ) );
					ret.push( crn.l );
					break;
				}
			}
			else
				alert( "param error 1" );
		}
		
		while ( tstack.length > 0 )
		{
			crn = tstack[ tstack.length - 1 ];
			//alert( "to2:\n" + enumerate( crn )  );
			
			if ( crn.r.op )
			{
				alert( "param error 3" );
				return;
			}
			else
			{
				ret.push( crn.r );
				
				tstack.pop();
				crn = tstack[ tstack.length ];
			}
		}
		
		return ret;
	};
	
	this.runNode = function ( node )
	{
		debugOut( "runOp: " + enumerate(node) );
		
		var ret = null;
		
		var l = (node.l ? node.l : null);
		var r = node.r;
		
		if ( node.op )
		{
			ifnodeop:
			if ( node.op[0] == "ifunc" )
			{
				for ( var ifp = 0; ifp < lang.builtInFuncs.length; ifp++ )
				{
					if ( lang.builtInFuncs[ifp][0] == node.op[1] )
					{
						var func = lang.builtInFuncs[ifp][1];
						//alert( "?\n" + enumerate(r) );
						var v = this.opGetVal( r );
						if (!v) v = r;
						//alert( "if:" + enumerate( parent.varTable ) );
						ret = func( v );
						if ( !ret ) ret = [ "null", "null" ];
						else ret = [ "str", ret ];
						break ifnodeop;
					}
				}
				alert( "error bif" );
			}
			else if ( node.op[0] == "func" )
			{
				var csn = this.curSelNode();
				csn.fret = csn.outerNode;
				//alert( "fret in:\n" + enumerate( csn ) );
				
				this.runFunc( this.findFunc(node.op[1], r ), node.r );
				//alert( "func:" + enumerate(parent.runFuncStack) );
				var i = 1;
				while ( !parent.runFuncStack[i].nob ) i++;
				if ( !parent.runFuncStack[i].nob ) alert( "func error" );
				//else alert( "func nob: " + parent.runFuncStack[i].nob );
				document.getElementById( parent.runFuncStack[i].nob ).style.display = "none";
				
				ret = [ "op", "fret" ]; // function return
			}
			else if ( node.op[0] == "op" )
			{
				if ( node.op[1] == "return" )
				{
					var v = this.getVar( node.r );
					if ( v )
						parent.returnVal = [ 'str', v.val ];
					else
					{
						if ( node.r.op || Array.isArray( node.r ) )
							parent.returnVal = node.r;
						else
							parent.returnVal = [ 'str', node.r ];
					}
					ret = parent.returnVal;
					//alert( "return: " + ret );
				}
				else
				{
					switch ( node.op[1] )
					{
					case "var":
					
						this.declareVar( r[1] );
						ret = [ 'str', "declare " + r[1] ];
						break;
						
					case "fd":
					case "bk":
					case "rt":
					case "lt":
					case "pu":
					case "pd":
					case "setWeight":
					case "ht":
					case "st":
					case "home":
					case "setAngle":
					case "setX":
					case "setY":
					case "setSpeed":
					case "setPPF":
					case "setAPF":
					case "setColor":
					
						var v = this.opGetVal( node.r );
						
						this.lBP.addMove( node.op[1], v );
						ret = [ "str", "turtle: " + node.op[1] + (v? " " + v : "") ];
						break ifnodeop;
					
						ret = [ 'str', "op: " + l + "/" + node.op[1] + "/" + r ];
						
						break;
						
					default:
						var func = lang.opFuncMap[ node.op[1] ];
						if ( func )
							ret = [ 'str', func( l, r, node.val, node.prepost ) ]; // run dat
						else
							alert( "op not found" );
					}
				}
			}
		}
		else
			alert( "rN error" );
		
		/*if ( node.struc ) node = node.cond;
		
		//alert( lang.opFuncMap[ op ] );
		
		var fr = "runOp: " + node.op[1] + "/" + node.val +
					"\n   (" + (node.l?node.l[1]:"absent") + ")/(" + node.r[1] + ")";
		
			fr += "\n//" + func( node.val, (node.l?node.l[1]:null), node.r[1] ); // run dat*/
		
		//alert( "op ret:\n" + enumerate(ret) );
		
		var nn = visu.createIlDiv( ret[1], true );
	
		ret.id = nn.id;
	
		visu.swapDivs( node.id, nn );
		
		return ret;
	};
	
	this.getFromPath = function ( path, par )
	{
		debugOut( "gFP: " + path + "/\n" + enumerate( this.runFuncStack[0] ) );
		
		var n = this.runFuncStack[0];
		var pun = null; // penultimate n
		
		var dpath = "";
		var dpath2 = "";
		
		for ( var p = 0; p < path.length; p++ )
		{
			dpath += path[p] + ", ";
			dpath2 += n[ path[p] ] + ", ";
			
			punp = path[p];
			pun = n;
			
			if ( par )
			{
				par.node = pun;
				par.side = punp;
			}
			
			n = n[ path[p] ];
		}
			
		debugOut( "loop, path: " + dpath + "\nloop, path2: " + dpath2 + "\nloop, id: " + n );
			
		return n;
	};
	
	this.runStep = function ()
	{
		var csn = this.curSelNode();
		
		debugOut( "rS0:\n" + enumerate(csn.outerNode) );
		
		var par = { node: null, side: '' };
		var n = this.getFromPath( csn.outerNode, par );
		
		debugOut( "rS par:\n" + enumerate(par) );
		
		if ( par.side == "tnode" )
		{
			if ( !par.node.state )
				alert( "err: no state" );
			else if ( par.node.state == 1 )
			{
				debugOut( "rS par node:\n" + enumerate(par.node) );
					
				if ( n.op )
				{
					var rnv = this.runNode( n );
					debugOut( "hm0:\n" + enumerate(rnv) );
					par.node.tnode = rnv;
					par.node.state = 2;
				
				}
			}
			else if ( par.node.state == 2 )
			{
				//alert( "TWO!!!!\n" + n[1] + "\n\n" + enumerate(par) );
				
				//alert( "t:\n" + enumerate(par.node) );
				var d = par.node.id;
				var nl = visu.showBlockMake( par.node );
				//alert( "nl:\n" + enumerate(nl) );
				//alert( "!!" + d + "/" + nl.id );
				visu.swapDivs( d, nl );
				//par.node.id = nl.id;
				
				if ( n[1] )
				{
					//alert( "id:" + par.node.id );
					
					par.node.tnode = gClone( par.node.code );
					
					var otn = par.node;
					//alert( "nz:\n" + enumerate(otn) ); //
					
					parent.runFuncStack.unshift( par.node.tnode );
					parent.runFuncStack[0].runLinePtr = 0;
				
					//alert( "par:\n" + enumerate(par) );
					
					nl = visu.showBlockMake( par.node.tnode );
					//alert( "nl:\n" + enumerate(nl) );
					par.node[ par.side ] = nl;
					//par.node.tnode.id = nl.id;
					//document.getElementById( par.node.tnode.id ).innerHTML = nl.innerHTML;
				}
				else
					parent.runFuncStack[0].runLinePtr++;
			}
		}
		else if ( n.op )
		{
			par.node[ par.side ] = this.runNode( n );
	
			var rb = parent.runFuncStack[0];
			rb = rb[ rb.runLinePtr ];
			
			if ( !rb.op )
				parent.runFuncStack[0].runLinePtr++;
		}
	
		while ( parent.runFuncStack.length > 0 &&
			parent.runFuncStack[0].runLinePtr >= parent.runFuncStack[0].length )
		{
			
			//alert( "shift1:" + document.getElementById( parent.runFuncStack[0].nob ).innerHTML );
			
			// nob issue
			
			if ( parent.runFuncStack[0].nob ) // if leaving a function
			{
				var cn = document.getElementById( parent.runFuncStack[0].nob );
				
				cn.parentNode.removeChild( cn );
				parent.varTable.shift();
			}
			
			//alert( "shift!" );
			
			var nobf = -1;
			var nobi = 1;
			while ( nobi < parent.runFuncStack.length && !parent.runFuncStack[nobi].nob )
				nobi++;
				
			if ( nobi < parent.runFuncStack.length && parent.runFuncStack[nobi].nob )
				nobf = parent.runFuncStack[nobi].nob;
			// else error? or done?
				
			
			var retVal = parent.returnVal;
			
			/***** SHIFT *****/
			parent.runFuncStack.shift();
			
			//alert( "rF l:" + parent.runFuncStack.length )
			
			if ( parent.runFuncStack.length > 0 )
			{
				//alert( "enm?" );
				//alert( "shift: " + enumerate(parent.runFuncStack[0]) );
				
				if ( nobf < 0 ) alert( "nob error" );
				var nob = document.getElementById( nobf );
				nob.style.display = "block";
				
				var parl = this.curSelNode();
				
				/*alert( "wh:" + parent.runFuncStack[0].runLinePtr + "\n" +
							enumerate( parent.runFuncStack[0] ) );*/
				if ( parl.fret )
				{
					//alert( "found " + enumerate(csn[ tc[o] ]) );
					var par = { node: null, side: '' };
					var cfret = this.getFromPath( parl.fret, par );
					par.node[ par.side ] = parent.returnVal;
					var nn = visu.createTextDiv( parent.returnVal[1] );
					//alert( "t id: " + cfret.id );
					visu.swapDivs( cfret.id, nn );
					par.node[ par.side ].id = nn.id;
					
					parl.fret = null;
				}
				else if ( parl.struc == "while" )
				{
					//alert( "while!\n" + enumerate( par.node ) );
					parl.state = null;
					parl.tnode = gClone( par.cond );
				}
				else if ( parl.struc == "if" )
				{
					parent.runFuncStack[0].runLinePtr++;
					//alert( "p-if:\n" + enumerate( parent.runFuncStack[0] ) );
				}
				else if ( !parl.op )
				{
					//alert( "parl1:\n" + enumerate( parl ) );
					
					if ( parl[0] == "op" && parl[1] == "fret" )
					{
						//parl = parent.returnVal;var oid = csn.id;
						
						if ( !parent.returnVal ) parent.returnVal = [ "null", "null" ];
						
						parent.runFuncStack[0][ parent.runFuncStack[0].runLinePtr ] = parent.returnVal;
						var nn = visu.createIlDiv( parent.returnVal[1], true );
						visu.swapDivs( parl.id, nn );
						csn.id = nn.id;
					}
					
					parent.runFuncStack[0].runLinePtr++;
				}
				else
					alert( "rS after error" );
			}
			else
			{
				this.running = false;
				//alert( "done!!\n" + this.visu );
				this.visu.hideButtons();
			}
		}
		//alert( "rO:\n" + enumerate(this.runFuncStack[0]) );
		
		/*if ( rb.runLinePtr < rb.length &&
					!(rb[ rb.runLinePtr ].op ||
						(rb[ rb.runLinePtr ].struc && rb[ rb.runLinePtr ].cond.op) ) )
			rb.runLinePtr++;*/
		
		this.selectToRun();
	};
	
	this.selectDelve = function ( node, par, side, stack )
	{
		stack = gClone( stack );
		
		stack.push( side );
		debugOut( "stack: " + side );
		
		//alert( "sD:\n" + enumerate( node ) );
				
		if ( node.op )
		{
			//alert( "sD:\n" + enumerate(node) );
			outer:
			if ( (node.op[0] == "func" || node.op[0] == "ifunc") &&
						node.r.op && node.r.op[1] == "," )
			{
				//alert( "this one:\n" + enumerate(node) );
				
				// I need to stop programming and go to bed. //
				
				// OK. the following traverses to the top of the param list on the left
				// and then goes back down on the right.
				
				var crn = node.r;
				var tstack = [ crn ];
				stack.push( 'r' ); //
				
				while ( crn.op )
				{
					//alert( "to1:\n" + enumerate( crn )  );
					if ( crn.op[1] == "," )
					{
						if ( crn.l.op )
						{
							if ( crn.l.op[1] == ',' )
							{
								crn = crn.l;
								tstack.push( crn );
								stack.push( 'l' );
								continue;
							}
							else
							{
								this.selectDelve( crn.l, crn, "l", stack );
								return;
							}
						}
						else
						{
							//alert( "acme:" + enumerate( crn ) );
							break;
						}
					}
					else
						alert( "no!" );
				}
				
				while ( tstack.length > 0 )
				{
					crn = tstack[ tstack.length - 1 ];
					//alert( "to2:\n" + enumerate( crn )  );
					
					if ( crn.r.op )
					{
						this.selectDelve( crn.r, crn, 'r', stack );
						return;
					}
					else
					{
						tstack.pop();
						stack.pop();
						crn = tstack[ tstack.length ];
					}
				}
			}
			else
			{
				if ( node.l && node.l.op )
				{
					this.selectDelve( node.l, node, 'l', stack );
					return;
				}
				
				if ( node.r && node.r.op )
				{
					this.selectDelve( node.r, node, 'r', stack );
					return;
				}
			}
			
			//stack.push( "op" );
			debugOut( "stack push op: " + enumerate( stack ) );
			var csn = this.curSelNode();
			csn.outerNode = stack;
			debugOut( "out after: " + enumerate( csn.outerNode ) );
		}
		else if ( node.struc )
		{
			/*debugOut( "stack push struc: " + enumerate( stack ) );
			outerNodes.push( stack );
			debugOut( "out after: " + enumerate( outerNodes ) );*/
			
			if ( !node.state )
			{
				node.state = 1;
				node.tnode = gClone( node.cond );
				//alert( "clone:" + enumerate(node) );
			}
			
			//alert( "struc node: " + enumerate( node ) );
				
			/*switch ( node.state )
			{
			case 1:
			case 2:*/
				if ( node.tnode.op )
					this.selectDelve( node.tnode, node, "tnode", stack );
				else if ( node.state <= 2 )
				{
					var csn = this.curSelNode();
					//alert( "error struc state" );
					stack.push( "tnode" );
					csn.outerNode = stack;
					//alert( "sD: " + enumerate( outerNodes ) );
				}
			/*	break;
			}*/
		}
		/*else
		{
			debugOut( "sD push: " + node + "/" + node.id );
			outerNodes.push( node );
		}*/
	};
	
	this.selectToRun = function ()
	{
		debugOut( "sTR1: " + enumerate( this.runFuncStack[0] ) );
		
		if ( this.runFuncStack.length == 0 )
		{
			//alert( "done (boo)" );
			return;
		}
		
		var csn = this.curSelNode();
		csn.outerNode = null;
		var tstack = [];
		this.selectDelve( this.runFuncStack[0][ this.runFuncStack[0].runLinePtr ], // == csn
								this.runFuncStack[0], this.runFuncStack[0].runLinePtr,
								tstack ); // special case
		
		n = this.getFromPath( csn.outerNode, null );
		//if ( n.struc ) { alert( "nstruc" ); n = n.tnode };
		document.getElementById( n.id ).style.borderColor = "rgb(255,0,0)";
		document.getElementById( n.id ).style.color = "rgb(255,0,0)"; //
		document.getElementById( n.id ).style.borderStyle = "solid";
		
		debugOut( "sTR2: " + enumerate( this.runFuncStack[0] ) );
	};
	
	this.runFunc = function ( func, inParam )
	{
		parent.varTable.unshift( {} );
		
		// params
		
		var cpn = inParam;
		var pi = func.param.length - 1;
		
		while ( cpn.op ) // always comma
		{
			var cp = this.declareVar( func.param[pi][1] );
			cp.val = this.opGetVal( cpn.r );
			//alert( "declare " + cp.name + ": " + cp.val );
			pi -= 2;
			cpn = cpn.l;
		}
		
		if ( pi >= 0 )
		{
			var cp = this.declareVar( func.param[pi][1] );
			cp.val = this.opGetVal( cpn );
			//alert( "declare " + cp.name + ": " + cp.val );
		}
		
		// run
		
		var stepFunc = gClone( func );
		
		var funcHeir = parser.structureTokens( stepFunc.code ); // parser is a global var
		this.runFuncStack.unshift( funcHeir );
		
		parent.runFuncStack[0].runLinePtr = 0;
		
		//debugOut( "final!: " + enumerate( funcHeir ) );
		
		var nob = visu.showFunc( func.name, func.param, funcHeir );
		
		parent.runFuncStack[0].nob = nob;
		
		//debugOut( "after!: " + enumerate( funcHeir ) );
		
		this.selectToRun();
	};
	
	this.findFunc = function ( name )
	{
		for ( var f = 0; f < lang.funcReg.length; f++ )
		{
			//debugOut( "runf:" + enumerateX(lang.funcReg[f],0) );
			
			if ( lang.funcReg[f].name == name )
				return lang.funcReg[f];
		}
		return null;
	};
	
	this.run = function ( inParam )
	{
		var m = this.findFunc( "main" );
		
		this.running = true;
		
		this.lBP.init();
		
		if ( m )
			this.runFunc( m, inParam );
		else
			alert( "error: no main" );
	};
}