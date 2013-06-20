


$(function() {

$.widget( "simey.gdatepicker", {
		
		_dp: $('<div class="ui-gdatepicker"/>'),
		_dpElement: $('<input class="ui-gdatepicker-input" type="text"/>'),
		
		_activeMonth: Date.today().getMonth(),
		_activeYear: Date.today().getFullYear(),

		options: { 
      	
			yearStart: Date.today().getFullYear()-1,
			scrollSpeed: 90,
			dayNames: ['M','T','W','T','F','S','S'],
			placeholderText: "Select a date",
			dateFormat: "dd-MM-yyyy",
			dateDisplay: "MMM dSX, yyyy",
			
			selectedDate: [ Date.today().getFullYear() , Date.today().getMonth() , Date.today().getDate() ]
		
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
			this._dpElement.prop('placeholder', this.options.placeholderText).insertAfter( this.element );
						
			var val = this.element.val();
			var form = this.options.dateFormat;
			
			if( val !== "") {
				
				if( Date.parseExact( val, form ) !== null ) {
					this._activeMonth = Date.parseExact( val, form ).getMonth();
					this._activeYear = Date.parseExact( val, form ).getFullYear();
					this.options.selectedDate = [ Date.parseExact( val, form ).getFullYear() , Date.parseExact( val, form ).getMonth() , Date.parseExact( val, form ).getDate() ];
				}
				this.selectDay();
				
			}
			
		},
		
		_positionCalendar: function(e) {
			
			var inputPos = this._dpElement.position();
			var inputSize = { h: this._dpElement.outerHeight() , w: this._dpElement.outerWidth() }
			this._dp.position({ my: 'left top+3', at: 'left bottom', of: this._dpElement });
			
		},
		
		show: function(e) {
			
			this._dpElement.addClass('ui-gdatepicker-active');
			
			this._activeYear = this.options.selectedDate[0];
			this._activeMonth = this.options.selectedDate[1];
			this._dp.find('.ui-gdatepicker-body').empty().prepend( this._calendarPopulate() );
			this.moveToMonth();
			
			this._dp.addClass('ui-gdatepicker-show');
			this._positionCalendar();
			
			if( e !== undefined) { e.stopPropagation(); }
			
		},
		
		hide: function() {
			this._dp.removeClass('ui-gdatepicker-show');
			this._dpElement.removeClass('ui-gdatepicker-active');
		},
		
		_highlightDay: function( e ) {
			
			var $el = $('[data-year='+this.options.selectedDate[0]+'][data-month='+this.options.selectedDate[1]+'][data-day='+this.options.selectedDate[2]+']');
			this._dp.find('.ui-gdatepicker-selected').removeClass('ui-gdatepicker-selected');
			if( $el.length > 0 ) { $el.first().addClass('ui-gdatepicker-selected'); }
			
		},
		
		selectDay: function( day, month, year ) {

			if( day !== undefined ) { this.options.selectedDate = [ year , month , day ]; }
					
			var date = new Date( this.options.selectedDate[0], this.options.selectedDate[1], this.options.selectedDate[2] );
			var t = date.toString( this.options.dateDisplay ).replace("SX", date.getOrdinal());
			
			this._dpElement.val( t ).addClass( 'ui-gdatepicker-input-set' );
			this.element.val( date.toString( this.options.dateFormat ) );
			
			this._highlightDay();
			
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
			this._dp.find('.ui-gdatepicker-body').empty().prepend( this._calendarPopulate() );
			this.moveToMonth("up");
		},
				
		upOneYear: function() {
			this._activeYear = this._activeYear-1;
			this._dp.find('.ui-gdatepicker-body').empty().prepend( this._calendarPopulate() );
			this.moveToMonth("up");
		},
				
		downOneMonth: function() {
			this._activeMonth = this._activeMonth+1;
			if( this._activeMonth == 12 ) { this._activeMonth = 0; this._activeYear = this._activeYear +1;	}
			this._dp.find('.ui-gdatepicker-body').empty().prepend( this._calendarPopulate() );
			this.moveToMonth();
		},
				
		downOneYear: function() {
			this._activeYear = this._activeYear+1;
			this._dp.find('.ui-gdatepicker-body').empty().prepend( this._calendarPopulate() );
			this.moveToMonth();
		},
				
		_getScrolledPos: function(month,year) {
			
			// offset is the distance we want to scroll above (1 row = ~24)
			var offset = 24;
			// store the body element
			var $el = this._dp.find('.ui-gdatepicker-body');
			// find scrolled position of the body
			var top = $el.scrollTop();
			var mt = top + $el.find('[data-year='+ year +'][data-month='+ month +']').position().top - offset;
			return mt;
				
		},

		moveToMonth: function( direction ) {
			
			var $el = this._dp.find('.ui-gdatepicker-body');
			
			var month = this._activeMonth;
			var year = this._activeYear;
			var duration = this.options.scrollSpeed;
			
			if( this._dp.is(':visible') ) {
				
				// if the element is visible / active, we scroll down to the chosen month.
				if( direction == "up" ) {  $el.scrollTop(210); } else { $el.scrollTop(0); }
				$el.stop(true).animate({'scrollTop': this._getScrolledPos(month,year) }, duration);

			} else {
				// if the element is hidden, we need to trick it to be visible
				// very quickly, then change it's scroll position, and revert it's positioning.
				this._dp.find('.ui-gdatepicker-body').empty().prepend( this._calendarPopulate() );
				
				var position = this._dp.css('top');
				this._dp.css({'top':'-30000px', 'display': 'block'});
				$el.scrollTop( this._getScrolledPos(month,year) );
				this._dp.css({'top':position, 'display':""});
			}
			
			this._highlightDay();
			
		},
		
		_parseDate: function(e) {
			
			if( e.which == 13 ) {
				
				var $el = $(e.target);
				var d = Date.parse( $el.val() );
				
				if( d !== null ) {
				
					this.options.selectedDate = [ d.getFullYear() , d.getMonth() , d.getDate() ];
					this._activeYear = this.options.selectedDate[0];
					this._activeMonth = this.options.selectedDate[1];
					this._calendarPopulate();
					this.hide(e);
					this.selectDay( this.options.selectedDate[2] , this.options.selectedDate[1] , this.options.selectedDate[0] );
					this.show(e);
				
				} else {
				
					alert("That date appears invalid, please try another");
					
				}
				
			} else {
			
				if( $(e.target).val() === "" ) {
					
					this._dpElement.val("");
					this.element.val("");
						
				}	
				
			}
			
			
			
		},
		
		// bind the calendar to show/hide. 
		// don't close when clicking on the calendar or the element.
		_bindEvents: function() {
			
			$(window).on(		'resize.gdatepicker', $.proxy(this._handlers.positionCalendar,this));
			// html/body events
			$('html').on(		'click.gdatepicker.html', $.proxy(this._handlers.hide,this));
			// input/element events
			this._dpElement.on(	'focus.gdatepicker.el', $.proxy(this._handlers.show,this));
			this._dpElement.on(	'keyup.gdatepicker.el', $.proxy(this._handlers.keyup,this));
			this._dpElement.on(	'click.gdatepicker', function(e) { e.stopPropagation(); });
			
			this.element.on(	'focus.gdatepicker.el', $.proxy(this._handlers.focusInputElement,this));
			
			// stop click propagating to window, else it closes itself.
			this._dp.on(		'click.gdatepicker', function(e) { e.stopPropagation(); });
			this.element.on(	'click.gdatepicker', function(e) { e.stopPropagation(); });
			
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
		
		// Handlers is used to maintain the 'this' scope, 
		// basically a 'proxy' for all events. Kinda sucks, wonder if there's a better way?
		_handlers: {
			
			hide: function() { this.hide(); },
			show: function(e) { this.show(e); },
			
			positionCalendar: function(e) { this._positionCalendar(e); } ,
			focusInputElement: function(e) { this._focusInputElement(e); } ,
			keyup: function(e) { this._parseDate(e); } ,
			
			selectDay: function(e) { this.selectDay( $(e.target).data('day') , $(e.target).data('month') , $(e.target).data('year') ); },
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
			this._dp.empty().remove();
			this._dpElement.remove();
			
		},
		
		
		_calendarPopulate: function() {
			
			var html = "";
			
			var year = this._activeYear;
			var month = this._activeMonth;
			
			// basically cheat and pad the visible area with a month each way.
			if ( month == 0 ) { month=11; year-=1; } else { month-=1; }
			
			// function to get the previous-days
			function previousDays( month, year ) {
				
				var html = "";
				
				var previousMonth = ( month==0 ) ? 11 : month-1;
				var previousMonthYear = ( month==0 ) ? year-1 : year;
				var daysInPreviousMonth = Date.getDaysInMonth(previousMonthYear,previousMonth);
				
				// ooffset is the first day of the week (0=sunday, 1=monday, 2=tuesday...)
				var ooffset = new Date(year,month,1).getDay();
				if (ooffset == 0) { ooffset=7; }
				
				// count down from the offset to populate all days in previous 
				for( o = ooffset-1; o>0; o-- ) {
					
					var oday = daysInPreviousMonth-o+1;
					
					html += "<span class=\"ui-gdatepicker-day ui-gdatepicker-previous-month\" data-day=\""+oday+"\" data-year=\""+previousMonthYear+"\" data-month=\""+previousMonth+"\">";
					html += oday;
					html += "</span>";	
					
				}
				
				return html;
					
			}
			
			//function to get the months needed
			function addMonths( month, year, howMany ) {
				
				var html = "";
				var y = year;
				
				for( mo = month; mo < month+howMany; mo++ ) {
					var m = mo;
					if (mo > 11) { var m = mo-12; y = year+1; }
					
					// get the current month's name
					var monthname = new Date(y,m,1).toString('MMMM');
					// get the year number(y) if it's not this year
					var yearname = ( Date.today().getFullYear() != y ) ? y : "";
					// get the number of days in the month
					var daysInMonth = Date.getDaysInMonth(y,m);
					
					// find out the first day of month(m) and call it offset
					var offset = new Date(y,m,1).getDay();
					if (offset == 0) { offset=7; }
					
					for( d = 1; d <= daysInMonth; d++ ) {
						
						// set some variables for styling the calendar
						var filler = ( d == 1 && offset > 1 ) ? "ui-gdatepicker-divider-left" : "";
						var divider = ( d <= 7 ) ? "ui-gdatepicker-divider-top" : "";
							
						html += "<span class=\"ui-gdatepicker-day " +filler+" "+divider+"\" data-day=\""+d+"\" data-year=\""+y+"\" data-month=\""+m+"\">";
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
				
				return html;	
				
			}
						
					
			html += previousDays( month, year );
			html += addMonths( month, year, 4 );
			
	
			return html;
			
		},
		
		_calendarHeadPopulate: function() {
			
			// populate the head with the days
			headHtml = "";
			//$.each( this.options.dayNames , function(k,v) {
			
			for( i=0; i<7; i++ ) {
			
				headHtml += "<span class=\"ui-gdatepicker-day\" data-day=\""+this.options.dayNames[i]+"\">";
				headHtml += this.options.dayNames[i];
				headHtml += "</span>";
				
			}; 
			
			return headHtml;
					
		}
		
		
		
});

});