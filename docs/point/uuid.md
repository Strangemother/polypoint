title: uuid
type: string
returns: _self_ id string
---

Get or create a random string `_id` for this point. This is generated _once_ for this point. Subsequent calls return the same string.

```
point._id
point.uuid // getter create

point._id
point.uuid // same value
```