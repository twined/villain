/* eslint-disable */

import _ from 'underscore';
import toMarkdown from 'to-markdown';

class Markup {
    static toMD(html) {
        html = toMarkdown(html);
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
        html = html.replace(/<\/?[^>]+(>|$)/g, '');

        return html;
    }

    static toHTML(markdown, type) {
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
    }
}


export default Markup;
