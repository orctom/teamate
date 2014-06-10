$(function() {
	$('#side-menu').metisMenu({toggle: false});
	$('#servers').metisMenu({toggle: false});
	
	$('table').on('click', 'tbody tr', function(event) {
	    $(this).addClass('highlight').siblings().removeClass('highlight');
	});
});