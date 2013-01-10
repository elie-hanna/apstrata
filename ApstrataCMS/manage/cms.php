<?php
	class CMS {
	
	    public function __construct($config, $pageId) {
	        $this->config = $config;
			$this->pageId = $pageId;
	    }
	
		public function getMenu() {
			if ($GLOBALS["config"]["useStub"]) return $GLOBALS["testData"]["menu"];
			
			$url = $GLOBALS["config"]["apstrataServiceURL"] . "/" . $GLOBALS["config"]["apstrataKey"] . '/RunScript?apsdb.scriptName=apstrata.getMenu';
			$result = file_get_contents ($url); 
			
			if ($result != FALSE) {
				eval("\$menu =" . $result);				
				if ($menu["pageFound"]=="1") {
					return $menu;
				} else {
					return array (
						"menuPhp" => array(),
						"leftFooterPhp" => array(),
						"rightFooterPhp" => array()
					);
				}
			} else {
				return array (
					"title" => "internal server error",
					"template" => "internalError"
				);
			}
		
		}
		
		public function getPage($id) {
					
			if ($GLOBALS["config"]["useStub"]) {
				if ($id == "home") return $GLOBALS["testData"]["home"];
				
				if ($id == "catalog") return $GLOBALS["testData"]["collection"];
				else return $GLOBALS["testData"]["page"];
			}

			// apstrata dockey can't contain forward slashes(/), replace them with dots (.)
			$id = str_replace("/", ".", $id);
		
			$url = $GLOBALS["config"]["apstrataServiceURL"] . "/" . $GLOBALS["config"]["apstrataKey"] . '/RunScript?apsdb.scriptName=apstrata.getPageJSon&page=' . $id;
			$result = file_get_contents ($url); 
		
			//Page content as associative array
			$page = json_decode($result, true);
								
			if ($result != FALSE) {
				//$error = eval("\$page =" . $result);				
				
				if ($page["pageFound"]=="1") {							
					return $page;
				} else {
					return array (
						"title" => "page not found",
						"template" => "pageNotFound"
					);
				}
			} else {
				return array (
					"title" => "internal server error",
					"template" => "internalError"
				);
			}
			
			return $page;
		}
		
		/**
		 * Calls a saved query that returns specific pages from the CMS ($category)
		 */
		public function getPages($category) {
			
			//TODO: implement corresponding stub		
			if ($GLOBALS["config"]["useStub"]) {
				
			}

			// apstrata dockey can't contain forward slashes(/), replace them with dots (.)
			$id = str_replace("/", ".", $id);
		
			$url = $GLOBALS["config"]["apstrataServiceURL"] . "/" . $GLOBALS["config"]["apstrataKey"] . '/RunScript?apsdb.scriptName=apstrata.getPagesByCategory&category=' . $category;
			
			$result = file_get_contents ($url); 			
				
			//Page content as associative array
			$page = json_decode($result, true);				
			if ($result != FALSE) {
								
				if (count($page) > 0) {							
					return $page;
				} else {
					return array (
						"title" => "page not found",
						"template" => "pageNotFound"
					);
				}
			} else {
				return array (
					"title" => "internal server error",
					"template" => "internalError"
				);
			}
			
			return $page;
		}
		
		public function getLink($item) {
			$url='';
			$class='';
			$link='';

			if (isset($item['link']) && ($item['link'] != "")) { 
				$url = $item['link'];
			} else if (isset($item['id'])) { 
				$url = $this->getUrl($item['id']);
				if ($item['id'] == $this->pageId) $class="class='selected'";
			}

			if (isset($item['target'])) {
				$url = $url . "' target='" . $item['target'];
			}

			if (isset($item['type'])) {
				if ($item['type']=='external') {
					$url = $item['url'] . "' target='_new";
				}
			} 
			
			
			if (isset($item['title'])) $link = "<a " . $class . " href='" . $url . "' id='" . $item[title]. "Link'>" .  $item['title'] . "</a>";
						
			return $link;
		}
		
		/**
		 * Calls a script that returns an array of all links and for each link, an array of sub-links if available
		 * (otherwise the array is empty) 
		 */
		public function getLinks() {
			
			$url = $GLOBALS["config"]["apstrataServiceURL"] . "/" . $GLOBALS["config"]["apstrataKey"] . '/RunScript?apsdb.scriptName=apstrata.getLinks';
			$result = file_get_contents ($url); 
			$links = json_decode($result, true);
			if ($result != FALSE) {
								
				if ($links["status"]=="1") {									
					return $links["links"];
				} else {
					return array (
						"links" => array()						
					);
				}
			} else {
				return array (
					"title" => "internal server error",
					"template" => "internalError"
				);
			}
		}

		public function getUrl($path) {
			return $this->config['baseUrl']."/".$this->config['urlPrefix'] . $path;
			
		}
	}
?>
