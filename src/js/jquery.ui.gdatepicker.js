// Version 0.3.0
;if( typeof( $.widget ) !== "function" ) {
	throw new Error("Plugin requires jQuery UI Widget Factory (http://jqueryui.com/widget/)");
}

;$.widget('simey.gdatepicker', {
		
	options: {
			
			placeholder:		"Pick a date...",						
								// string:	
								// eg: "Pick me!"
								// generated input's placeholder if original input doesn't have.
								
			selected:			"",										
								// array
								// eg: [ 31, 12, 2012 ]
								// default date that is selected/highlighted. leave blank for today.
								
			format:				"dd-MM-yyyy",							
								// string 
								// eg: "dd-MM-yyyy"
								// format of original input
								
			formatOutput:		"MMM dSX, yyyy",						
								// string
								// eg: "dd of MMMM, yyyy" 
								// format of generated output
								
			days: 				['M','T','W','T','F','S','S'],			
								// array
								// eg: ['L','M','M','J','V','S','D']
								// days of week in header
								
			position: 			[3,0],									
								// array
								// eg: [0,0] 
								// position of calendar
								
			scrollSpeed:		300,									
								// integer
								// eg: 300
								// how fast the calendar scrolls up and down
								
			overlayType:		"both",									
								// string, bool
								// eg: false, "both", "month", "year"
								// do we show the overlay for scrolling months/years
								
			overlayAnimation:	"drop",									
								// string
								// eg: "drop", "fade"
								// how the overlay is animated in and out
								
			theme:				false									
								// string, bool
								// eg: false, "dark", "mint", "..."
								// sets the css theme style, supply your own string for custom
			
	},
	
	
	
	_create: function () {
			
		// --------------------------------------------------------------------------------------------------
		// we need a synched copy of the "this" object 
		// for use when "this" context changes
		
			var mommy = this;
			
			
		// --------------------------------------------------------------------------------------------------
		// before we do anything, make sure we can access date.js
		// it is needed for core functionality.
			
			if( $.type( Date.today ) === "undefined" ) { 
				this._destroy();
				throw new Error("Date.js Library (http://www.datejs.com/) is required for date handling. Destroying gdatepicker."); 
				return false; 
			}
			
		// --------------------------------------------------------------------------------------------------
		// before we do anything, make sure we have $.ui.position
		// it is needed for positioning the calendar.
			
			if( typeof( $.ui.position ) === undefined ) {
				throw new Error("Plugin requires jQuery UI Position (http://jqueryui.com/position/)");
			}

			
		// --------------------------------------------------------------------------------------------------
		// set the active month and year.

			this._active = { month: Date.today().getMonth(), year: Date.today().getFullYear() }
		
		
		// --------------------------------------------------------------------------------------------------
		// little function to return the theme.
		// used like: $el.addClass( addTheme() );

			function addTheme() { 
				if( mommy.options.theme ) { return 'ui-gdatepicker-theme-'+ mommy.options.theme; }
			}	
		
		
		// --------------------------------------------------------------------------------------------------
		// generate HTML needed for creating Calendar,
		// and append them all to the this._$picker
			
			this._$picker =					$('<div class="ui-gdatepicker"/>').attr( 'id' , 'gdatepicker_' + this.uuid ).addClass( addTheme() );
			
			this._$pickerInner = 			$('<div class="ui-gdatepicker-wrapper"/>').appendTo( this._$picker );
			this._$pickerHead = 			$('<div class="ui-gdatepicker-head"/>').appendTo( this._$pickerInner );
			this._$pickerBody = 			$('<div class="ui-gdatepicker-body"/>').appendTo( this._$pickerInner );
			
			this._$pickerUpArrow = 			$('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-up"><span>previous month</span></div>').appendTo( this._$pickerInner );
			this._$pickerDownArrow = 		$('<div class="ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-down"><span>next month</span></div>').appendTo( this._$pickerInner );
			this._$pickerUpArrowYear = 		$('<div class="ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-up-year"><span>previous year</span></div>').appendTo( this._$pickerInner );
			this._$pickerDownArrowYear = 	$('<div class="ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-down-year"><span>next year</span></div>').appendTo( this._$pickerInner );
			this._$pickerDateOverlay =		$('<div class="ui-gdatepicker-overlay">'+ new Date( this._active.year , this._active.month , 1 ).toString('MMMM') +" "+ this._active.year +'</div>').appendTo( this._$pickerInner );
			this._$pickerClose =			$('<div class="ui-gdatepicker-close">Close</div>').appendTo( this._$pickerInner );
			
			this._$pickerElement =			this.element.addClass('has-gdatepicker');
			this._$pickerInput = 			$('<input class="ui-gdatepicker-input" type="text"/>').attr( 'id' , 'gdatepicker_' + this.uuid ).addClass( addTheme() );
			this._$pickerEmpty = 			$('<span class="ui-gdatepicker-empty"><span>Clear</span></span>').addClass( addTheme() );
			
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
				.insertAfter( this._$pickerElement )
				.after( this._$pickerEmpty );
							
			
			
		// --------------------------------------------------------------------------------------------------
		// if the original element had a value, 
		// we apply it to the new element.
			
			this._slctd = {};
			this._slctd.value = this._$pickerElement.val();
			this._slctd.format = this.options.format;
				
			if( this._slctd.value !== "" && ( Date.parseExact( this._slctd.value , this._slctd.format ) !== null ) ) { 
					
				this._slctd.day = 	Date.parseExact( this._slctd.value, this._slctd.format ).getDate();
				this._slctd.month = Date.parseExact( this._slctd.value, this._slctd.format ).getMonth();
				this._slctd.year = 	Date.parseExact( this._slctd.value, this._slctd.format ).getFullYear();
					
				this._setOption( "selected" , [ this._slctd.day , this._slctd.month , this._slctd.year ] );
				this.selectDate();

			}
			
			
			
		// --------------------------------------------------------------------------------------------------
		// place the "x" for clearing the field
		// until I can figure out a better way, 
		// it's in a timeout because it needs to 
		// be positioned after everything is done
		// rendering
		
			$(document).ready(function(e) {
				
				setTimeout( function() {
					mommy.positionEmpty();
				},500);
				
			});
			
			
			
			
			
		// --------------------------------------------------------------------------------------------------
		// --------- EVENTS ---------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------------------------
			
			$(window).on('resize.gdatepicker' , function() {
				
				mommy.reposition();
				mommy.positionEmpty();
				
			});
			
			// when we click a day in the calendar we highlight it
			// accordingly, and also trigger an event
			this._$pickerBody.on( 'click', '.ui-gdatepicker-day', function (e) {
				
				// select the date we've clicked on.
				mommy.selectDate( $(e.target) );
				
			});
			
			
			this._$pickerInput.on({
				
				'click': function(e) {},
				
				'change': function(e) {

					mommy._trigger( "changeValue", e, { 
						selected: mommy.options.selected 
					});
					
				},
				
				'mouseover': function() {
					
					mommy._$pickerEmpty.addClass('ui-gdatepicker-empty-hover');
					
				},
				
				'mouseout': function() {
					
					mommy._$pickerEmpty.removeClass('ui-gdatepicker-empty-hover');
					
				},
				
				// show the datepicker on focus of element.
				'focus': function(e) {
					
					if( !mommy._$picker.is(':visible') ) {
						
						mommy.showCalendar();
						mommy._trigger( "show" );
						
						mommy._$pickerInput.addClass( "ui-gdatepicker-active" );
					
					}
				
				},
				
				// hide the datepicker if we've "tabbed" away from it
				'keydown': function(e) {
					
					if( e.keyCode === 9 ) {
						
						mommy.hideCalendar();
						mommy._trigger( "hide" );
						
						mommy._$pickerInput.removeClass( "ui-gdatepicker-active" );
					}
					
				},
				
				'keyup': function(e) {
				
					if( e.keyCode == 13 ) {
					
						var str = Date.parse( mommy._$pickerInput.val() );
						
						if( $.type( str ) === "date" ) {
						
							mommy.goToNewMonth( str.getMonth() , str.getFullYear() );
							mommy.selectDate( [ str.getDate() , str.getMonth() , str.getFullYear() ] );
							mommy.scrollToCurrentDate();
						
						} else {
							
							mommy._trigger("invalidDate", 'keyup', { value: mommy._$pickerInput.val() });
							
						}
						
					} else {
					
						if( mommy._$pickerInput.val() === "" ) {
							
							mommy._$pickerElement.val("");
							mommy._setOption( "selected" , "" );
								
						}	
						
					}
					
				}
				
			});
			
			
			
			
			// clear the text in the fields when we click
			// on the "empty" icon.
			mommy._$pickerEmpty.on( 'click' , function(e) {
				
				mommy._$pickerElement.val("");
				mommy._$pickerInput.val("");
				
				mommy._setOption( "selected" , "" );
				mommy._highlightDate();
				
				mommy._trigger("clearInput", "click", { 
					target: mommy._$pickerEmpty , 
					input: mommy._$pickerInput , 
					originalInput: mommy._$pickerElement 
				});
				
				e.preventDefault();
				
			});
			
			
			
			
			// when we click anywhere on page that isn't an element
			// associated with this datepicker, we hide the calendar.
			// not sure about the speed on this one :/
			$('html').on( 'click', function(e) {
				
				var $target = $(e.target);
				
				if( mommy._$picker.is(':visible') ) {
					
					var $els = 
						$( mommy._$picker )
							.add( mommy._$picker.find('*:not(.ui-gdatepicker-close)') )
							.add( mommy._$pickerEmpty )
							.add( mommy._$pickerInput )
							.add( mommy._$pickerElement );
					
					
					if( $els.filter( $target ).length < 1 ) {
							
							mommy.hideCalendar();
							mommy._trigger( "hide" );
							
							mommy._$pickerInput.removeClass( "ui-gdatepicker-active" );
							
					}
					
				}
				
			});
			
			
			
			
			this._$pickerUpArrow.on( 'click', function(e) {
				
				// figure out what the new months will be
				var m = mommy._active.month - 1;
				var y = mommy._active.year;
				if( m === -1 ) { m = 11; y--; }
				
				mommy._trigger("changeMonth", "click", { 
					newMonth: m, 
					newYear: y, 
					previousMonth: mommy._active.month, 
					previousYear: mommy._active.year,
					target: mommy._$pickerUpArrowYear
				});
				
				mommy.goToNewMonth( m , y );
				
			});
			
			this._$pickerUpArrowYear.on( 'click', function(e) {
				
				// figure out what the new months will be
				var m = mommy._active.month;
				var y = mommy._active.year - 1;
				
				mommy._trigger("changeYear", "click", { 
					newMonth: m, 
					newYear: y, 
					previousMonth: mommy._active.month, 
					previousYear: mommy._active.year,
					target: mommy._$pickerUpArrowYear
				});
				
				mommy.goToNewMonth( m , y );
				mommy.showOverlay({ direction: "up", type: "year" });
				
				
			});
			
			this._$pickerDownArrow.on( 'click', function(e) {
				
				// figure out what the new months will be
				var m = mommy._active.month + 1;
				var y = mommy._active.year;
				if( m === 12 ) { m = 0; y++; }
				
				mommy._trigger("changeMonth", "click", { 
					newMonth: m, 
					newYear: y, 
					previousMonth: mommy._active.month, 
					previousYear: mommy._active.year,
					target: mommy._$pickerUpArrowYear
				});
				
				mommy.goToNewMonth( m , y );
				
			});
			
			this._$pickerDownArrowYear.on( 'click', function(e) {
				
				// figure out what the new months will be
				var m = mommy._active.month;
				var y = mommy._active.year + 1;
				
				mommy._trigger("changeYear", "click", { 
					newMonth: m, 
					newYear: y, 
					previousMonth: mommy._active.month, 
					previousYear: mommy._active.year,
					target: mommy._$pickerUpArrowYear
				});
				
				mommy.goToNewMonth( m , y );
				mommy.showOverlay({ direction: "down", type: "year" });
				
			});
			
			// if mousewheel scroll plugin is present...
			if( $.event.special.mousewheel !== undefined ) {
				this._$picker.on('mousewheel', function(e,delta) {
					
					var direction;
					
					// we stop the main window scrolling, or it'll be annoying
					e.preventDefault();
					
					// trigger the up/down arrow clicks
					if( delta > 0 )	{ 
						
						if( e.shiftKey ) {
							mommy._$pickerUpArrowYear.trigger('click'); 
						} else {
							mommy._$pickerUpArrow.trigger('click'); 
						}
						
						direction = "up";
						
					} else if( delta < 0 ) 	{ 
						
						if( e.shiftKey ) {
							mommy._$pickerDownArrowYear.trigger('click'); 
						} else {
							mommy._$pickerDownArrow.trigger('click'); 
						}
						
						direction = "down";
					
					}
					
					// show the overlay as we scroll, if it's not a shift-scroll
					if( !e.shiftKey ) {
						mommy.showOverlay({  direction: direction, type: mommy.options.overlayType });
					}
					
				});
			}
			
		// --------------------------------------------------------------------------------------------------
		// --------- END EVENTS -----------------------------------------------------------------------------
		// --------------------------------------------------------------------------------------------------

			
	},
	
	
	
	
	
	
	
	
	
	
	
	
	showCalendar: function() {
		
		// use a css class to show the calendar,
		// and also reposition the calendar,
		// and also trigger the 'show' event.
		
		this._$picker.css({ "z-index": 999 }).fadeIn(200);
		
		this.scrollToCurrentDate();
		this.reposition();
		
		if( $.type( this.options.selected ) === "array" ) {
			this.goToNewMonth( this.options.selected[1] , this.options.selected[2] , false );
		} else {
			this.goToNewMonth( Date.today().getMonth() , Date.today().getFullYear() , false );
		}
	
	},
	
	
	
	
	
	hideCalendar: function() {
		
		this._$picker.css({ "z-index": "" }).fadeOut(200);
		
	},
	
	
	
	
	
	showOverlay: function( settings ) {
		
		if( this.options.overlayType ) {
		
				// a function to fade in an overlay showing
				// the currently visible month/year.
				// used primarily for mouse scrolling.
				
				var options = {
					duration: 1000,		// int
					type: "both",		// string: "month" or "year" or "both"
					direction: "up",	// string: "up" or "down"
					animation: this.options.overlayAnimation,	// string: "fade" or "drop"
					fadeout: 0.1,
					fadein: 0.3,
					fadelength: 0.6
				}; 
				$.extend( options , settings );
				
				if( options.animation === "fade" ) { options.fadeout = options.fadein; } 
				if( options.direction === "up" ) { options.opposite = "down"; } else { options.opposite = "up"; }
				
					// set the text to the correct format
					if( options.type === "month" ) {
						this._$pickerDateOverlay.text( new Date( this._active.year , this._active.month , 1 ).toString('MMMM') );
					} else if( options.type === "year" ) {
						this._$pickerDateOverlay.text( this._active.year );
					} else {
						this._$pickerDateOverlay.text( new Date( this._active.year , this._active.month , 1 ).toString('MMMM') +" "+ this._active.year );	
					}
				
				// fade in the overlay if it's not visible
				this._$pickerDateOverlay.stop(true,true).show( options.animation, { direction: options.direction, distance: 20 } , options.duration * options.fadein );
				
				
				// clear the timeout so it wont trigger.
				// fade out the overlay after x time.
				// have to use $.proxy, as timer sets it's own "this";
				clearTimeout( this._otimer );
				this._otimer = 
					setTimeout( 
						$.proxy( 
							function() { 
								this._$pickerDateOverlay.stop(true,true).hide( options.animation , { direction: options.opposite, distance: 50 } , options.duration * options.fadeout ); 
							} , this 
						) , options.duration * options.fadelength
					);
					
		}
			
	},
	
	
	
	
	
	reposition: function( top , left ) {
		
		// set the distance to offset the calendar
		var top = top || this.options.position[0];
		var left = left || this.options.position[1];
		
		// position the datepicker at the offset of the
		// input fields position
		this._$picker.position({ 
			my: 'left+'+left+' top+'+top, 
			at: 'left bottom', 
			of: this._$pickerInput 
		});
			
	},
	
	
	
	positionEmpty: function( top , right ) {
		
		// set the distance to offset the "x"
		var top = top || 0;
		var right = right || -10;
		
		// position the "x" at the offset of the
		// input fields position
		this._$pickerEmpty.position({
			my: 'right center',
			at: 'right+'+right+' center+'+top,
			of: this._$pickerInput
		});
		
	},
	
	
	
	selectDate: function( date ) {
		
		// selectDate function takes parameter of either:
		// [dd,mm,yyyy] or a $()
		
		// if date is supplied then we proceed to figure out the target,
		// otherwise we just set to previously stored date.
		
		if( date ) {
			
			if( $.type(date) === "array" ) {
				
				// update the selected option
				this._setOption( "selected" , [ 
					date[0] , 
					date[1] , 
					date[2] 
				] );
				
			} else if ( $.type(date) === "object" ) {
				
				// update the selected option
				this._setOption( "selected" , [ 
					parseInt($(date).data('day')) , 
					parseInt($(date).data('month')) , 
					parseInt($(date).data('year')) 
				] );
				
			} else {
				
				throw new Error("Incorrect paramter: 'date' in function: selectDate();");
				
			}
			
		}
		
		
			// update the inputs to show the date.
			this.updateInputs();
			
			// highlight the selected date.
			this._highlightDate();
			
			// exposed event callback for users to hook.
			this._trigger( "selectDay", 'click', { 
				date: new Date( this.options.selected[2], this.options.selected[1], this.options.selected[0] ) ,
				formatted: this._$pickerInput.val() 
			});
			
	},
	
	
	
	
	
	_highlightDate: function() {
			
			// remove all the currently selected days.
			this._$pickerBody.find('.ui-gdatepicker-day').removeClass('ui-gdatepicker-selected');
			this._$pickerBody.find(
				'[data-day='+this.options.selected[0]+']'+
				'[data-month='+this.options.selected[1]+']'+
				'[data-year='+this.options.selected[2]+']'
			).addClass('ui-gdatepicker-selected');	
				
	},
	
	
	
	
	
	updateInputs: function() {
		
		if( $.type( this.options.selected ) === "array" ) {
				
			var vals 			= {};
				vals.date 		= new Date( this.options.selected[2], this.options.selected[1], this.options.selected[0] );
				vals.input 		= vals.date.toString( this.options.format );
				vals.output 	= vals.date.toString( this.options.formatOutput ).replace("SX", vals.date.getOrdinal());
		
			this._$pickerInput.val( vals.output );
			this._$pickerElement.val( vals.input );
			
		}
		
	},
	
	
	
	
	
	scrollToCurrentDate: function() {
		
		// scrollToCurrentDate is a helper function used mainly
		// for positioning the calendar in the right place on
		// first load
		
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
				var scrolltop = this._$pickerBody.find('[data-month='+m+'][data-year='+y+']').first().position().top;
				var currenttop = this._$pickerBody.scrollTop();
				
				// scroll the body to the current month
				this._$pickerBody.scrollTop( currenttop + scrolltop - h );
		
		// put things back how we found them. good boy.
		if( trick ) { this._$picker.css({ display: '' , opacity: '' }); }
		
	},
	
	
	
	
	
	goToNewMonth: function( month , year , scroll ) {
		
		// if scroll hasn't been set, then it's true.
		var scroll = ( scroll === undefined ) ? true : scroll;
		
		// set the "original month" and "original year"
		var om = this._active.month;
		var oy = this._active.year;
		
		// if the passed month or year is greater than
		// the original month or year, then scroll up
		var direction = "down";
		if( ( om > month && oy === year ) || 
			( om < month && oy > year ) || 
			( om === month && oy > year ) ) { direction = "up"; }
		
		// if we're going up a whole year, increase the speed a little
		// mainly cos it looks strange otherwise.
		var duration = this.options.scrollSpeed;
		if( ( oy > year || oy < year ) && om === month ) { duration = duration / 2; }
		
		// generate the content based on these new months,
		// select the current date,
		// and scroll the body in the correct direction
		this._generateBody( month , year );
		// highlight the selected date.
		this._highlightDate();
		
		this._active.month = month;
		this._active.year = year;
		
		// check if we should scroll or just render the new month.
		if( scroll ) { this._scrollBody( direction , duration ); } 
		else { this.scrollToCurrentDate(); }
		
	},
	
	
	
	
	
	_scrollBody: function( direction , duration ) {
		
		// scrollBody is a purely cosmetic function which gives the
		// look that the calendar is infinitely scrolling, when really it's re-generating.
		
		var m = this._active.month;
		var y = this._active.year;
		
		var nm = ( m+1 > 11 ) ? 0 : m+1;
		var ny = ( m+1 > 11 ) ? y+1 : y;
		
		var duration = duration || this.options.scrollSpeed;
		
		// set the height of a day.
		// set the position of active month
		// set the current position of the body
		var h = this._$pickerBody.find('.ui-gdatepicker-day:first').outerHeight();
		
		var opt = {
			to: 	this._$picker.find('[data-month='+m+'][data-year='+y+']').first().position().top ,
			from: 	this._$picker.find('[data-month='+nm+'][data-year='+ny+']').first().position().top ,
			now:	this._$pickerBody.scrollTop()
		}
		
		// direction can be up or down
		var direction = direction || "down";
		var offset = ( direction === "down" ) ? 0 : opt.now + opt.from - h;

		// scroll the body to the current month
		this._$pickerBody.scrollTop( offset ).stop().animate({ scrollTop: opt.now + opt.to - h }, duration );		
		
	},
	
	
	
	
	
	_destroy: function () {
		
		if( this._$picker !== undefined ) {
		
			this._$picker.empty().remove();
			this._$pickerInput.remove();
			this._$pickerEmpty.remove();
			this._$pickerElement.removeClass('has-gdatepicker');
			
			$(window).off('resize.gdatepicker');
			
		}
		
	},
	
	
	
	
	
	_setOption: function (key, value) {
			
			this._super( key, value );

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
			if ( month === 0 ) { 
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
				if (offset === 0) { offset = 7; }
				
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
						var previous = ( mo == month ) ? "ui-gdatepicker-previous-month" : "";
							
						html += "<span class=\"ui-gdatepicker-day " +filler+" "+divider+" "+previous+"\" data-day=\""+d+"\" data-year=\""+y+"\" data-month=\""+m+"\">";
						html += d;
						html += "</span>";
						
						// at the end of each week, either show the month and year, or just start a new row.
						if( (offset+(d-1))%7 == 0 ) {
							if( (offset+(d-1)) < 8 ) {
								html += "<span class=\"ui-gdatepicker-monthname ui-gdatepicker-divider-top ui-gdatepicker-newline\" data-year=\""+y+"\" data-month=\""+m+"\">"+monthname+" "+yearname+"</span><br>";
							} else {
								html += "<span class=\"ui-gdatepicker-newline\"></span><br>";
							}
						}
						
					}
					
				}
				
				return html;	
				
			}
						
			// because of the scroll animation requires a lot of
			// extra space to move around, we set the rendered months
			// to 5, it could be less if there was no animation.
			
			html += previousDays( month, year );
			html += addMonths( month, year, 5 );
			
			this._$pickerBody.empty().html( html );
			
		},
		
		
		
		
		_generateHead: function() {
			
			// populate the head with the days
			var html = "";
			
			for( i=0; i<7; i++ ) {
				html += "<span class=\"ui-gdatepicker-day\" data-day=\""+this.options.days[i]+"\">";
				html += this.options.days[i];
				html += "</span>";
			}; 
			
			this._$pickerHead.empty().html( html );
					
		}	
	
	
	
	
	
	
		
});