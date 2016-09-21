/* eslint-disable */

import _ from 'underscore';
import $ from 'jquery';

var url_regex =
  /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

_.mixin({
  isURI: function(string) {
    return (url_regex.test(string));
  },

  titleize: function(str) {
    if (str === null) {
      return '';
    }
    str = String(str)
      .toLowerCase();
    return str.replace(/(?:^|\s|-)\S/g, function(c) {
      return c.toUpperCase();
    });
  },

  classify: function(str) {
    return _.titleize(String(str)
        .replace(/[\W_]/g, ' '))
      .replace(/\s/g, '');
  },

  classifyList: function(a) {
    return _.map(a, function(i) {
      return _.classify(i);
    });
  },

  capitalize: function(string) {
    return string.charAt(0)
      .toUpperCase() + string.substring(1)
      .toLowerCase();
  },

  underscored: function(str) {
    return _.trim(str)
      .replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase();
  },

  trim: function(string) {
    return string.replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
  },

  reverse: function(str) {
    return str.split('')
      .reverse()
      .join('');
  },

  flattern: function(obj) {
    var x = {};
    _.each(obj, function(a, b) {
      x[(_.isArray(obj)) ? a : b] = true;
    });
    return x;
  },

  to_slug: function(str) {
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
});

$.fn.visible = function() {
  return this.css('visibility', 'visible');
};

$.fn.invisible = function() {
  return this.css('visibility', 'hidden');
};

$.fn.visibilityToggle = function() {
  return this.css('visibility', function(i, visibility) {
    return (visibility == 'visible') ? 'hidden' : 'visible';
  });
};

$.fn.caretToEnd = function() {
  var range, selection;

  range = document.createRange();
  range.selectNodeContents(this[0]);
  range.collapse(false);

  selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  return this;
};

// Extend jquery with flashing for elements
$.fn.flash = function(duration, iterations) {
  duration = duration || 1000; // Default to 1 second
  iterations = iterations || 2; // Default to 1 iteration
  let iterationDuration = Math.floor(duration / iterations);

  let originalColor = this.css('background-color');
  this.css('background-color', '#ffffdd');
  for (var i = 0; i < iterations; i++) {
    this.fadeOut(iterationDuration)
      .fadeIn(iterationDuration, function() {
        this.css('background-color', '#ffffff');
      });
  }
  this.css('background-color', originalColor);
  return this;
};

$.fn.shake = function(shakes, distance, duration) {
  shakes = shakes || 3;
  distance = distance || 10;
  duration = duration || 300;
  this.each(function() {
    $(this)
      .css('position', 'relative');
    for (var x = 1; x <= shakes; x++) {
      $(this)
        .animate({
          left: (distance * -1)
        }, (((duration / shakes) / 4)))
        .animate({
          left: distance
        }, ((duration / shakes) / 2))
        .animate({
          left: 0
        }, (((duration / shakes) / 4)));
    }
  });
  return this;
};

/*! Loading Overlay - v1.0.2 - 2014-02-19
 * http://jgerigmeyer.github.io/jquery-loading-overlay/
 * Copyright (c) 2014 Jonny Gerig Meyer; Licensed MIT */
(function($) {

  'use strict';

  var methods = {
    init: function(options) {
      var opts = $.extend({}, $.fn.loadingOverlay.defaults, options),
        target = $(this)
        .addClass(opts.loadingClass),
        overlay = '<div class="' + opts.overlayClass + '">' +
        '<p class="' + opts.spinnerClass + '">' +
        '<span class="' + opts.iconClass + '"></span>' +
        '<span class="' + opts.textClass + '">' + opts.loadingText + '</span>' +
        '</p></div>';
      // Don't add duplicate loading-overlay
      if (!target.data('loading-overlay')) {
        target.prepend($(overlay))
          .data('loading-overlay', true);
      }
      return target;
    },

    remove: function(options) {
      var opts = $.extend({}, $.fn.loadingOverlay.defaults, options),
        target = $(this)
        .data('loading-overlay', false);
      target.find('.' + opts.overlayClass)
        .detach();
      if (target.hasClass(opts.loadingClass)) {
        target.removeClass(opts.loadingClass);
      } else {
        target.find('.' + opts.loadingClass)
          .removeClass(opts.loadingClass);
      }
      return target;
    },

    // Expose internal methods to allow stubbing in tests
    exposeMethods: function() {
      return methods;
    }
  };

  $.fn.loadingOverlay = function(method) {
    if (methods[method]) {
      return methods[method].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.loadingOverlay');
    }
  };

  /* Setup plugin defaults */
  $.fn.loadingOverlay.defaults = {
    loadingClass: 'loading', // Class added to target while loading
    overlayClass: 'loading-overlay', // Class added to overlay (style with CSS)
    spinnerClass: 'loading-spinner', // Class added to loading overlay spinner
    iconClass: 'loading-icon fa fa-circle-o-notch fa-spin', // Class added to loading overlay spinner
    textClass: 'loading-text', // Class added to loading overlay spinner
    loadingText: '' // Text within loading overlay
  };
}($));

 (function($){
    //pass in just the context as a $(obj) or a settings JS object
    $.fn.autogrow = function(opts) {
        var that = $(this).css({overflow: 'hidden', resize: 'none'}) //prevent scrollies
            , selector = that.selector
            , defaults = {
                context: $(document) //what to wire events to
                , animate: true //if you want the size change to animate
                , speed: 200 //speed of animation
                , fixMinHeight: true //if you don't want the box to shrink below its initial size
                , cloneClass: 'autogrowclone' //helper CSS class for clone if you need to add special rules
                , onInitialize: false //resizes the textareas when the plugin is initialized
            }
        ;
        opts = $.isPlainObject(opts) ? opts : {context: opts ? opts : $(document)};
        opts = $.extend({}, defaults, opts);
        that.each(function(i, elem){
            var min, clone;
            elem = $(elem);
            //if the element is "invisible", we get an incorrect height value
            //to get correct value, clone and append to the body.
            if (elem.is(':visible') || parseInt(elem.css('height'), 10) > 0) {
                min = parseInt(elem.css('height'), 10) || elem.innerHeight();
            } else {
                clone = elem.clone()
                    .addClass(opts.cloneClass)
                    .val(elem.val())
                    .css({
                        position: 'absolute'
                        , visibility: 'hidden'
                        , display: 'block'
                    })
                ;
                $('body').append(clone);
                min = clone.innerHeight();
                clone.remove();
            }
            if (opts.fixMinHeight) {
                elem.data('autogrow-start-height', min); //set min height
            }
            elem.css('height', min);

            if (opts.onInitialize && elem.length) {
                resize.call(elem[0]);
                var ev = $.Event("keyup");
                ev.which = 38;
                ev.keyCode = 38;
                setTimeout(function() {elem.trigger(ev)}, 1000);

            }
        });
        opts.context
            .on('keyup paste', selector, resize)
        ;

        function resize (e){
            var box = $(this)
                , oldHeight = box.innerHeight()
                , newHeight = this.scrollHeight
                , minHeight = box.data('autogrow-start-height') || 0
                , clone
            ;
            if (oldHeight < newHeight) { //user is typing
                this.scrollTop = 0; //try to reduce the top of the content hiding for a second
                if(opts.animate) {
                    box.stop().animate({height: newHeight}, {duration: opts.speed, complete: notifyGrown});
                } else {
                    box.innerHeight(newHeight);
                    notifyGrown();
                }

            } else if (!e || e.which == 8 || e.which == 46 || (e.ctrlKey && e.which == 88)) { //user is deleting, backspacing, or cutting
                if (oldHeight > minHeight) { //shrink!
                    //this cloning part is not particularly necessary. however, it helps with animation
                    //since the only way to cleanly calculate where to shrink the box to is to incrementally
                    //reduce the height of the box until the $.innerHeight() and the scrollHeight differ.
                    //doing this on an exact clone to figure out the height first and then applying it to the
                    //actual box makes it look cleaner to the user
                    clone = box.clone()
                        //add clone class for extra css rules
                        .addClass(opts.cloneClass)
                        //make "invisible", remove height restriction potentially imposed by existing CSS
                        .css({position: 'absolute', zIndex:-10, height: ''})
                        //populate with content for consistent measuring
                        .val(box.val())
                    ;
                    box.after(clone); //append as close to the box as possible for best CSS matching for clone
                    do { //reduce height until they don't match
                        newHeight = clone[0].scrollHeight - 1;
                        clone.innerHeight(newHeight);
                    } while (newHeight === clone[0].scrollHeight);
                    newHeight++; //adding one back eliminates a wiggle on deletion
                    clone.remove();
                    box.focus(); // Fix issue with Chrome losing focus from the textarea.

                    //if user selects all and deletes or holds down delete til beginning
                    //user could get here and shrink whole box
                    newHeight < minHeight && (newHeight = minHeight);
                    if(oldHeight > newHeight) {
                        if(opts.animate) {
                            box.stop().animate({height: newHeight}, {duration: opts.speed, complete: notifyShrunk});
                        } else {
                            box.innerHeight(newHeight);
                            notifyShrunk();
                        }
                    }

                } else { //just set to the minHeight
                    box.innerHeight(minHeight);
                }
            }
        }

        // Trigger event to indicate a textarea has grown.
        function notifyGrown() {
            opts.context.trigger('autogrow:grow');
        }

        // Trigger event to indicate a textarea has shrunk.
        function notifyShrunk() {
            opts.context.trigger('autogrow:shrink');
        }

        return that;
    }
})($);
