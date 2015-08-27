(function($, _) {
    var that = this,
               Villain;
    Villain = that.Villain = {};
    Villain.EventBus = Villain.EventBus || _.extend({}, Backbone.Events);
    Villain.Blocks = Villain.Blocks || {};
    Villain.Editor = Villain.Editor || {};
    Villain.options = Villain.options || [];

    Villain.defaults = {
        textArea: '#textarea',
        browseURL: 'villain/browse/',
        uploadURL: 'villain/upload/',
        imageseriesURL: 'villain/imageseries/'
    };

    function $element(el) {
        return el instanceof $ ? el : $(el);
    }

    /* Mixins */
    //= mixins.js

    /* Plus */
    //= plus.js

    /* Blocks */
    //= blockstore.js
    //= block.js

    /* Blocktypes */
    //= blocks.text.js
    //= blocks.quote.js

    //= blocks.divider.js
    //= blocks.header.js
    //= blocks.list.js

    //= blocks.image.js
    //= blocks.slideshow.js
    //= blocks.video.js

    //= blocks.columns.js

    var blocks = [];

    //= editor.js

    //= formatpopup.js

    Villain.Editor.HTML = Villain.Editor.HTML || {};
    Villain.Editor.EditorHTML = Villain.Editor.EditorHTML || {};

    Villain.toMD = function toMD(html) {
        var html = toMarkdown(html);
        html = html.replace(/&nbsp;/g,' ');
        // Divitis style line breaks (handle the first line)
        html = html.replace(/([^<>]+)(<div>)/g,'$1\n$2')
                    // (double opening divs with one close from Chrome)
                    .replace(/<div><div>/g,'\n<div>')
                    .replace(/<div><br \/><\/div>/g, '\n\n')
                    .replace(/(?:<div>)([^<>]+)(?:<div>)/g,'$1\n')
                    // ^ (handle nested divs that start with content)
                    .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,'$1\n')
                    // ^ (handle content inside divs)
                    .replace(/<\/p>/g,'\n\n')
                    // P tags as line breaks
                    .replace(/<(.)?br(.)?>/g,'\n')
                    // Convert normal line breaks
                    .replace(/&lt;/g,'<').replace(/&gt;/g,'>');
                    // Encoding

        // strip whatever might be left.
        aggressiveStrip = true;
        if (aggressiveStrip) {
            html = html.replace(/<\/?[^>]+(>|$)/g, '');
        } else {
            // strip rest of the tags
            html = html.replace(/<(?=\S)\/?[^>]+(>|$)/ig, '');
        }
        return html;
    };

    Villain.toHTML = function toHTML(markdown, type) {
        // MD -> HTML
        if (_.isUndefined(markdown)) {
            return "";
        }

        type = _.classify(type);

        var html = markdown,
            shouldWrap = type === 'Text';

        if (_.isUndefined(shouldWrap)) { shouldWrap = false; }

        if (shouldWrap) {
            html = '<div>' + html;
        }

        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gm, function(match, p1, p2) {
            return '<a href="' + p2 + '">' + p1.replace(/\r?\n/g, '') + '</a>';
        });

        // This may seem crazy, but because JS doesn't have a look behind,
        // we reverse the string to regex out the italic items (and bold)
        // and look for something that doesn't start (or end in the reversed strings case)
        // with a slash.
        html = _.reverse(
            _.reverse(html)
            .replace(/_(?!\\)((_\\|[^_])*)_(?=$|[^\\])/gm, function(match, p1) {
                return '>i/<' + p1.replace(/\r?\n/g, '').replace(/[\s]+$/,'') + '>i<';
            })
            .replace(/\*\*(?!\\)((\*\*\\|[^\*\*])*)\*\*(?=$|[^\\])/gm, function(match, p1) {
                return '>b/<' + p1.replace(/\r?\n/g, '').replace(/[\s]+$/,'') + '>b<';
            })
        );

        html =  html.replace(/^\> (.+)$/mg,'$1');

        // Use custom formatters toHTML functions (if any exist)
        var formatName, format;
        for (formatName in Villain.Formatters) {
            if (Villain.Formatters.hasOwnProperty(formatName)) {
                format = Villain.Formatters[formatName];
                // Do we have a toHTML function?
                if (!_.isUndefined(format.toHTML) && _.isFunction(format.toHTML)) {
                    html = format.toHTML(html);
                }
            }
        }

        if (shouldWrap) {
            html = html.replace(/\r?\n\r?\n/gm, '</div><div><br></div><div>')
                       .replace(/\r?\n/gm, '</div><div>');
        }

        html = html.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                   .replace(/\r?\n/g, '<br>')
                   .replace(/\*\*/, '')
                   .replace(/__/, '');  // Cleanup any markdown characters left

        // Replace escaped
        html = html.replace(/\\\*/g, '*')
                   .replace(/\\\[/g, '[')
                   .replace(/\\\]/g, ']')
                   .replace(/\\\_/g, '_')
                   .replace(/\\\(/g, '(')
                   .replace(/\\\)/g, ')')
                   .replace(/\\\-/g, '-');

        if (shouldWrap) {
            html += '</div>';
        }

        return html;
    };

    Villain.setOptions = function setOptions(options) {
        if (_.isUndefined(options.imageSeries) || _.isUndefined(options.baseURL)) {
            console.error("Villain: baseURL and imageSeries MUST be set on initialization.");
        }
        Villain.defaults.browseURL = options.baseURL + Villain.defaults.browseURL + options.imageSeries;
        Villain.defaults.uploadURL = options.baseURL + Villain.defaults.uploadURL + options.imageSeries;
        Villain.defaults.imageseriesURL = options.baseURL + Villain.defaults.imageseriesURL;
        Villain.options = $.extend({}, Villain.defaults, options);
        console.log(Villain.options);
    };

    Villain.browser = function browser() {
        var browser = {};

        if (this.getIEversion() > 0) {
            browser.msie = true;
        } else {
            var ua = navigator.userAgent.toLowerCase(),
            match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                    /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                    /(msie) ([\w.]+)/.exec(ua) ||
                    ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                    [],

            matched = {
                browser: match[1] || '',
                version: match[2] || '0'
            };

            if (match[1]) {
                browser[matched.browser] = true;
            }
            if (parseInt(matched.version, 10) < 9 && browser.msie) {
                browser.oldMsie = true;
            }

            // Chrome is Webkit, but Webkit is also Safari.
            if (browser.chrome) {
                browser.webkit = true;
            } else if (browser.webkit) {
                browser.safari = true;
            }
        }
        return browser;
    };

    Villain.Editor.processPaste = function processPaste(pastedFrag) {
        var cleanHtml;
        if (pastedFrag.match(/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/gi)) {
            cleanHtml = Villain.Editor.wordClean(pastedFrag);
            cleanHtml = Villain.Editor.clean($('<div>').append(cleanHtml).html(), false, true);
            cleanHtml = Villain.Editor.removeEmptyTags(cleanHtml);
        } else {
            // Paste.
            cleanHtml = Villain.Editor.clean(pastedFrag, false, true);
            cleanHtml = Villain.Editor.removeEmptyTags(cleanHtml);
        }

        cleanHtml = Villain.Editor.plainPasteClean(cleanHtml);

        // Check if there is anything to clean.
        if (cleanHtml !== '') {
            // Insert HTML.
            return cleanHtml;
        }
    };

    Villain.Editor.wordClean = function wordClean(html) {
        // Keep only body.
        if (html.indexOf('<body') >= 0) {
            html = html.replace(/[.\s\S\w\W<>]*<body[^>]*>([.\s\S\w\W<>]*)<\/body>[.\s\S\w\W<>]*/g, '$1');
        }

        // Single item list.
        html = html.replace(
            /<p(.*?)class="?'?MsoListParagraph"?'?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
            '<ul><li><p>$3</p></li></ul>'
        );

        // List start.
        html = html.replace(
            /<p(.*?)class="?'?MsoListParagraphCxSpFirst"?'?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
            '<ul><li><p>$3</p></li>'
        );

        // List middle.
        html = html.replace(
            /<p(.*?)class="?'?MsoListParagraphCxSpMiddle"?'?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
            '<li><p>$3</p></li>'
        );

        // List end.
        html = html.replace(/<p(.*?)class="?'?MsoListParagraphCxSpLast"?'?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
                '<li><p>$3</p></li></ul>');

        // Clean list bullets.
        html = html.replace(/<span([^<]*?)style="?'?mso-list:Ignore"?'?([\s\S]*?)>([\s\S]*?)<span/gi, '<span><span');

        // Webkit clean list bullets.
        html = html.replace(/<!--\[if \!supportLists\]-->([\s\S]*?)<!--\[endif\]-->/gi, '');

        // Remove mso classes.
        html = html.replace(/(\n|\r| class=(")?Mso[a-zA-Z]+(")?)/gi, ' ');

        // Remove comments.
        html = html.replace(/<!--[\s\S]*?-->/gi, '');

        // Remove tags but keep content.
        html = html.replace(/<(\/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>/gi, '');

        // Remove no needed tags.
        var word_tags = ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'];
        for (var i = 0; i < word_tags.length; i++) {
            var regex = new RegExp('<' + word_tags[i] + '.*?' + word_tags[i] + '(.*?)>', 'gi');
            html = html.replace(regex, '');
        }

        // Remove attributes.
        html = html.replace(/([\w\-]*)=("[^<>"]*"|'[^<>']*'|\w+)/gi, '');

        // Remove spaces.
        html = html.replace(/&nbsp;/gi, '');

        // Remove empty tags.
        var oldHTML;
        do {
            oldHTML = html;
            html = html.replace(/<[^\/>][^>]*><\/[^>]+>/gi, '');
        } while (html != oldHTML);

        html = Villain.Editor.clean(html);

        return html;
    };

    Villain.Editor.clean = function clean(html, allow_id, clean_style, allowed_tags, allowed_attrs) {
        // List of allowed attributes.
        allowed_attrs = [
            'accept', 'accept-charset', 'accesskey', 'action', 'align',
            'alt', 'async', 'autocomplete', 'autofocus', 'autoplay',
            'autosave', 'background', 'bgcolor', 'border', 'charset',
            'cellpadding', 'cellspacing', 'checked', 'cite', 'class',
            'color', 'cols', 'colspan', 'contenteditable', 'contextmenu',
            'controls', 'coords', 'data', 'data-.*', 'datetime',
            'default', 'defer', 'dir', 'dirname', 'disabled',
            'download', 'draggable', 'dropzone', 'enctype', 'for',
            'form', 'formaction', 'headers', 'height', 'hidden', 'high',
            'href', 'hreflang', 'icon', 'id', 'ismap', 'itemprop',
            'keytype', 'kind', 'label', 'lang', 'language', 'list',
            'loop', 'low', 'max', 'maxlength', 'media', 'method',
            'min', 'multiple', 'name', 'novalidate', 'open', 'optimum',
            'pattern', 'ping', 'placeholder', 'poster', 'preload',
            'pubdate', 'radiogroup', 'readonly', 'rel', 'required',
            'reversed', 'rows', 'rowspan', 'sandbox', 'scope', 'scoped',
            'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes',
            'span', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step',
            'summary', 'spellcheck', 'style', 'tabindex', 'target', 'title',
            'type', 'translate', 'usemap', 'value', 'valign', 'width', 'wrap'
        ];
        allowed_tags = [
            '!--', 'a', 'abbr', 'address', 'area', 'article', 'aside',
            'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'br',
            'button', 'canvas', 'caption', 'cite', 'code', 'col',
            'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn',
            'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
            'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
            'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i',
            'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label',
            'legend', 'li', 'link', 'main', 'map', 'mark', 'menu',
            'menuitem', 'meter', 'nav', 'noscript', 'object', 'ol',
            'optgroup', 'option', 'output', 'p', 'param', 'pre',
            'progress', 'queue', 'rp', 'rt', 'ruby', 's', 'samp',
            'script', 'section', 'select', 'small', 'source',
            'span', 'strong', 'style', 'sub', 'summary', 'sup',
            'table', 'tbody', 'td', 'textarea', 'tfoot', 'th',
            'thead', 'time', 'title', 'tr', 'track', 'u', 'ul',
            'var', 'video', 'wbr'
        ];

        // Remove script tag.
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove all tags not in allowed tags.
        var at_reg = new RegExp('<\\/?((?!(?:' + allowed_tags.join('|') + '))\\w+)[^>]*?>', 'gi');
        html = html.replace(at_reg, '');

        // Remove all attributes not in allowed attrs.
        var aa_reg = new RegExp(
            '( (?!(?:' + allowed_attrs.join('|') +
            '))[a-zA-Z0-9-_]+)=((?:.(?!\\s+(?:\\S+)=|[>]|(\\/>)))+.)', 'gi'
        );
        html = html.replace(aa_reg, '');

        // Clean style.
        var style_reg = new RegExp(
            'style=("[a-zA-Z0-9:;\\.\\s\\(\\)\\-\\,!\\/\'%]*"|' +
            '\'[a-zA-Z0-9:;\\.\\s\\(\\)\\-\\,!\\/"%]*\')', 'gi'
        );
        html = html.replace(style_reg, '');

        // Remove the class.
        var $div = $('<div>').append(html);
        $div.find('[class]:not([class^="fr-"])').each(function(index, el) {
            $(el).removeAttr('class');
        });

        html = $div.html();

        return html;
    };

    Villain.Editor.plainPasteClean = function plainPasteClean(html) {
        var $div = $('<div>').html(html);

        $div.find('h1, h2, h3, h4, h5, h6, pre, blockquote').each(function(i, el) {
            $(el).replaceWith('<p>' + $(el).html() + '</p>');
        });

        var replacePlain = function(i, el) {
            $(el).replaceWith($(el).html());
        };

        while ($div.find('strong, em, strike, b, u, i, sup, sub, span, a').length) {
            $div.find('strong, em, strike, b, u, i, sup, sub, span, a').each (replacePlain);
        }

        return $div.html();
    };

    Villain.Editor.removeEmptyTags = function removeEmptyTags(html) {
        var i,
            $div = $('<div>').html(html),
            empty_tags = $div.find('*:empty:not(br, img, td, th)');

        while (empty_tags.length) {
            for (i = 0; i < empty_tags.length; i++) {
                $(empty_tags[i]).remove();
            }

            empty_tags = $div.find('*:empty:not(br, img, td, th)');
        }

        // Workaround for Notepad paste.
        $div.find('> div').each(function(i, div) {
            $(div).replaceWith($(div).html() + '<br/>');
        });

        // Remove divs.
        var divs = $div.find('div');
        while (divs.length) {
            for (i = 0; i < divs.length; i++) {
                var $el = $(divs[i]),
                    text = $el.html().replace(/\u0009/gi, '').trim();

                $el.replaceWith(text);
            }

            divs = $div.find('div');
        }

        return $div.html();
    };

    Villain.Editor.pasteHtmlAtCaret = function pasteHtmlAtCaret(html) {
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                // Range.createContextualFragment() would be useful here but is
                // only relatively recently standardized and is not supported in
                // some browsers (IE9, for one)
                var el = document.createElement('div');
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while (node = el.firstChild) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type != 'Control') {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    };

    //= blockregistry.js

}(jQuery, _));
