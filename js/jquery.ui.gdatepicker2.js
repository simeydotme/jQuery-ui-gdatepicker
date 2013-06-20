


$.widget('simey.gdatepicker', {
		
	options: {
			
			placeholder:		"Pick a date...",						// generated input's placeholder
			selected:			[],										// default date that is selected/highlighted. eg: [ 31,12,2012 ]
			format:				"dd-MM-yyyy",							// original input format. eg: "dd-MM-yyyy"
			days: 				['M','T','W','T','F','S','S'],
			position: 			[3,0],									// position of calendar eg: [5,-5]
			scrollSpeed:		300										// eg: 100
			
	},
	
	_create: function () {
			
		// --------------------------------------------------------------------------------------------------
		// we need a synched copy of the "this" object 
		// for use inside of events or jQuery functions
		
			var mommy = this;
			
			
			
		// --------------------------------------------------------------------------------------------------
		// before we do anything, make sure we can access date.js
		// it is needed for core functionality.
			
			if( Date.today === undefined ) { 
				this._destroy();
				throw new Error("Date.js Library (http://www.datejs.com/) is required for proper functioning. Destroying gdatepicker."); 
				return false; 
			}
			
			
		// --------------------------------------------------------------------------------------------------
		// generate HTML needed for creating Calendar,
		// and append them all to the this._$picker
			
			this._$picker =					$('<div class="ui-gdatepicker"/>');
			this._$pickerInner = 			$('<div class="ui-gdatepicker-wrapper"/>').appendTo( this._$picker );
			this._$pickerHead = 			$('<div class="ui-gdatepicker-head"/>').appendTo( this._$pickerInner );
			this._$pickerBody = 			$('<div class="ui-gdatepicker-body"/>').appendTo( this._$pickerInner );
			this._$pickerUpArrow = 			$('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-up"><span>previous month</span></div>').appendTo( this._$pickerInner );
			this._$pickerDownArrow = 		$('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-down"><span>next month</span></div>').appendTo( this._$pickerInner );
			this._$pickerUpArrowYear = 		$('<div class="ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-up-year"><span>previous year</span></div>').appendTo( this._$pickerInner );
			this._$pickerDownArrowYear = 	$('<div class="ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-down-year"><span>next year</span></div>').appendTo( this._$pickerInner );
			
			this._$pickerInput = 			$('<input class="ui-gdatepicker-input" type="text"/>');
			this._$pickerElement =			this.element;
			
			this._active = { month: Date.today().getMonth(), year: Date.today().getFullYear() }
			
			this._generateHead();
			this._generateBody( this._active.month , this._active.year );
			
			this._$picker.appendTo( $('body') );
			
			
			
		// --------------------------------------------------------------------------------------------------
		// if the original element had a placeholder, 
		// we change the option value to that.
		// then we add the placeholder to the new input.
			
			if( this.element.attr('placeholder') !== undefined ) { 
				this._setOption( "placeholder" , this._$pickerElement.attr('placeholder') );
			}
			
			this._$pickerInput
				.prop( 'placeholder' , this.options.placeholder )
				.insertAfter( this._$pickerElement );
			
			
			
		// --------------------------------------------------------------------------------------------------
		// if the original element had a value, 
		// we apply it to the new element.
			
			this._slctd = {};
			this._slctd.value = this._$pickerElement.val();
			this._slctd.format = this.options.format;
				
				
			if( this._slctd.value !== "" ) { 
				if( Date.parseExact( this._slctd.value , this._slctd.format ) !== null ) {
					
					this._slctd.day = 	Date.parseExact( this._slctd.value, this._slctd.format ).getDate();
					this._slctd.month = Date.parseExact( this._slctd.value, this._slctd.format ).getMonth();
					this._slctd.year = 	Date.parseExact( this._slctd.value, this._slctd.format ).getFullYear();
						
					this._setOption( "selected" , [ this._slctd.day , this._slctd.month , this._slctd.year ] );
					
				}
			}
			
		// --------------------------------------------------------------------------------------------------
		// else, if the option for selected is not set
		// we set it to todays date
			
			 else if( this.options.selected !== [] ) {
					
				this._slctd.day = 	Date.today().getDate();
				this._slctd.month = Date.today().getMonth();
				this._slctd.year = 	Date.today().getFullYear();
					
				this._setOption( "selected" , [ this._slctd.day , this._slctd.month , this._slctd.year ] );
					
			}
			
			
			
			
			
			
			
		// --------------------------------------------------------------------------------------------------
		// --------- EVENTS ---------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------------------------

			// when we click a day in the calendar we highlight it
			// accordingly, and also trigger an event
			this._$pickerBody.on( 'click', '.ui-gdatepicker-day', function (e) {
				
				// remove all the currently selected days.
				mommy._$pickerBody.find('.ui-gdatepicker-day').removeClass('ui-gdatepicker-selected');
				// select the target day.
				$(e.target).addClass('ui-gdatepicker-selected');
				// exposed event callback for users to hook.
				mommy._trigger( "selectday", "click" );
				
			});
			
			
			
			// we want to show the datepicker on focusing of the input
			// element, also make it 'active'
			this._$pickerInput.on( 'click' , function( e ) {
				mommy.show();
				mommy._$pickerInput.addClass( "ui-gdatepicker-active" );
			});
			
			
			
			// when we click anywhere on page that isn't an element
			// associated with this datepicker, we hide the calendar.
			// not sure about the speed on this one :/
			$('html').on( 'click', function(e) {
				
				var $target = $(e.target);
				
				if( !$target.is( mommy._$picker ) &&
					!$target.is( mommy._$picker.find('*') ) &&
					!$target.is( mommy._$pickerInput ) && 
					!$target.is( mommy._$pickerElement ) ) {
						mommy.hide();
						mommy._$pickerInput.removeClass( "ui-gdatepicker-active" );
				}
				
			});
			
			
			this._$pickerUpArrow.on( 'click', function(e) {
				
				// figure out what the new months will be
				var m = mommy._active.month - 1;
				var y = mommy._active.year;
				if( m === -1 ) { m = 11; y--; }
				
				// generate the content based on these new months
				// and scroll the body in the correct direction
				mommy._generateBody( m , y );
				mommy._active.month = m;
				mommy._active.year = y;
				mommy._scrollBody('up');
				
			});
			
			this._$pickerDownArrow.on( 'click', function(e) {
				
				// figure out what the new months will be
				var m = mommy._active.month + 1;
				var y = mommy._active.year;
				if( m === 12 ) { m = 0; y++; }
				
				// generate the content based on these new months
				// and scroll the body in the correct direction
				mommy._generateBody( m , y );
				mommy._active.month = m;
				mommy._active.year = y;
				mommy._scrollBody('down');
				
			});
			
			
			
	},
	
	show: function() {
		
		// use a css class to show the calendar,
		// and also reposition the calendar,
		// and also trigger the 'show' event.
		
		this._$picker.addClass('ui-gdatepicker-show');
		
		this.showCurrentDate();
		this.reposition( this.options.position[0] , this.options.position[1] );
		
		this._trigger( "show" );
	
	},
	
	hide: function() {
		
		this._$picker.removeClass('ui-gdatepicker-show');
		this._trigger( "hide" );
		
	},
	
	reposition: function( top , left ) {
		
		// set the distance to offset the calendar
		var top = top || 0;
		var left = left || 0;
		
		// position the datepicker at the offset of the
		// input fields position
		this._$picker.position({ my: 'left+'+left+' top+'+top, at: 'left bottom', of: this._$pickerInput });
			
	},
	
	showCurrentDate: function() {
		
		var m = this._active.month;
		var y = this._active.year;
		
		// we use a 'trick' to position the body, if the datepicker
		// is hidden; this is because we cannot get positions of hidden elements
		var trick = this._$picker.is(':hidden');
		if( trick ) { this._$picker.css({ display: 'block' , opacity: '0' }); }
		
				// set the height of a day.
				// set the position of active month
				// set the current position of the body
				var h = this._$pickerBody.find('.ui-gdatepicker-day:first').outerHeight();
				var scrolltop = $('[data-month='+m+'][data-year='+y+']').first().position().top;
				var currenttop = this._$pickerBody.scrollTop();
				
				// scroll the body to the current month
				this._$pickerBody.scrollTop( currenttop + scrolltop - h );
		
		// put things back how we found them. good boy.
		if( trick ) { this._$picker.css({ display: '' , opacity: '' }); }
		
	},
	
	_scrollBody: function( direction ) {
				
		var m = this._active.month;
		var y = this._active.year;
		
		var nm = ( m+1 > 11 ) ? 0 : m+1;
		var ny = ( m+1 > 11 ) ? y+1 : y;
		
		// set the height of a day.
		// set the position of active month
		// set the current position of the body
		var h = this._$pickerBody.find('.ui-gdatepicker-day:first').outerHeight();
		
		var opt = {
			to: 	$('[data-month='+m+'][data-year='+y+']').first().position().top ,
			from: 	$('[data-month='+nm+'][data-year='+ny+']').first().position().top ,
			now:	this._$pickerBody.scrollTop()
		}
		
		// direction can be up or down
		var direction = direction || "down";
		var offset = ( direction === "down" ) ? 0 : opt.now + opt.from - h;

		// scroll the body to the current month
		this._$pickerBody.scrollTop( offset ).stop().animate({ scrollTop: opt.now + opt.to - h }, this.options.scrollSpeed );
		
		
	},
		
		
	_destroy: function () {
			
			alert( 'destroy all humans' );
		
	},
		
		
	_setOption: function (key, value) {
			
			this._super( key, value );
			console.log( '[ settings changed ]' );
			console.log( this.options );
			console.log( '' );
		
	},
	
	
	
	
	
	
	
	_generateBody: function( month, year ) {
			
			var html = "";
			
			// if month isn't supplied, we used the current month.
			if( typeof( month ) !== "number" ) {
				var month = Date.today().getMonth();
			}
			
			// if year isn't supplied, we used the current year.
			if( typeof( year ) !== "number" ) {
				var year = Date.today().getFullYear();
			}
						
			
			
		// --------------------------------------------------------------------------------------------------
		// Basically we cheat and pad the visible area with a month before and a few after.
		// Because we can't generate a massive amount of dom elements.
		// So technically there's only ever 5 months in the calendar.
			
			// set month to the month before.
			if ( month == 0 ) { 
				month = 11; 
				year -= 1; 
			} else { 
				month -= 1; 
			}
			
			
			
		// --------------------------------------------------------------------------------------------------
		// We need to figure out the previous days in the week leading up
		// to this month (for styling)

			function previousDays( month, year ) {
				
				var html = "", 
					previousMonth, 
					previousMonthYear,
					daysInPreviousMonth;
				
				
				// we need the month and year of the previous month.
				// eg: today: Jan 2012... then we need Dec 2011.
				if( month === 0 ) {
						previousMonth = 11;
					previousMonthYear = year - 1;
				} else {
						previousMonth = month - 1;
					previousMonthYear = year;
				}
				
				// store how many days were in the previous month
				daysInPreviousMonth = Date.getDaysInMonth( previousMonthYear , previousMonth );
				
				// offset is the first day of the week (0=sunday, 1=monday, 2=tuesday...)
				// if the offset is 0 we actually want to count down from 7, because
				// we show sunday as the last day in the week, not the first.
				var offset = new Date( year, month, 1 ).getDay();
				if (offset == 0) { offset = 7; }
				
				// count down from the offset to populate all days in previous month 
				for( o = offset-1; o > 0; o-- ) {
					
					var oday = daysInPreviousMonth-o+1;
					
					html += "<span class=\"ui-gdatepicker-day ui-gdatepicker-previous-month\" data-day=\""+oday+"\" data-year=\""+previousMonthYear+"\" data-month=\""+previousMonth+"\">";
					html += oday;
					html += "</span>";	
					
				}
				
				return html;
					
			}
			
		// --------------------------------------------------------------------------------------------------
		// Function to return the HTML for `howMany` months.
		// Beginning at `month` and `year`.
		
			function addMonths( month, year, howMany ) {
				
				var html = "",
					y = year;
				
				for( mo = month; mo < month+howMany; mo++ ) {
					
					// for each month we loops through, we need
					// to make sure it isn't past December. if it is,
					// we take away 12 , and add a year so that it equates to the right
					// month at the beginning of the next year
					var m = mo;
					if (mo > 11) { var m = mo-12; y = year+1; }
					
					// get the current month's name to show in the side.
					var monthname = new Date(y,m,1).toString('MMMM');
					
					// get the year number to show in the side. but we dont want
					// to show this year's number as that's implied.
					var yearname = ( Date.today().getFullYear() != y ) ? y : "";
					
					// get the number of days in the currently looped month
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
						
			// because of the scroll animation required a lot of
			// extra space to move around, we set the rendered months
			// to 5.
			
			html += previousDays( month, year );
			html += addMonths( month, year, 5 );
			
			this._$pickerBody.empty().html( html );
			
		},
		
		
		
		
		_generateHead: function() {
			
			// populate the head with the days
			html = "";
			
			for( i=0; i<7; i++ ) {
				html += "<span class=\"ui-gdatepicker-day\" data-day=\""+this.options.days[i]+"\">";
				html += this.options.days[i];
				html += "</span>";
			}; 
			
			this._$pickerHead.empty().html( html );
					
		}	
	
	
	
	
	
	
		
});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	