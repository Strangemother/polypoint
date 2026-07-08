# Text and Labels

**RawText**: No Styling, no rotation. Fill and Stroke using the global styles.

+ No rotation
+ No custom styling

**Label**: Text without the extras, using the global ctx styles.

+ can have rotation
+ Not custom styled by default

**Text**: Text with styles - a builtin font styler, designed to enable these upon render.

+ can have rotation
+ Custom styling
    + Has an internal point list

**Char**: A single character, with measurements.

+ can rotate
+ Custom styling

```js
t = new Text(settings)
t.value == t.text = 'banana'
t.points[0].xy = [100, 200]

t.write(ctx, settings)

// Perhaps
t.draw.stroke(ctx)
t.draw.fill(ctx)

t.pen.stoke(ctx)
t.pen.fill(ctx)
```

```js
t = new Label(settings)
t.xy = [100, 200]
t.value == t.text = 'banana'
```