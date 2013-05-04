






(function( $ ) {
	
	
	
	
  $.widget( "simey.gdatepicker", {
 
    // These options will be used as defaults
    options: { 
      	
		yearRange: 3,
		
		m: { el: 'div', class: 'ui-gdatepicker-month' },
		d: { el: 'span', class: 'ui-gdatepicker-day' },
		
		$dp: $('<div class="ui-gdatepicker"/>') ,
		$dptable: $('<div class="ui-gdatepicker-wrapper"/>'),
		$dptablehead: $('<div class="ui-gdatepicker-head"/>'),
		$dptablebody: $('<div class="ui-gdatepicker-body"/>'),
		$dptablemonth: $('<div class="ui-gdatepicker-month"/>'),
		$dpmask: $('<div class="ui-gdatepicker-mask"/>'),
		$dpuparrow: $('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-up"><span>previous month</span></div>'),
		$dpdownarrow: $('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-down"><span>next month</span></div>'),
		$dpupyeararrow: $('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-up double"><span>previous year</span></div>'),
		$dpdownyeararrow: $('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-down double"><span>next year</span></div>'),
		
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
	
	show: function() {
		
		this.options.$dp.addClass('ui-gdatepicker-show');
		
	},
	hide: function() {
	
		this.options.$dp.removeClass('ui-gdatepicker-show');
		
	},
	
	selectDay: function( el ) {
		
		$(el).addClass('ui-gdatepicker-selected');
		
	},
	
	_getYearRange: function( start, end ) {
		
		if( start === undefined ) {
			var start = Date.today().getFullYear() - (Math.floor(this.options.yearRange*0.5));	
		}
		
		if( end === undefined ) {
			var end = Date.today().getFullYear() + (Math.round(this.options.yearRange*0.5));
		}
		
		return [start,end];
		
	},
	
	
	_calendarBuild: function() {
		
		this.options.$dptable.append( this.options.$dptablehead , this.options.$dptablebody , this.options.$dpuparrow , this.options.$dpdownarrow , this.options.$dpupyeararrow , this.options.$dpdownyeararrow );
		this.options.$dptable.appendTo( this.options.$dp );
		this.options.$dp.before( this.options.$dpmask );
		
	},
	
	_calendarFill: function( yearStart, yearEnd ) {
		
		var yearRange = this._getYearRange( yearStart, yearEnd );
		console.log( yearRange );
		
		var months = 11;
		var yearname, monthname;
		

		
				
		// for every year in the range
		var html = "";
		for ( y=yearRange[0]; y<=yearRange[1]; y++) {
			
			// for every month in this year
			for (m=0; m<=months; m++) {
				
				// get the current month's name
				monthname = new Date(y,m,1).toString('MMMM');
				// get the year number(y) if it's not this year
				var yearname = ( Date.today().getFullYear() != y ) ? y : "";


				// find out the first day of month(m) and call it offset
				var offset = new Date(y,m,1).getDay();
				if (offset == 0) { offset=7; }

				// get the number of days in this month
				var days = Date.getDaysInMonth( y , m );
				// for every day in this month
				for (d=1; d<=days; d++) {
					
					// set some variables for styling the calendar
					var filler = ( d == 1 && offset > 1 ) ? "ui-gdatepicker-divider-left" : "";
					var divider = ( d <= 7 ) ? "ui-gdatepicker-divider-top" : "";
					var gap = ( y == yearRange[0] && m == 0 && d == 1 ) ? "ui-gdatepicker-filler-"+offset : "";
					
					html += "<"+this.options.d.el+" class=\""+this.options.d.class +" "+filler+" "+divider+" "+gap+"\" data-day=\""+d+"\">";
					html += d;
					html += "</"+this.options.d.el+">";
					
					// at the end of each week, either show the month and year, or just start a new row.
					if( (offset+(d-1))%7 == 0 ) {
						if( (offset+(d-1)) < 8 ) {
							html += "<span class=\"ui-gdatepicker-monthname ui-gdatepicker-divider-top ui-gdatepicker-newline\" data-year=\""+y+"\" data-month=\""+m+"\">"+monthname+" "+yearname+"</span>";
						} else {
							html += "<span class=\"ui-gdatepicker-newline\"></span>";
						}
					}
					
				}
				
			}
			
		}; this.options.$dptablebody.html( html );
		
		
		
		// populate the head with the days
		headHtml = ""; var that = this;
		$.each( this.options.dayNames , function(k,v) {
			
			headHtml += "<"+that.options.d.el+" class=\""+that.options.d.class +"\" data-day=\""+v+"\">";
			headHtml += v;
			headHtml += "</"+that.options.d.el+">";
			
		}); this.options.$dptablehead.html( headHtml );
		
		
		
		
			
		this._calendarBuild();
		
	},


    // Set up the widget
    _create: function() {
		
		// cant run if no Date.js library
		if( Date.today === undefined ) { console.log("Date.js Library (http://www.datejs.com/) is required for proper functioning. Destroying gdatepicker."); this._destroy(); return false; }
		
		// fill the calendar with datey goodness.
		// give the element a class to reflect it has a datepicker.
		this._calendarFill();
		this.element.addClass('has-gdatepicker');
				
		// bind the element to show/hide. 
		// don't close when clicking on the calendar or the element.
		var that = this;
		$('html').on('click.gdatepicker', function(e) { that.hide(); });
		this.element.on('focus.gdatepicker', function(e) { that.show(); });
		this.element.on('click.gdatepicker', function(e) { e.stopPropagation(); });
		this.options.$dp.on('click.gdatepicker', function(e) { e.stopPropagation(); });
		
		
		this.options.$dp.on('click.gdatepicker', '.ui-gdatepicker-day', function(e) {
			that.selectDay( $(this) );
		});
		
		
		// whack that bad boy into the DOM.
		$('body').append( this.options.$dp );
		
    },
 
 	// destroy the widget
    _destroy: function() {
		
		this.element.removeClass('has-gdatepicker');
		this.options.$dp.remove();
		
		this.element.off('.gdatepicker');
	}
	
  });
  
  
  
  
  
  
  
}( jQuery ) );