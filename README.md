Villain
=======

*EXPERIMENTAL, DO NOT USE!*

## Dependencies:

* [jquery.js](http://jquery.com/download/)
* [backbone.js](http://backbonejs.org/backbone-min.js)
* [underscore.js](http://underscorejs.org/underscore-min.js)
* [he.js](https://github.com/mathiasbynens/he)
* [to-markdown.js](https://github.com/domchristie/to-markdown)
* [markdown.min.js](https://github.com/evilstreak/markdown-js)

## Usage:

Include dependencies + `villain.js` and `villain.css` located in `dist/`.

Add to your HTML:

```html
    <textarea id="id_body"></textarea>
    <div id="villain"></div>
    <script type="text/javascript">
        $(document).ready(function() {
            v = new Villain.Editor({
              textArea: 'textarea[name="post[data]"]',
              baseURL: '/admin/posts/',
              imageSeries: 'post'
            });
        });
    </script>
```

## Options

  * `textArea`: selector of source textarea.
  * `baseUrl`: Base URL to which we append `browse/`, `upload/` etc
  * `extraBlocks`: List of extra blocks to add in. Capitalize each block. Ex: `["Myblock", "CustomVideo"]`. Filename should be `blocks.<block_name>.js`.