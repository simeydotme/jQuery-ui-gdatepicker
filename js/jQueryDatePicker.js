






(function( $ ) {
	
	
	
	
  $.widget( "simey.gdatepicker", {
 
    // These options will be used as defaults
    options: { 
      
		m: { el: 'div', class: 'ui-gdatepicker-month' },
		d: { el: 'span', class: 'ui-gdatepicker-day ui-state-default' },
		
		$dp: $('<div class="ui-gdatepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"/>') ,
		$dptable: $('<div class="ui-gdatepicker-wrapper"/>'),
		$dptablehead: $('<div class="ui-gdatepicker-head"/>'),
		$dptablebody: $('<div class="ui-gdatepicker-body"/>'),
		$dptablefoot: $('<div class="ui-gdatepicker-foot"/>'),
		$dptablemonth: $('<div class="ui-gdatepicker-month/>"'),
		
		dayNames: ['M','T','W','T','F','S','S'],

    },
	
    _setOption: function( key, value ) {
      switch( key ) {
        case "clear":
          this.options.clear = value;
          break;
      }
 
      this._super( "_setOption", key, value );
    },
	
	
	
	
	
	calendarWrite: function() {
		
		this.options.$dptable.append( this.options.$dptablehead , this.options.$dptablebody , this.options.$dptablefoot );
		this.options.$dptable.appendTo( this.options.$dp );
		
	},
	
	calendarFill: function( start, end ) {
		
		var start = start || Date.today().getFullYear() - 20;
		var end = end ||  Date.today().getFullYear() + 20;
		var months = 11;
		
		var yearname, monthname;
		
		// hold the html chunk for calendar
		var html = "";
				
		// for every year in the range
		for ( y=start; y<=end; y++) {
			
			// for every month in this year
			for (m=0; m<=months; m++) {
				
				// get the current month's name
				monthname = new Date(y,m,1).toString('MMMM');
				// display the year number(y) if it's not this year
				if( Date.today().getFullYear() != y ) { yearname = y; }


				// open the month tag
				html += "<"+this.options.m.el+" class=\""+this.options.m.class+"\" data-year=\""+y+"\" data-month=\""+m+"\">";
				
				
				// add padding cells;
				// find out the first day of month(m)
				var offset = new Date(y,m,1).getDay();
				if (offset == 0) { offset=7; }

				// get the number of days in this month
				var days = Date.getDaysInMonth( y , m );
				// for every day in this month
				for (d=1; d<=days; d++) {
					
					var filler = ( d == 1 && offset > 1 ) ? "ui-gdatepicker-divider-left ui-gdatepicker-filler-"+offset : "";
					var divider = ( d <= 7 ) ? "ui-gdatepicker-divider-top" : "";
					
					html += "<"+this.options.d.el+" class=\""+this.options.d.class +" "+filler+" "+divider+"\" data-day=\""+d+"\">";
					html += d;
					html += "</"+this.options.d.el+">";
						
					if( new Date(y,m,d).getDay() == 0 ) {
						html += "<span class=\"ui-gdatepicker-monthname\">"+monthname+" "+yearname+"</span>";
						yearname = ""; monthname = "";
					}
					
				}
				
				// close the month tag
				html += "</"+this.options.m.el+">";
				
			}
			
		};
		
		this.options.$dptablebody.html( html );
			
		this.calendarWrite();
		
	},


    // Set up the widget
    _create: function() {
		
		// cant run if no Date.js library
		if( Date.today === undefined ) { console.log("Date.js Library (http://www.datejs.com/) is required for proper functioning. Destroying gdatepicker."); this._destroy(); return false; }
		
		this.element.after( this.options.$dp );
		
		this.calendarFill(2009,2014);
		this.element.addClass('has-gdatepicker');
		
    },
 
 
    _destroy: function() {
		
		this.element.removeClass('has-gdatepicker');
		console.log('destroy');
		
	}
	
  });
  
  
  
  
  
  
  
}( jQuery ) );