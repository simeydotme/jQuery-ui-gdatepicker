






(function( $ ) {
	
	
	
	
  $.widget( "simey.gdatepicker", {
 	
	$dp: $('<div class="ui-gdatepicker"/>'),
	
    // These options will be used as defaults
    options: { 
      	
		yearRange: 11,
		scrollSpeed: 600,
		
		m: { el: 'div', class: 'ui-gdatepicker-month' },
		d: { el: 'span', class: 'ui-gdatepicker-day' },
		
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
	
	_activeMonth:  Date.today().getMonth(),
	_activeYear:  Date.today().getFullYear(),
	
	
	
	
	show: function() {
		this.$dp.addClass('ui-gdatepicker-show');
	},
	
	hide: function() {
		this.$dp.removeClass('ui-gdatepicker-show');
	},
	
	selectDay: function( el ) {
		this.$dp.find('.ui-gdatepicker-selected').removeClass('ui-gdatepicker-selected');
		$(el).first().addClass('ui-gdatepicker-selected');
	},
	
	_getYearRange: function( start, end ) {
		
		if( start === undefined ) {
			if( this.options.yearRange == 1 ) { var start = Date.today().getFullYear(); }
			else { var start = Date.today().getFullYear() - (Math.floor(this.options.yearRange*0.5)); }
		}
		
		if( end === undefined ) {
			if( this.options.yearRange == 1 ) { var end = Date.today().getFullYear(); }
			else { var end = Date.today().getFullYear() + (Math.floor(this.options.yearRange*0.5)); }
		}
		
		return [start,end];
		
	},
	
	

	
	moveToMonth: function( month, year, duration ) {
		
		if( month === undefined ) { var month = this._activeMonth; }
		if( year === undefined ) { var year = this._activeYear; }
		if( duration === undefined ) { var duration = this.options.scrollSpeed; }
		
		var getScrolledPos = function(that) {
			
			// find scrolled position of the body
			var btop = that.options.$dptablebody.scrollTop();
			
			// if we can find a year and month, scroll to it, otherwise scroll to the end?
			if( that.options.$dptablebody.find('[data-year='+ year +'][data-month='+ month +']').length > 0 ) {
				var mt = btop + that.options.$dptablebody.find('[data-year='+ year +'][data-month='+ month +']').position().top - 24;
			} else if( year < parseInt( that.options.$dptablebody.find('.ui-gdatepicker-monthname').first().data('year') ) ) {
				var mt = btop + that.options.$dptablebody.find('.ui-gdatepicker-monthname').first().position().top - 24;
			} else if( year > parseInt( that.options.$dptablebody.find('.ui-gdatepicker-monthname').last().data('year') ) ) {
				var mt = btop + that.options.$dptablebody.find('.ui-gdatepicker-monthname').last().position().top - 24;
			}
			
			return mt;
			
		};
		
		
		// if the element is hidden, we need to trick it to change it's scroll position.
		if( this.$dp.is(':visible') ) {
			this.options.$dptablebody.animate({'scrollTop': getScrolledPos() }, duration );
		} else {
			var position = this.$dp.css('top');
			this.$dp.css('top','-30000px'); this.show();
			this.options.$dptablebody.scrollTop( getScrolledPos(this) );
			this.hide(); this.$dp.css('top',position);
		}
		
	},
	
	_setEventBindings: function() {
		
		var that = this;
		
		// bind the calendar to show/hide. 
		// don't close when clicking on the calendar or the element.
		$('html').on('click.gdatepicker', function(e) { that.hide(); });
		this.element.on('focus.gdatepicker', function(e) { that.show(); });
		this.element.on('click.gdatepicker', function(e) { e.stopPropagation(); });
		this.$dp.on('click.gdatepicker', function(e) { e.stopPropagation(); });
		
		this.options.$dpuparrow.on('click.gdatepicker', function(e) {
			
			that._activeMonth -= 1;
			
		});
		
		this.$dp.on('click.gdatepicker', '.ui-gdatepicker-day', function(e) { that.selectDay( $(this) ); });
		
		this._activeMonth = that._activeMonth;
		this._activeYear = that._activeYear;
		
		
		console.log( this._activeMonth );

	},










    // Create the Widget
    _create: function() {
		
		base = this;
		
		// cant run if no Date.js library
		if( Date.today === undefined ) { console.log("Date.js Library (http://www.datejs.com/) is required for proper functioning. Destroying gdatepicker."); this._destroy(); return false; }
		
		// fill the calendar with datey goodness.
		// give the element a class to reflect it has a datepicker.
		this._calendarFill();
		
		this.element.addClass('has-gdatepicker');
				
		this._setEventBindings();
		
		// whack that bad boy into the DOM.
		$('body').append( this.$dp );
		
		//this.show();
		this.moveToMonth( this._activeMonth, this._activeYear, 0 );
		//this.hide();
		
    },
 
 	// Destroy the Widget
    _destroy: function() {
		
		this.element.removeClass('has-gdatepicker');
		this.$dp.remove();
		
		this.element.off('.gdatepicker');
	},
	
	
	
	
	
	
	
	
	// main grunt functions for building hte calendar
	
	_calendarBuild: function() {
		
		this.options.$dptable.append( this.options.$dptablehead , this.options.$dptablebody , this.options.$dpuparrow , this.options.$dpdownarrow , this.options.$dpupyeararrow , this.options.$dpdownyeararrow );
		this.options.$dptable.appendTo( this.$dp );
		this.$dp.before( this.options.$dpmask );
		
	},
	
	_calendarFill: function( yearStart, yearEnd ) {
		
		var yearRange = this._getYearRange( yearStart, yearEnd );
		console.log( "Populating Calendar from " +yearRange[0]+ " to " +yearRange[1] );
		
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
					
					html += "<"+this.options.d.el+" class=\""+this.options.d.class +" "+filler+" "+divider+" "+gap+"\" data-day=\""+d+"\" data-year=\""+y+"\" data-month=\""+m+"\">";
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
		
	}
	
  });
  
  
  
  
  
  
  
}( jQuery ) );