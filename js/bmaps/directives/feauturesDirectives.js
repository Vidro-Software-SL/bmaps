






app.directive("featureAttribute",function($rootScope){
	var elem 			= null;

	var _template 	= '<div ng-show="datasource.name != \'geometry\' && datasource.name != \'foto_node_id\'" class="feature">';

		_template 		+= '<div class="fieldname">{{datasource.name}}: <span ng-show="showLabel && fieldValue!=\'NULL\'">{{fieldValue}}</div>';

		_template 		+= '<div class="actions" ng-show="canEdit && datasource.name!=\'id\' && datasource.name!=\'pol_id\' && datasource.name!=\'arc_id\' ">';
		_template 			+= '<button ng-click="edit()" ng-show="editBt" class="btn">Edit Button</button>';
		_template			+= '<div class="update-group" ng-show="showInput">';
		_template 				+= '<input type="text" ng-model="fieldValue">';
		_template				+= '<button ng-click="update()" class="btn btn-accent"><img src="img/ic/ic_feature-edit-save.svg" alt="Update" /></button>';
		_template 				+= '<button ng-click="cancelEdit()" class="btn btn-default-light"><img src="img/ic/ic_feature-edit-cancel.svg" alt="Cancel" /></button>';
		_template 			+= '</div>';
		_template 		+= '</div>';

		_template 	+= '</div>';


	return {
		restrict: 		'E',
		replace: 		'true',
		scope: 			{
							datasource			: '=',
							canEdit				: '=',
							updateAction		:'&'
						},
		template: 		_template,

		link: 			function(scope, _elem, attrs) {
							scope.showInput		= false;
							scope.showLabel		= true;
							scope.editBt		= true;
							scope.actionBt		= false;
							scope.fieldName		= scope.datasource.name;

							if(scope.fieldName=="sae"){
							}
							scope.fieldValue	= scope.datasource.value;
							scope.edit = function(){
								scope.showInput		= true;
								scope.showLabel		= false;
								scope.editBt		= false;
								scope.actionBt		= true;
							}

							scope.cancelEdit = function(){
								scope.showInput		= false;
								scope.showLabel		= true;
								scope.editBt		= true;
								scope.actionBt		= false;
							}

							scope.update	= function(){
								scope.showInput			= false;
								scope.showLabel			= true;
								scope.editBt			= true;
								scope.actionBt			= false;
								var data2Update			= {};
								data2Update.fieldName	= scope.fieldName;
								data2Update.fieldValue	= scope.fieldValue;
								$rootScope.$broadcast('updateAttribute',data2Update);
							}

							elem 	= _elem;
							elem.bind('click', function() {
								scope.$apply(function() {
								});

						})
    	}


    }


});

app.directive("featureAttributeBoolean",function($rootScope){
	var elem 			= null;
	//var _template 	= '<span><b>{{datasource.name}}:</b> {{datasource.value}}</span>E: {{editable}}<span ng-show="editable">EDITA</span></span>';

	var _template 	= '<span ng-show="datasource.name != \'geometry\' && datasource.name != \'foto_node_id\'">';
		_template 	+= '<span><span class="fieldname">{{datasource.name}}:</span> <span ng-show="showLabel && fieldValue!=\'NULL\'">{{fieldValue}}</span></span>';

		_template 	+= ' <span ng-show="canEdit && datasource.name!=\'id\' && datasource.name!=\'pol_id\' && datasource.name!=\'arc_id\' ">';
		_template 	+= ' <button ng-show="editBt" ng-click="edit()" class="btn btn-xs btn-primary-custom pull-right"><i class="fa fa-pencil"></i></button>';
		_template 	+= ' <button ng-show="actionBt" class="btn btn-xs btn-danger-custom pull-right"><i class="fa fa-times" ng-click="cancelEdit()"></i></button> <button ng-show="actionBt" class="btn btn-xs btn-success-custom pull-right"><i class="fa fa-check" ng-click="update()"></i></button> ';

		_template 	+= '<span ng-show="showInput" class="pull-right">';

		_template	+= '<select ng-model="fieldValue">';
			_template 	+= '<option value="" selected>Seleccionar</option>';
			_template 	+= '<option value="t" selected>Si</option>';
			_template 	+= '<option value="f">No</option>';
		_template 	+= '</select>';
		_template 	+= '</span>';

		_template 	+= '</span>';
		_template 	+= '</span>';



	return {
		restrict: 		'E',
		replace: 		'true',
		scope: 			{
							datasource			: '=',
							canEdit				: '=',
							updateAction		:'&'
						},
		template: 		_template,

		link: 			function(scope, _elem, attrs) {
							scope.showInput		= false;
							scope.showLabel		= true;
							scope.editBt		= true;
							scope.actionBt		= false;
							scope.fieldName		= scope.datasource.name;

							if(scope.fieldName=="sae"){
							}
							scope.fieldValue	= scope.datasource.value;
							scope.edit = function(){
								scope.showInput		= true;
								scope.showLabel		= false;
								scope.editBt		= false;
								scope.actionBt		= true;
							}

							scope.cancelEdit = function(){
								scope.showInput		= false;
								scope.showLabel		= true;
								scope.editBt		= true;
								scope.actionBt		= false;
							}

							scope.update	= function(){
								scope.showInput			= false;
								scope.showLabel			= true;
								scope.editBt			= true;
								scope.actionBt			= false;
								var data2Update			= {};
								data2Update.fieldName	= scope.fieldName;
								data2Update.fieldValue	= scope.fieldValue;
								$rootScope.$broadcast('updateAttribute',data2Update);
							}

							elem 	= _elem;
							elem.bind('click', function() {
								scope.$apply(function() {
								});

						})
    	}


    }


});


//directive, on add picture show preview
app.directive("ngFileSelect",function(){
	return {
		link: function($scope,el){
			el.bind("change", function(e){
					$scope.file = (e.srcElement || e.target).files[0];
					$scope.showContent();
				})
		}
	}
});
//directive for show loading until legend image is loaded
app.directive('legendload', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
               scope.mc.loadingLegend = false;
			   scope.$apply();
            });
            element.bind('error', function(){
                //alert('image could not be loaded');
            });
        }
    };
});
