


$(function() {

$.widget( "simey.gdatepicker", {
		
		_dp: $('<div class="ui-gdatepicker"/>'),
		_dpElement: $('<div class="ui-gdatepicker-input" contenteditable="true"/>'),
		
		_activeMonth:  Date.today().getMonth(),
		_activeYear:  Date.today().getFullYear(),

		options: { 
      	
			yearRange: 5,
			scrollSpeed: 300,
			dayNames: ['M','T','W','T','F','S','S'],
			placeholderText: "Select a date",
			selectedDate: [ Date.today().getFullYear() , Date.today().getMonth() , Date.today().getDay() ],
			dateFormat: "dd-MM-yyyy"
		
		},
		
		_createElements: function() {
			
			var $dpWrapper = 			$('<div class="ui-gdatepicker-wrapper"/>');
			var $dpHead = 				$('<div class="ui-gdatepicker-head"/>');
			var $dpBody = 				$('<div class="ui-gdatepicker-body"/>');
			var $dpUpArrow = 			$('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-up"><span>previous month</span></div>');
			var $dpDownArrow = 			$('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-down"><span>next month</span></div>');
			var $dpUpArrowYear = 		$('<div class="ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-up-year"><span>previous year</span></div>');
			var $dpDownArrowYear = 		$('<div class="ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-down-year"><span>next year</span></div>');
			
			$dpHead.html( this._calendarHeadPopulate() );
			$dpBody.html( this._calendarPopulate() );
			
			$dpWrapper.append( $dpHead, $dpBody, $dpUpArrow, $dpDownArrow, $dpUpArrowYear, $dpDownArrowYear );
			this._dp.append( $dpWrapper ).appendTo( $('body') );
			
			if( this.element.attr('placeholder') !== undefined ) { this.options.placeholderText = this.element.attr('placeholder'); }
			this._dpElement.text( this.options.placeholderText ).insertAfter( this.element );
			
		},
		
		_positionCalendar: function(e) {
			
			var inputPos = this._dpElement.position();
			var inputSize = { h: this._dpElement.outerHeight() , w: this._dpElement.outerWidth() }
			this._dp.position({ my: 'left top+3', at: 'left bottom', of: this._dpElement });
			
		},
		
		show: function(e) {
			
			this.moveToMonth( this.options.selectedDate[1] , this.options.selectedDate[0] );
			this._dp.addClass('ui-gdatepicker-show');
			this._positionCalendar();
			this._dpElement.addClass('ui-gdatepicker-active');
			
			e.stopPropagation();
		},
		
		hide: function() {
			this._dp.removeClass('ui-gdatepicker-show');
			this._dpElement.removeClass('ui-gdatepicker-active');
		},
		
		selectDay: function( e ) {
			
			var $el = $(e.target);
			this._dp.find('.ui-gdatepicker-selected').removeClass('ui-gdatepicker-selected');
			$el.first().addClass('ui-gdatepicker-selected');
			
			
			this.options.selectedDate = [ $el.first().data('year') , $el.first().data('month') , $el.first().data('day') ];
			
			var date = new Date( $el.first().data('year'), $el.first().data('month'), $el.first().data('day') );
			var t = date.toString('MMM dSX yyyy').replace("SX", date.getOrdinal());
			
			this._dpElement.text( t ).addClass( 'ui-gdatepicker-input-set' );
			this.element.val( date.toString( this.options.dateFormat ) );
			
		},
		
		_focusInputElement: function( e ) {
			
			this._dpElement.trigger('focus'); 
			e.stopPropagation();
			
		},
		
		_highlightMonth: function( e ) {
		
			var $el = $(e.target);
			var $month = this._dp.find('.ui-gdatepicker-monthname[data-year='+ $el.data('year') +'][data-month='+ $el.data('month') +']');
			
			if( !$month.hasClass('ui-gdatepicker-monthname-highlight') ) {
				this._dp.find('.ui-gdatepicker-monthname-highlight').removeClass('ui-gdatepicker-monthname-highlight')
				$month.addClass('ui-gdatepicker-monthname-highlight');	
			}
			
		},
				
		upOneMonth: function() {
			this._activeMonth = this._activeMonth-1;
			if( this._activeMonth == -1 ) { this._activeMonth = 11; this._activeYear = this._activeYear -1;	}
			this.moveToMonth();
		},
				
		upOneYear: function() {
			this._activeYear = this._activeYear-1;
			this.moveToMonth( null, null, (this.options.scrollSpeed*2.5) );
		},
				
		downOneMonth: function() {
			this._activeMonth = this._activeMonth+1;
			if( this._activeMonth == 12 ) { this._activeMonth = 0; this._activeYear = this._activeYear +1;	}
			this.moveToMonth();
		},
				
		downOneYear: function() {
			this._activeYear = this._activeYear+1;
			this.moveToMonth( null, null, (this.options.scrollSpeed*2.5) );
		},
				
		_getScrolledPos: function(month,year) {
			
			// offset is the distance we want to scroll above (1 row = ~24)
			var offset = 24;
			// store the body element
			var $el = this._dp.find('.ui-gdatepicker-body');
			// find scrolled position of the body
			var top = $el.scrollTop();
			var yearRange = this._getYearRange();
			
			// if we can find a year and month, scroll to it
			if( $el.find('[data-year='+ year +'][data-month='+ month +']').length > 0 ) {
				var mt = top +$el.find('[data-year='+ year +'][data-month='+ month +']').position().top - offset;
				this._activeYear = year;
				this._activeMonth = month;
			
			// if the chosen year is less than the selectable year range, go to beginning
			} else if( year < yearRange[0] ) {
				var mt = top + $el.find('.ui-gdatepicker-monthname').first().position().top - offset;
				this._activeYear = yearRange[0];
				this._activeMonth = 0;

			// if the chosen year is more than the selectable year rang, go to the end
			} else if( year > yearRange[1] ) {
				var mt = top + $el.find('.ui-gdatepicker-monthname').last().position().top - offset;
				this._activeYear = yearRange[1];
				this._activeMonth = 11;
			}
			
			return mt;
				
		},

		moveToMonth: function( month, year, duration ) {
			
			var $el = this._dp.find('.ui-gdatepicker-body');
			
			if( month === undefined || month === null ) { var month = this._activeMonth; }
			if( year === undefined  || year === null ) { var year = this._activeYear; }
			if( duration === undefined ) { var duration = this.options.scrollSpeed; }
			
			
			if( this._dp.is(':visible') ) {
				// if the element is visible / active, we scroll down to the chosen month.
				$el.stop(true).animate({'scrollTop': this._getScrolledPos(month,year) }, duration );
			} else {
				// if the element is hidden, we need to trick it to be visible
				// very quickly, then change it's scroll position, and revert it's positioning.
				var position = this._dp.css('top');
				this._dp.css({'top':'-30000px', 'display': 'block'});
				$el.scrollTop( this._getScrolledPos(month,year) );
				this._dp.css({'top':position, 'display':""});
			}
			
			// ----------------------------------------------------- //
			console.log( this._activeYear + ' ' + this._activeMonth );
			// ----------------------------------------------------- //

		},
		
		// bind the calendar to show/hide. 
		// don't close when clicking on the calendar or the element.
		_bindEvents: function() {
			
			$(window).on('resize.gdatepicker', $.proxy(this._handlers.positionCalendar,this));
			
			// html/body events
			$('html').on('click.gdatepicker.html', $.proxy(this._handlers.hide,this));
			
			// input/element events
			this._dpElement.on('focus.gdatepicker.el', $.proxy(this._handlers.show,this));
			this.element.on('focus.gdatepicker.el', $.proxy(this._handlers.focusInputElement,this));
			
			// calendar wrapper events
			this._dp.on('click.gdatepicker', function(e) { e.stopPropagation(); });
			this._dpElement.on('click.gdatepicker', function(e) { e.stopPropagation(); });
			this.element.on('click.gdatepicker', function(e) { e.stopPropagation(); });
			
			// calendar body events
			if( $.event.special.mousewheel !== undefined ) {
				// enable mouse wheel if the plugin is defined
				this._dp.on('mousewheel.gdatepicker', '.ui-gdatepicker-body', $.proxy(this._handlers.mouseWheel,this));
			}
			
			
			// day cell events
			this._dp.on('click.gdatepicker.day', '.ui-gdatepicker-body .ui-gdatepicker-day', $.proxy(this._handlers.selectDay,this));
			this._dp.on('mouseenter.gdatepicker.day', '.ui-gdatepicker-body .ui-gdatepicker-day', $.proxy(this._handlers.hoverDay,this));
			
			// move arrow events
			this._dp.on('click.gdatepicker.arrows', '.ui-gdatepicker-scroll-arrow-up', $.proxy(this._handlers.upOneMonth,this));
			this._dp.on('click.gdatepicker.arrows', '.ui-gdatepicker-scroll-arrow-up-year', $.proxy(this._handlers.upOneYear,this));
			this._dp.on('click.gdatepicker.arrows', '.ui-gdatepicker-scroll-arrow-down', $.proxy(this._handlers.downOneMonth,this));
			this._dp.on('click.gdatepicker.arrows', '.ui-gdatepicker-scroll-arrow-down-year', $.proxy(this._handlers.downOneYear,this));
			
		},
		// This is used to maintain the 'this' scope, 
		// basically a 'proxy' for all events.
		_handlers: {
			
			hide: function() { this.hide(); },
			show: function(e) { this.show(e); },
			
			positionCalendar: function(e) { this._positionCalendar(e); } ,
			focusInputElement: function(e) { this._focusInputElement(e); } ,
			
			selectDay: function(e) { this.selectDay(e); },
			hoverDay: function(e) { this._highlightMonth(e); },
			
			mouseWheel: function(e,delta) { if( delta > 0 ) { this.upOneMonth(); } else if( delta < 0 ) { this.downOneMonth(); }},
			
			upOneMonth: function(e) { this.upOneMonth(); },
			upOneYear: function(e) { this.upOneYear(); },
			downOneMonth: function(e) { this.downOneMonth(); },
			downOneYear: function(e) { this.downOneYear(); }
			
		},
        _create: function() {
			
			// cant run if no Date.js library
			if( Date.today === undefined ) { 
				console.log("Date.js Library (http://www.datejs.com/) is required for proper functioning. Destroying gdatepicker."); 
				this._destroy(); 
				return false; 
			}
			
			this._createElements();
			this._bindEvents();
			this.element.addClass('has-gdatepicker');
			
        },
		
		// Destroy the Widget
		_destroy: function() {
			
			this.element.removeClass('has-gdatepicker');
			
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

		_calendarPopulate: function( yearStart, yearEnd ) {
			
			var yearRange = this._getYearRange( yearStart, yearEnd );
			console.log( "Populating Calendar from " +yearRange[0]+ " to " +yearRange[1] );
			
			var months = 11, yearname, monthname;
			
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
						
						html += "<span class=\"ui-gdatepicker-day " +filler+" "+divider+" "+gap+"\" data-day=\""+d+"\" data-year=\""+y+"\" data-month=\""+m+"\">";
						html += d;
						html += "</span>";
						
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
				
			};
			
			return html;
			
		},
		
		_calendarHeadPopulate: function() {
			
			// populate the head with the days
			headHtml = "";
			//$.each( this.options.dayNames , function(k,v) {
			
			for( i=0; i<this.options.dayNames.length; i++ ) {
			
				headHtml += "<span class=\"ui-gdatepicker-day\" data-day=\""+this.options.dayNames[i]+"\">";
				headHtml += this.options.dayNames[i];
				headHtml += "</span>";
				
			}; 
			
			return headHtml;
					
		}
		
		
		
});

});