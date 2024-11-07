Timelines, Events, and Triggers

We can animate process through a timeline, using seconds or frames to detect positions along a sequence.
When we meet a keyframe, the programmed action occurs, and runs until another event or trigger.

The Trigger is similar to an event, such as the event of reaching a certain `x/y`. however a user can actuate a trigger.
It would be prudent to ensure the trigger _end_ is a range, ensuring a value and _nearly_ hit for an event to occur.

    a.x = 0
    a.x += 100
        a.x == 99:
            event(a, 'x')
                b.x = a.x
                b.y += 100
                    b.y == 99:
                        event(a, 'y')
                            ...

---

This can occur in two forms. An _enforced_ procedure, or event-like.

The enforced changes a value at a specific time. Such as _x_ must be 100 at 2 seconds - performed with timers.

An event-like is more nuance - upon each iteration we test to see if a value meets a condition. Such as "_if x ~= 100_" (regardless of time taken.) - performed with a tick test.

The event-like example is useful for trigger interaction, such as a user has moved a point to a certain position. The enforced method is good for explicit states such as canned animations.


```js
t = new Timeline(stage)

p = new Point(20,20)

// 1 second
t.at(1, ()={
    p.x = 100
})

// 3 seconds
t.at(3, ()={
    p.x = 400
})

t.play()
/* Run (20 => 100) 1 second, (100 => 400) 2 seconds */
```