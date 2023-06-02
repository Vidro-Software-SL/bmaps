<?php

	//**************************************************************************************
	// API
	/*
		Class PDOdb :
		
		PDOdb(PDO_ACCESS, "C:path/to/access.mdb")
		PDOdb(PDO_MYSQL, 'hostname', 'dbname', 'uid', 'pwd', $port) : $port optional
		PDOdb(PDO_PGSQL, 'hostname', 'dbname', 'uid', 'pwd', $port) : $port optional

		get_dsn() : return DSN string
	
		property PDOdb->type : the DB type (access | mysql | pgsql)
		
		in() : escape simple quote
		
        BUG WARNING : On windows XP / PHP 5.2.5 - PHP 5.2.8 with Postgres 8.3 
        PDO:exec() statement always return int(1) to any successful query instead of returning the number of affected rows 
        
	*/
	//**************************************************************************************
	
	// DB type shortcuts
	define('PDO_ACCESS', PDOdb::ACCESS);
	define('PDO_MSSQL', PDOdb::MSSQL);
	define('PDO_MYSQL', PDOdb::MYSQL);
	define('PDO_PGSQL', PDOdb::PGSQL);

	// Define DSN strings of different DB for PDO constructor
	// Open Database connection
	class PDOdb extends PDO
	{
		const ACCESS = 'access';
		const MSSQL = 'mssql';
		const MYSQL = 'mysql';
		const PGSQL = 'pgsql';
		const ODBC = 'odbc';
	
		var $dsn;
		var $uid;
		var $pwd;
		
		var $type;
		
		function PDOdb($db_type)
		{
			$args = func_get_args();
			$this->type = $db_type;
			
			switch ($db_type)
			{
				case self::ACCESS :
					$args[0] = self::ODBC;
					call_user_func_array(array($this, 'odbc_access'), $args);
					break;

				case self::MSSQL :
					$args[0] = self::ODBC;
					call_user_func_array(array($this, 'odbc_mssql'), $args);
					break;

				case self::MYSQL :
					call_user_func_array(array($this, 'mysql'), $args);
					break;
					
				case self::PGSQL :
					call_user_func_array(array($this, 'pgsql'), $args);
					break;
				
				default : ;
			}
			
			// Instanciate PDO and connect to DB or die
			try 
			{
				parent::__construct($this->dsn, $this->uid, $this->pwd);
				$this->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			}
			catch(PDOException $e)
			{
				echo sprintf("Message : %s<br/><br/>", $e->getMessage());
				die;
			}			
		}
		
		function odbc_access($prefix, $dbq='', $uid='', $pwd='')
		{
			$this->uid = $uid;
			$this->pwd = $pwd;
			
			$dsn_pattern = "$prefix:Driver={Microsoft Access Driver (*.mdb)};Dbq=%s;Uid=%s;Pwd=%s";
			$this->dsn = sprintf($dsn_pattern, $dbq, $uid, $pwd);			
		}
		
		function odbc_mssql($prefix, $server='', $database='', $uid='', $pwd='')
		{
			$this->uid = $uid;
			$this->pwd = $pwd;
			
			$dsn_pattern = "$prefix:Driver={SQL SERVER};Server=%s;Database=%s;Uid=%s;Pwd=%s";
			$this->dsn = sprintf($dsn_pattern, $server, $database, $uid, $pwd);	
		}
		
		function mysql($prefix, $host='', $dbname='', $uid='', $pwd='', $port=3306)
		{
			$this->uid = $uid;
			$this->pwd = $pwd;
			
			$dsn_pattern = "$prefix:host=%s; port=%s; dbname=%s";
			$this->dsn = sprintf($dsn_pattern, $host, $port, $dbname);		
		}
		
		function pgsql($prefix, $host='', $dbname='', $uid='', $pwd='', $port=5432)
		{
			$this->uid = $uid;
			$this->pwd = $pwd;
			$dsn_pattern = "$prefix:host=%s port=%s dbname=%s";
			$this->dsn = sprintf($dsn_pattern, $host, $port, $dbname);		
		}

		function get_dsn()
		{
			return ($this->dsn);
		}		
				
		function in($str_in)
		{
			switch ($this->type)
			{
				case self::ACCESS :
					$str_out = str_replace("'", "''", $str_in);
					break;
					
				case self::MYSQL :
					$str_out = addslashes($str_in);
					break;

				case self::PGSQL :
					$str_out = addslashes($str_in); // TODO : to verify
					break;
					
				default :
					$str_out = $str_in;
			}
			return ($str_out);
		}
	}


	//**************************************************************************************
	// API
	/*
		Class DBids :
		
		add($table_name, $id_name) : Add (table_name => id_name) pair into an internal associative array
			
		echo $dbids : print DBids
			
	*/
	//**************************************************************************************

	// Declare id names for PDOdbp
	class DBids
	{
		var $db_ids = array();
		
		function DBids() {}
		
		function add($table_name, $id_name)
		{
			$this->db_ids[$table_name] = $id_name;
		}
		
		function __tostring()
		{
			$out = '';
			foreach ($this->db_ids as $table => $id)
			{
				$out .= sprintf("<b>%s</b>.%s<br/>", $table, $id);				
			}
			return ($out);
		}
	}
	
	//**************************************************************************************
	// API
	/*
		Class PDOdbp : like PDOdb with a DBids as last argument
		
		PDOdbp(PDO_MYSQL, 'localhost', 'dbfoo', 'login', 'password', $dbids);
			$dbids : a dbids			
	
		SQL SELECT
		==========
		prepare_select($sql) : prepare
			prepare_select("SELECT f1, f2 FROM table")
			
		select($npage=null, $nrow=null) : execute : return an array of rows
			- each row can be an associative array (default) or an object depending of PDOdbp->fetch_mode
			select()
			select(2, 10) : second page, 10 rows
		
		SQL INSERT
		==========
		prepare_insert($table, $fields) : prepare 
			prepare_insert("table", "f1, f2, f3")
		
		insert($values, $seq_name=null) : execute : return last id or -1
			insert(array('v1', 'v2', 3))
		
		SQL UPDATE
		==========
		prepare_update($table, $fields, $id=null, $where=null) : prepare
			prepare_update("table", "f1, f2", 32)
			prepare_update("table", "f1, f2", null, "f4='v4'")
		
		update($values) : execute
			update(array('v1', 2))		
		
		SQL DELETE
		==========
		prepare_delete($table, $ids=null, $where=null) : prepare
			prepare_delete("table") : delete ALL
			prepare_delete("table", 12)
			prepare_delete("table", array(1, 2, 3))
			prepare_delete("table", null, "f1='v1'")
			
		delete() : execute

		NOTES :
			Each prepare_xxx method maintain an return an internal PDOStatement ($pdo_statement)
			$values -- array(v1, v2) -- corresponding to $fields -- "f1, f2" -- are internally binded
			
			To protect values in WHERE statement, it's recommanded to bind values
		
		bind($marker, $value) : bind marker to value for WHERE statement
			$user_value = 'v3';
			PDOdbp->prepare_update("table", "f1, f2", null, "f3=:user_value")
			PDOdbp->bind(:user_value, $user_value)
			PDOdbp->update(array('v1', 2))
		
		Alternative can be
			$pdost = PDOdbp->prepare_update("table", "f1, f2", null, "f3=:user_value")
			$pdost->bindParam(":user_value", $user_value);
			
		Or
			PDOdbp->prepare_update("table", "f1, f2", null, "f3=:user_value")
			PDOdbp->pdo_statement->bindParam(":user_value", $user_value);
			
		property PDOdbp->count : number of selected, updated, or deleted rows
		
		NOTES :
			We can always use PDO native API when needed like :
			PDOdbp->query() for SELECT
			PDOdbp->exec() for INSERT, UPDATE, DELETE		
	*/
	//**************************************************************************************
	
	class PDOdbp extends PDOdb
	{	
		var $db_ids;
		var $pdo_statement;
		var $fetch_mode = PDO::FETCH_NAMED; // PDO::FETCH_OBJ
		var $count = 0;
		
		function PDOdbp()
		{
			$args = func_get_args();
			$this->db_ids = array_pop($args)->db_ids;
						
			// call_user_func_array(array('parent', 'PDOdb'), $args); // works too
			call_user_func_array(array($this, 'parent::PDOdb'), $args);
		}
		
		// override PDO::prepare()
		function prepare($sql, $driver_options = array())
		{
			$this->pdo_statement = parent::prepare($sql, $driver_options);
			return ($this->pdo_statement);
		}
		
		function bind($marker, $value)
		{
			$this->pdo_statement->bindParam($marker, $value);
		}
		
		// SELECT
		function prepare_select($sql)
		{
			return ($this->prepare($sql));
		}
		
		function select($npage=null, $nrow=null)
		{
			$this->pdo_statement->execute();
			$this->pdo_statement->setFetchMode($this->fetch_mode);
			$res = $this->pdo_statement->fetchAll();
			
			$this->count = count($res);
			
			if (!is_null($npage) && !is_null($nrow))
			{
				$limit_min = (($npage -1) * $nrow);
				$res = array_slice($res, $limit_min, $nrow);
			}
			return ($res);
		}

		// INSERT
		var $insert_markers;
		var $insert_table;
		function prepare_insert($table, $fields)
		{
			$this->insert_markers = array();
			$this->insert_table = $table;
			
			$fields = str_replace(' ', '', $fields);
			$array_fields = explode(',', $fields);
			foreach ($array_fields as $field)
			{
				$marker = ":" . $field;
				array_push($this->insert_markers, $marker);
			}
			$str_markers = implode(', ', $this->insert_markers);
			
			$sql = "INSERT INTO $table ($fields) VALUES ($str_markers)";
			
			return ($this->prepare($sql));
		}
		
		function insert($values, $seq_name=null)
		{
			for ($i = 0; $i < count($this->insert_markers); $i++)
			{
				$this->pdo_statement->bindParam($this->insert_markers[$i], $values[$i]);
			}
			
			$this->pdo_statement->execute();
			$this->count = $this->pdo_statement->rowCount();
			return($this->__last_insert_id($this->insert_table, $seq_name));
		}
		
		// UPDATE
		var $update_markers;
		var $update_table;
		var $update_id;
		function prepare_update($table, $fields, $id=null, $where=null)
		{
			$this->update_markers = array();
			$this->update_table = $table;
			$this->update_id = $id;

			$fields = str_replace(' ', '', $fields);
			$array_fields = explode(',', $fields);
			
			$set_markers = array();
			foreach ($array_fields as $field)
			{
				$marker = ":" . $field;
				array_push($this->update_markers, $marker);
				array_push($set_markers, "$field = $marker");
			}
			$str_markers = implode(', ', $set_markers);
			
			if (!is_null($this->update_id))
			{
				$id_name = $this->db_ids[$table];
				$sql = "UPDATE $table SET $str_markers WHERE $id_name = :id";
			}
			elseif (!is_null($where))
			{
				$sql = "UPDATE $table SET $str_markers WHERE $where";
			}

			return ($this->prepare($sql));
		}
		
		function update($values)
		{
			if (!is_null($this->update_id))
			{
				$this->pdo_statement->bindParam(":id", $this->update_id);
			}
			for ($i = 0; $i < count($this->update_markers); $i++)
			{
				$this->pdo_statement->bindParam($this->update_markers[$i], $values[$i]);
			}				
			$this->pdo_statement->execute();
			$this->count = $this->pdo_statement->rowCount();
		}

		//DELETE
		var $delete_ids;
		var $delete_id;
		function prepare_delete($table, $ids=null, $where=null)
		{
			$this->delete_ids = null;
			$this->delete_id = null;
			
			if (!is_null($ids))
			{
				if (is_array($ids))
				{
					$this->delete_ids = $ids;
				}
				else
				{
					$this->delete_id = $ids;
				}
				$id_name = $this->db_ids[$table];
				$sql = "DELETE FROM $table WHERE $id_name = :id";
			}
			elseif (!is_null($where))
			{
				$sql = "DELETE FROM $table WHERE $where";
			}
			else
			{
				$sql = "DELETE FROM $table";
			}
			
			return ($this->prepare($sql));
		}
		
		function delete()
		{
			if (!is_null($this->delete_ids))
			{
				$count = 0;
				$this->pdo_statement->bindParam(":id", $id);
				foreach ($this->delete_ids as $id)
				{
					$this->pdo_statement->execute();
					$count += $this->pdo_statement->rowCount();	
				}
				$this->count = $count;
			}
			elseif (!is_null($this->delete_id))
			{
				$this->pdo_statement->bindParam(":id", $this->delete_id);
				$this->pdo_statement->execute();
				$this->count = $this->pdo_statement->rowCount();
			}
			else
			{
				$this->pdo_statement->execute();
				$this->count = $this->pdo_statement->rowCount();
			}
		}

		function __last_insert_id($table, $seq_name) 
		{
			$last_id = -1;
			try
			{
				$last_id = $this->lastInsertId($seq_name);
			}
			catch(PDOException $e) // ACCESS case
			{
				$id_name = $this->db_ids[$table];
				$res = $this->query("SELECT MAX ($id_name) AS max_id FROM $table");
				if ($row = $res->fetch())
				{
					$last_id = $row['max_id'];
				}
			}
			return ($last_id);
		}
	}
	
	
?>
