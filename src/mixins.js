var url_regex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

_.mixin({
    isURI : function(string) {
        return (url_regex.test(string));
    },

    titleize: function(str) {
        if (str === null) {
            return '';
        }
        str  = String(str).toLowerCase();
        return str.replace(/(?:^|\s|-)\S/g, function(c) { return c.toUpperCase(); });
    },

    classify: function(str) {
        return _.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
    },

    classifyList: function(a) {
        return _.map(a, function(i) { return _.classify(i); });
    },

    capitalize : function(string) {
        return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    },

    underscored: function(str) {
        return _.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
        .replace(/[-\s]+/g, '_').toLowerCase();
    },

    trim : function(string) {
        return string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },

    reverse: function(str) {
        return str.split('').reverse().join('');
    },

    flattern: function(obj) {
        var x = {};
        _.each(obj, function(a,b) {
          x[(_.isArray(obj)) ? a : b] = true;
      });
        return x;
    },

    to_slug: function(str) {
        return str
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
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
    var iterationDuration = Math.floor(duration / iterations);

    originalColor = this.css('background-color');
    this.css('background-color','#ffffdd');
    for (var i = 0; i < iterations; i++) {
        this.fadeOut(iterationDuration).fadeIn(iterationDuration, function() {
            this.css('background-color', '#ffffff');
        });
    }
    //this.css('background-color',originalColor);
    return this;
};

$.fn.shake = function(shakes, distance, duration) {
    shakes = shakes || 3;
    distance = distance || 10;
    duration = duration || 300;
    this.each(function() {
        $(this).css('position', 'relative');
        for (var x = 1; x <= shakes; x++) {
            $(this).animate({left: (distance * -1)}, (((duration / shakes) / 4)))
                   .animate({left: distance}, ((duration / shakes) / 2))
                   .animate({left: 0}, (((duration / shakes) / 4)));
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
          target = $(this).addClass(opts.loadingClass),
          overlay = '<div class="' + opts.overlayClass + '">' +
        '<p class="' + opts.spinnerClass + '">' +
        '<span class="' + opts.iconClass + '"></span>' +
        '<span class="' + opts.textClass + '">' + opts.loadingText + '</span>' +
        '</p></div>';
      // Don't add duplicate loading-overlay
      if (!target.data('loading-overlay')) {
        target.prepend($(overlay)).data('loading-overlay', true);
      }
      return target;
    },

    remove: function(options) {
      var opts = $.extend({}, $.fn.loadingOverlay.defaults, options),
          target = $(this).data('loading-overlay', false);
      target.find('.' + opts.overlayClass).detach();
      if (target.hasClass(opts.loadingClass)) {
        target.removeClass(opts.loadingClass);
      } else {
        target.find('.' + opts.loadingClass).removeClass(opts.loadingClass);
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
    loadingClass: 'loading',          // Class added to target while loading
    overlayClass: 'loading-overlay',  // Class added to overlay (style with CSS)
    spinnerClass: 'loading-spinner',  // Class added to loading overlay spinner
    iconClass: 'loading-icon fa fa-circle-o-notch fa-spin',        // Class added to loading overlay spinner
    textClass: 'loading-text',        // Class added to loading overlay spinner
    loadingText: ''            // Text within loading overlay
  };

}(jQuery));
