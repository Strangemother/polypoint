# HTML Include

Polypoint should come with a web component, to easily run polypoint hoisted canvas layers. 
This may be utilised though a range of includsion methods

Theatre load:

```html 
<polypoint-canvas 
    theatre="my/theatre-file.js"
    width="800" height="600"></polypoint-canvas>
```

With inline code: 


```html 
    <polypoint-canvas>
        context.beginPath();
        context.arc(50, 50, 40, 0, 2 * Math.PI);
        context.stroke();
    </polypoint-canvas>
```

With script tag:

```html 
    <polypoint-canvas>
        <script type="javascript">
            context.beginPath();
            context.arc(50, 50, 40, 0, 2 * Math.PI);
            context.stroke();
        </script>
    </polypoint-canvas>
```
