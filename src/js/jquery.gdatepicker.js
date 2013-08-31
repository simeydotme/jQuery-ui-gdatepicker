
(function($){

  "use strict";
  
  // a unique id for each gdatepicker
  var uid = 0;





/*** 
* http://patorjk.com/software/taag/#p=display&h=2&v=2&c=c&f=Fraktur&t=test
*                                                                            
*       ..                                                        ..         
*      888>                 x.    .                   .u    .    @L          
*      "8P       .u@u     .@88k  z88u        .u     .d88B :@8c  9888i   .dL  
*       .     .zWF8888bx ~"8888 ^8888     ud8888.  ="8888f8888r `Y888k:*888. 
*     u888u. .888  9888    8888  888R   :888'8888.   4888>'88"    888E  888I 
*    `'888E  I888  9888    8888  888R   d888 '88%"   4888> '      888E  888I 
*      888E  I888  9888    8888  888R   8888.+"      4888>        888E  888I 
*      888E  I888  9888    8888 ,888B . 8888L       .d888L .+     888E  888I 
*      888E  `888Nx?888   "8888Y 8888"  '8888c. .+  ^"8888*"     x888N><888' 
*      888E   "88" '888    `Y"   'YP     "88888%       "Y"        "88"  888  
*      888E         88E                    "YP'                         88F  
*      888E         98>                                                98"   
*      888P         '8                                               ./"     
*    .J88" "         `                                              ~`       
*/


  $.fn.gdatepicker = function( settings ) {

    return this.each( function() {

      var $el = $(this);

      var _settings =  $.extend({}, $.fn.gdatepicker.defaults, settings || {});
      var plugin = new gDatepicker(_settings, $el, uid++);


      // ====================================================================

      plugin.init();

      // ====================================================================

      $el.data('_gDatepicker', plugin);

    });

  };






/***
*                    ..                .x+=:.      .x+=:.   
*              x .d88"                z`    ^%    z`    ^%  
*               5888R                    .   <k      .   <k 
*          .    '888R         u        .@8Ned8"    .@8Ned8" 
*     .udR88N    888R      us888u.   .@^%8888"   .@^%8888"  
*    <888'888k   888R   .@88 "8888" x88:  `)8b. x88:  `)8b. 
*    9888 'Y"    888R   9888  9888  8888N=*8888 8888N=*8888 
*    9888        888R   9888  9888   %8"    R88  %8"    R88 
*    9888        888R   9888  9888    @8Wou 9%    @8Wou 9%  
*    ?8888u../  .888B . 9888  9888  .888888P`   .888888P`   
*     "8888P'   ^*888%  "888*""888" `   ^"F     `   ^"F     
*       "P'       "%     ^Y"   ^Y'                          
*                                                           
*/

  function gDatepicker(settings, $el, uid) {
    
    this.$el = $el;
    this.uid = uid;

    this.settings = settings;

    return this;

  };






/***
*                                                s                
*                                               :8                
*     .d``            .u    .          u.      .88           u.   
*     @8Ne.   .u    .d88B :@8c   ...ue888b    :888ooo  ...ue888b  
*     %8888:u@88N  ="8888f8888r  888R Y888r -*8888888  888R Y888r 
*      `888I  888.   4888>'88"   888R I888>   8888     888R I888> 
*       888I  888I   4888> '     888R I888>   8888     888R I888> 
*       888I  888I   4888>       888R I888>   8888     888R I888> 
*     uW888L  888'  .d888L .+   u8888cJ888   .8888Lu= u8888cJ888  
*    '*88888Nu88P   ^"8888*"     "*888*P"    ^%888*    "*888*P"   
*    ~ '88888F`        "Y"         'Y"         'Y"       'Y"      
*       888 ^                                                     
*       *8E                                                       
*       '8>                                                       
*        "                                                        
*/

  gDatepicker.prototype = {
    







/***
*       .                     .         s    
*      @88>                  @88>      :8    
*      %8P      u.    u.     %8P      .88    
*       .     x@88k u@88c.    .      :888ooo 
*     .@88u  ^"8888""8888"  .@88u  -*8888888 
*    ''888E`   8888  888R  ''888E`   8888    
*      888E    8888  888R    888E    8888    
*      888E    8888  888R    888E    8888    
*      888E    8888  888R    888E   .8888Lu= 
*      888&   "*88*" 8888"   888&   ^%888*   
*      R888"    ""   'Y"     R888"    'Y"    
*       ""                    ""             
*/

  // ----------------------------------------------------------------------
  // initialize the plugin

    init: function() {

      var _self = this;

      // if the datepicker was already applied to this element,
      // we need to destroy it first, this is important.
      if( this.$el.hasClass("has-gdatepicker") ) {
        this.destroy();
      }

      // set the active month and year.
      this._active = { 
        month: new Date().getMonth(), 
        year: new Date().getFullYear() 
      };

      // create the picker with the designated theme
      this._createPicker( this._getTheme() );
      this._populatePicker();




      this._bindEvents();

    },


  // ----------------------------------------------------------------------
  // destroy the current instance

    destroy: function() {

      // get the current instance via it's data bind
      var currentInstance = this.$el.data("_gDatepicker");

      // remove the elements stored in the data bind
      // all events should disappear, too.
      currentInstance._els.$picker.remove();
      currentInstance._els.$pickerInputWrapper.remove();
      currentInstance._els.$pickerElement.removeClass("has-gdatepicker");

      // finally remove the data bind so it doesn't trip us up.
      this.$el.removeData("_gDatepicker");

    },



    // function for showing the calendar
    show: function() {

      this._els.$picker.addClass("ui-gdatepicker-show");
      this.position();

    },

    // function for hiding the calendar
    hide: function() {

      this._els.$picker.removeClass("ui-gdatepicker-show");

    },

    // function for positioning the calendar
    position: function( offsetTop , offsetLeft ) {

      var $input = this._els.$pickerInput;

      var offset = {
        top: offsetTop || this.settings.position.top,
        left: offsetLeft || this.settings.position.left
      };

      var origin = {
        top: $input.offset().top + $input.outerHeight() ,
        left: $input.offset().left
      };

      this._els.$picker.css({
        "top": offset.top + origin.top , "left": offset.left + origin.left
      });

    },








/***
*                  _                                       s       .x+=:.   
*                 u                                       :8      z`    ^%  
*                88Nu.   u.                u.    u.      .88         .   <k 
*         .u    '88888.o888c      .u     x@88k u@88c.   :888ooo    .@8Ned8" 
*      ud8888.   ^8888  8888   ud8888.  ^"8888""8888" -*8888888  .@^%8888"  
*    :888'8888.   8888  8888 :888'8888.   8888  888R    8888    x88:  `)8b. 
*    d888 '88%"   8888  8888 d888 '88%"   8888  888R    8888    8888N=*8888 
*    8888.+"      8888  8888 8888.+"      8888  888R    8888     %8"    R88 
*    8888L       .8888b.888P 8888L        8888  888R   .8888Lu=   @8Wou 9%  
*    '8888c. .+   ^Y8888*""  '8888c. .+  "*88*" 8888"  ^%888*   .888888P`   
*     "88888%       `Y"       "88888%      ""   'Y"      'Y"    `   ^"F     
*       "YP'                    "YP'                                        
*                                                                           
*                                                                           
*                                                                           
*/

    _bindEvents: function() {

      var _self = this;

      
      $("html").on({

        // when we click on page, if it wasn't a click on the
        // datepicker, then we close it.
        "mouseup": function(e) {

          var $target = $(e.target);
          var $parents = $target.parents();

          // assume we are going to hide.
          var hide = true;

          // exempt from closing the datepicker are itself and
          // the input element
          var $exempt = $()
                .add( _self._els.$picker )
                .add( _self._els.$pickerInputWrapper );


          // if the close button was _not_ clicked, and the
          // target or it's parent was one of the exempt, we
          // decide not to close.
          if( !$target.is( _self._els.$pickerClose ) ) {
            if( $target.filter( $exempt ).length > 0 ) {
              hide = false;
            } else if( $parents.filter( $exempt ).length > 0 ) {
              hide = false;
            }
          }


          // if we haven't set hide to false, hide calendar
          if( hide ) {
            _self.hide.apply( _self );
          }

        }

      });



      this._els.$pickerInput.on({

        // run the "show" function on focus
        "focus": function(e) {
          _self.show.apply( _self );
        },
        // run the "hide" function on tab 
        // (not blur, as that intercepts clicking on the calender)
        "keydown": function(e) {
          if( e.keyCode === 9 ) {
            _self.hide.apply( _self );
          }
        }

      });


      this._els.$pickerUpArrow.on({

        "click": function(e) {
          _self._goBackAMonth.apply( _self );
        }

      });

      this._els.$pickerDownArrow.on({

        "click": function(e) {
          _self._goForwardAMonth.apply( _self );
        }

      });

      this._els.$pickerUpArrowYear.on({

        "click": function(e) {
          _self._goBackAYear.apply( _self );
        }

      });

      this._els.$pickerDownArrowYear.on({

        "click": function(e) {
          _self._goForwardAYear.apply( _self );
        }

      });

    },





/***
*                     ..                                   .x+=:.   
*               x .d88"                                   z`    ^%  
*                5888R                 ..    .     :         .   <k 
*         .u     '888R        .u     .888: x888  x888.     .@8Ned8" 
*      ud8888.    888R     ud8888.  ~`8888~'888X`?888f`  .@^%8888"  
*    :888'8888.   888R   :888'8888.   X888  888X '888>  x88:  `)8b. 
*    d888 '88%"   888R   d888 '88%"   X888  888X '888>  8888N=*8888 
*    8888.+"      888R   8888.+"      X888  888X '888>   %8"    R88 
*    8888L        888R   8888L        X888  888X '888>    @8Wou 9%  
*    '8888c. .+  .888B . '8888c. .+  "*88%""*88" '888!` .888888P`   
*     "88888%    ^*888%   "88888%      `~    "    `"`   `   ^"F     
*       "YP'       "%       "YP'                                    
*                                                                   *                                                                   
*/

  // -----------------------------------------------------------------------
  // generate HTML needed for creating Calendar,
  // and append them all to the this._$picker
    
    _createPicker: function( theme ) {

      var els = {

        // the main picker wrapper element
        $picker: $("<div class='ui-gdatepicker'/>") ,

        // the larger sections inside the wrapper
        $pickerInner: $("<div class='ui-gdatepicker-wrapper'/>") ,
        $pickerHead: $("<div class='ui-gdatepicker-head'/>") ,
        $pickerBody: $("<div class='ui-gdatepicker-body'/>") ,
        
        // a fragment cache we can use for generating the body
        $pickerCache: $() ,

        // other interface elements
        $pickerUpArrow: $("<div class='ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-up'><span>previous month</span></div>") ,
        $pickerDownArrow: $("<div class='ui-gdatepicker-scroll-arrow ui-gdatepicker-scroll-arrow-down'><span>next month</span></div>") ,
        $pickerUpArrowYear: $("<div class='ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-up-year'><span>previous year</span></div>") ,
        $pickerDownArrowYear: $("<div class='ui-gdatepicker-scroll-arrow-year ui-gdatepicker-scroll-arrow-down-year'><span>next year</span></div>") ,
        $pickerDateOverlay: $("<div class='ui-gdatepicker-overlay'/>") ,
        $pickerClose: $("<div class='ui-gdatepicker-close'>Close</div>") ,

        // the input element we"ve bound to
        $pickerElement: this.$el ,

        // a new input, its wrapper and a element for clearing it.
        $pickerInputWrapper: $("<div class='ui-gdatepicker-input-wrapper'/>") ,
        $pickerInput: $("<input class='ui-gdatepicker-input' type='text'/>") ,
        $pickerEmpty: $("<span class='ui-gdatepicker-empty'><span>Clear</span></span>")

      };

      // give the picker a unique id, and a theme class,
      // also append the large inner wrapper.
      els.$picker
        .attr("id", "ui_gdatepicker_" + this.uid )
        .addClass( theme )
        .append( els.$pickerInner );

      // append all the children to the inner wrapper
      // head and body go first as they are position static.
      els.$pickerInner
        .append( 
          els.$pickerHead , els.$pickerBody ,
          els.$pickerUpArrow , els.$pickerDownArrow ,
          els.$pickerUpArrowYear , els.$pickerDownArrowYear ,
          els.$pickerDateOverlay , els.$pickerClose 
        );

      // give the original input a class for hiding/manip
      // tabindex stops it being tabbed to
      els.$pickerElement
        .addClass("has-gdatepicker")
        .attr("tabindex","-1");

      // create the wrapper heirarchy and give it a theme class
      els.$pickerInputWrapper
        .append( els.$pickerInput , els.$pickerEmpty )
        .addClass( theme );

      
      // get the original input's placeholder if it had one.
      if( els.$pickerElement.attr("placeholder") ) {
        this.settings.placeholder = els.$pickerElement.attr("placeholder");
      }


      // give the input a unique id
      els.$pickerInput
        .attr("id", "ui_gdatepicker_input_" + this.uid )
        .prop("placeholder", this.settings.placeholder );

      // give access to the els globally
      this._els = els;

      


      // append fragments to body.

      $("body").append( this._els.$picker );
      this._els.$pickerInputWrapper.insertAfter( this._els.$pickerElement );

      

    },







/***
*                                                                                  s               
*                                                                                 :8               
*                              u.    u.                 .u    .                  .88               
*         uL          .u     x@88k u@88c.      .u     .d88B :@8c        u       :888ooo      .u    
*     .ue888Nc..   ud8888.  ^"8888""8888"   ud8888.  ="8888f8888r    us888u.  -*8888888   ud8888.  
*    d88E`"888E` :888'8888.   8888  888R  :888'8888.   4888>'88"  .@88 "8888"   8888    :888'8888. 
*    888E  888E  d888 '88%"   8888  888R  d888 '88%"   4888> '    9888  9888    8888    d888 '88%" 
*    888E  888E  8888.+"      8888  888R  8888.+"      4888>      9888  9888    8888    8888.+"    
*    888E  888E  8888L        8888  888R  8888L       .d888L .+   9888  9888   .8888Lu= 8888L      
*    888& .888E  '8888c. .+  "*88*" 8888" '8888c. .+  ^"8888*"    9888  9888   ^%888*   '8888c. .+ 
*    *888" 888&   "88888%      ""   'Y"    "88888%       "Y"      "888*""888"    'Y"     "88888%   
*     `"   "888E    "YP'                     "YP'                  ^Y"   ^Y'               "YP'    
*    .dWi   `88E                                                                                   
*    4888~  J8%                                                                                    
*     ^"===*"`                                                                                     
*/
    
    
    // function that allows us to populate the datepicker
    // according to the data supplied.
    _populatePicker: function( direction ) {

      var tempBody = 
        this._generateBody();
      
      var tempHead =
        this._generateHead();

      this._appendHead( tempHead );
      this._appendBody( tempBody );

      this._positionCurrentMonth( direction );

    },



    _generateBody: function( month, year ) {

      var html = "";

      // if month isn't supplied correctly, we use the current month.
      if( typeof( month ) !== "number" || ( month > 11 || month < 0 ) ) {
        month = this._active.month;
      }

      // if year isn't supplied correctly, we use the current year.
      if( typeof( year ) !== "number" || ( year < 1000 ) ) {
        year = this._active.year;
      }


    // ----------------------------------------------------------------------
    // Basically we cheat and pad the visible area with a month before,
    // and a couple after. This is to save on generating dom elements.
    // So technically there's only ever 5 months in the calendar.
      
      // set month to the month before.
      if ( month === 0 ) { 
        month = 11; 
        year -= 1; 
      } else { 
        month -= 1; 
      }

      html += this._generateRemainderDays( month, year );
      html += this._generateMonths( month, year );



      return html;

    },

    _generateRemainderDays: function( month , year ) {

    // This function figures out the remainder days in the last week of
    // the month previous to the one supplied. 
    // (if month is march, generate the remainder days in last week of april)

      var html = "",
          previousMonth,
          previousMonthYear,
          daysInPreviousMonth;

      // we need the month and year of the previous month.
      // eg: supplied: Jan 2012... then we need Dec 2011.
      if( month === 0 ) {
        previousMonth = 11;
        previousMonthYear = year - 1;
      } else {
        previousMonth = month - 1;
        previousMonthYear = year;
      }

      // store how many days were in the previous month
      daysInPreviousMonth = 
        this._getDaysInMonth( previousMonth , previousMonthYear );

      // offset is the first day of the week (0=sunday, 1=monday, 2=tuesday...)
      // if the offset is 0 we actually want to count down from 7, because
      // we show sunday as the last day in the week, not the first.
      var offset = new Date( year, month, 1 ).getDay();
      if (offset === 0) { offset = 7; }

      // count down from the offset to populate all days in previous month
      var oday; 
      for( var o = offset-1; o > 0; o-- ) {

        oday = daysInPreviousMonth-o+1;
        html += "<span class=\"ui-gdatepicker-day ui-gdatepicker-previous-month gdpd-"+oday+" gdpm-"+previousMonth+" gdpy-"+previousMonthYear+"\" data-day=\""+oday+"\" data-year=\""+previousMonthYear+"\" data-month=\""+previousMonth+"\">";
        html += oday;
        html += "</span>";  
        
      }

      return html;

    },

    _generateMonths: function( beginMonth, beginYear ) {

      var html = "",
          currentYear = new Date().getFullYear(),
          y = beginYear;

      // because of the scroll animation requires a lot of
      // extra space to move around, we set the rendered months
      // to 4 or 5, it could be less if there was no animation.

      for( var mo = beginMonth; mo < beginMonth+5; mo++ ) {
        
        // for each month we loop through, we need
        // to make sure it isn't past December. if it is,
        // we take away 12 , and add a year so that it equates to the right
        // month at the beginning of the next year
        var m = mo;
        if (mo > 11) { var m = mo-12; y = beginYear+1; }
        
        // get the current month's name to show in the side.
        var monthname = this.settings.months[m];
        
        // get the year number to show in the side. but we dont want
        // to show this year's number as that's implied.
        var yearname = ( currentYear != y ) ? y : "";
        
        // get the number of days in the currently looped month
        var daysInMonth = this._getDaysInMonth(m,y);
        
        // find out the first day of month(m) and call it offset
        var offset = new Date(y,m,1).getDay();
        if (offset === 0) { offset=7; }
        
        for( var d = 1; d <= daysInMonth; d++ ) {
          
          // set some variables for styling the calendar
          var filler = ( d == 1 && offset > 1 ) ? "ui-gdatepicker-divider-left" : "";
          var divider = ( d <= 7 ) ? "ui-gdatepicker-divider-top" : "";
          var previous = ( mo == beginMonth ) ? "ui-gdatepicker-previous-month" : "";
            
          html += "<span class=\"ui-gdatepicker-day " +filler+" "+divider+" "+previous+" gdpd-"+d+" gdpm-"+m+" gdpy-"+y+"\" data-day=\""+d+"\" data-year=\""+y+"\" data-month=\""+m+"\">";
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

    },

    _generateHead: function() {

      var html = "";

      for( var i=0; i<7; i++ ) {
        html += "<span class='ui-gdatepicker-day' data-day='"+this.settings.days[i]+"'>";
        html += this.settings.days[i];
        html += "</span>";
      };

      return html;

    },

    _appendBody: function( html ) {

        this._els.$pickerBody.html( html );

        // store a cache of the appended days for highlighting against.
        this._els.$pickerCache = $();
        this._els.$pickerCache = $( html );

    },

    _appendHead: function( html ) {

      this._els.$pickerHead.html( html );

    },






/***
*                                 ..                                          .x+=:.   
*      .uef^"               x .d88"                                          z`    ^%  
*    :d88E                   5888R    .d``                       .u    .        .   <k 
*    `888E            .u     '888R    @8Ne.   .u        .u     .d88B :@8c     .@8Ned8" 
*     888E .z8k    ud8888.    888R    %8888:u@88N    ud8888.  ="8888f8888r  .@^%8888"  
*     888E~?888L :888'8888.   888R     `888I  888. :888'8888.   4888>'88"  x88:  `)8b. 
*     888E  888E d888 '88%"   888R      888I  888I d888 '88%"   4888> '    8888N=*8888 
*     888E  888E 8888.+"      888R      888I  888I 8888.+"      4888>       %8"    R88 
*     888E  888E 8888L        888R    uW888L  888' 8888L       .d888L .+     @8Wou 9%  
*     888E  888E '8888c. .+  .888B . '*88888Nu88P  '8888c. .+  ^"8888*"    .888888P`   
*    m888N= 888>  "88888%    ^*888%  ~ '88888F`     "88888%       "Y"      `   ^"F     
*     `Y"   888     "YP'       "%       888 ^         "YP'                             
*          J88"                         *8E                                            
*          @%                           '8>                                            
*        :"                              "                                             
*/

    // http://stackoverflow.com/a/1811003/1121532
    // zero-index; return days in month; 0=jan, 11=dec.
    _getDaysInMonth: function(m,y) {
      return /8|3|5|10/.test(m)?30:m==1?(!(y%4)&&y%100)||!(y%400)?29:28:31;
    },

    // little helper to return the theme.
    // used like: $el.addClass( this._getTheme() );
    _getTheme: function() {

      var theme = "";
      if( this.settings.theme ) { 
        theme = "ui-gdatepicker-theme-"+ this.settings.theme; 
      }
      return theme;

    },

    _goBackAMonth: function() {

      // figure out what the new months will be
      // if we go below jan, set to dec of previous year

      if( this._active.month === 0 ) {
        this._active.year -= 1;
        this._active.month = 11;
      } else {
        this._active.month -=1;
      }

      this._populatePicker( "up" );      

    },

    _goForwardAMonth: function() {

      // figure out what the new months will be
      // if we go above dec, set to jan of next year
      if( this._active.month === 11 ) {
        this._active.year += 1;
        this._active.month = 0;
      } else {
        this._active.month +=1;
      }
      
      this._populatePicker( "down" );      

    },    

    _goBackAYear: function() {

      // figure out what the new year will be
      this._active.year -= 1;
      this._populatePicker( "up" );      

    },

    _goForwardAYear: function() {

      // figure out what the new year will be
      this._active.year += 1;
      this._populatePicker( "down" );      

    },

    _positionCurrentMonth: function( direction ) {

      // determine direction (up/down);
      var dir = direction || false;
      var $body = this._els.$pickerBody;
      var $firstday = $body.find(".gdpm-"+this._active.month+".gdpy-" +this._active.year ).first();

      // we use a 'trick' to position the body if the datepicker
      // is hidden; this is because we cannot get positions of hidden elements
      var trick = this._els.$picker.is(':hidden');
      if( trick ) { 
        this._els.$picker.css({ display: 'block' , opacity: '0' }); 
      }

      // find out height of a day (can change via CSS)
      var height = $body.find(".ui-gdatepicker-day").first().outerHeight();
      // get the offset of first day of active month
      var offset = $firstday.position().top;
      // get current scrollTop of body
      var current = $body.scrollTop();
      // set the final scroll destination
      var destination = current + offset - height;



      if( dir === "up" ) {

        // we find out how many days there are before the current month
        // and then we find out how many days in current month
        // and then add them together and divide by 7 to find the
        // number of weeks/rows ... 
        var count = $firstday.prevAll(".ui-gdatepicker-day").length;
        var dim = this._getDaysInMonth( this._active.month , this._active.year );
        var rows = Math.floor((count + dim) / 7);

        // we then quickly scroll down to the nth row
        // and then animate back up to the current date.
        $body.scrollTop( (rows) * height );
        $body.stop().animate({ "scrollTop": destination }, this.settings.scrollSpeed );



      } else if( dir === "down" ) {

        // because we always have exactly one month placed
        // before the current month, we can just set the scroll
        // to the top, and scroll down to current date.
        $body.scrollTop( 0 );
        $body.stop().animate({ "scrollTop": destination }, this.settings.scrollSpeed );


      } else {

        // scroll the body statically to show the current month
        $body.scrollTop( destination );

      }


      // put things back how we found them. good boy.
      if( trick ) { this._els.$picker.css({ display: '' , opacity: '' }); }

    }





  };






/***
*       ..                                                            ..      s       .x+=:.   
*     dF                      oec :                             x .d88"      :8      z`    ^%  
*    '88bu.                  @88888                 x.    .      5888R      .88         .   <k 
*    '*88888bu        .u     8"*88%        u      .@88k  z88u    '888R     :888ooo    .@8Ned8" 
*      ^"*8888N    ud8888.   8b.        us888u.  ~"8888 ^8888     888R   -*8888888  .@^%8888"  
*     beWE "888L :888'8888. u888888> .@88 "8888"   8888  888R     888R     8888    x88:  `)8b. 
*     888E  888E d888 '88%"  8888R   9888  9888    8888  888R     888R     8888    8888N=*8888 
*     888E  888E 8888.+"     8888P   9888  9888    8888  888R     888R     8888     %8"    R88 
*     888E  888F 8888L       *888>   9888  9888    8888 ,888B .   888R    .8888Lu=   @8Wou 9%  
*    .888N..888  '8888c. .+  4888    9888  9888   "8888Y 8888"   .888B .  ^%888*   .888888P`   
*     `"888*""    "88888%    '888    "888*""888"   `Y"   'YP     ^*888%     'Y"    `   ^"F     
*        ""         "YP'      88R     ^Y"   ^Y'                    "%                          
*                             88>                                                              
*                             48                                                               
*                             '8                                                               
*/

  $.fn.gdatepicker.defaults = {

    placeholder: "Pick a date...",
    // string:  
    // eg: "Pick me!"
    // generated input's placeholder if original input doesn't have.
              
    selectedFirst: "",
    // string, array
    // eg: "", [ 31, 12, 2012 ]
    // default date that is selected/highlighted. 
    // leave as blank string for none
    // overridden if input has "value=" with same format as "format" option
              
    selectedLast: "",
    // string, array
    // eg: "", [ 31, 12, 2012 ]
    // default date that is selected/highlighted. 
    // leave as blank string for none
    // overridden if input has "value=" with same format as "format" option
              
    selectRange: 14,
    // number, boolean
    // eg: 14,
    // maximum length of the range of dates allowed to pick.
    // a large number will result in slow performance
              
    format: "dd-MM-yyyy",
    // string 
    // eg: "dd-MM-yyyy"
    // format of original input
              
    formatOutput: "MMM dSX, yyyy",
    // string
    // eg: "dd of MMMM, yyyy" 
    // format of generated output
              
    days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    // array
    // eg: ['Monday','Tuesday','Wednesday','...']
    // days of week
              
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    // array
    // eg: ['January','February','March','...']
    // month names
              
    position: { top: 3, left: 0 },                  
    // array
    // eg: [0,0] 
    // offset position of calendar
              
    scrollSpeed: 300,                  
    // integer
    // eg: 300
    // how fast the calendar scrolls up and down
              
    overlayType: "both",                 
    // string, bool
    // eg: false, "both", "month", "year"
    // do we show the overlay for scrolling months/years
              
    overlayAnimation: "drop",                 
    // string
    // eg: "drop", "fade"
    // how the overlay is animated in and out
              
    theme: false,                  
    // string, bool
    // eg: false, "dark", "mint", "..."
    // sets the css theme style, supply your own string for custom

  };



})(jQuery);