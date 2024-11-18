
class StackLog {
    constructor(name) {
        this.name = name;
        this.messages = []
    }

    log() {
        const clean = JSON.parse(JSON.stringify(Array.from(arguments)))

        // The basic log will print the clean string.
        // but this reduces readability.
        // The second logger stores a cache of objects for a time.
        // the history is a max list.

        const printable = this.convert(Array.from(arguments))
        this.pushRender(printable)
        // console.log.apply(console, arguments)
        // console.log.apply(console, clean)
    }

    convert(args) {
        // The given args are log elements.
        // Create a record, return a printable thing.
        let items = args.map((x, i)=>{

            let type = typeof(x)

            const color = {
                string: "color: #9999FF"
                , number: "color: #AB66EE"
                , object: "color: #4499ee"
            }[type]

            if(type != 'string') {
            }
            return {
                type: type
                , index: i
                , value: x
                , string: [`%c${x.toString()}`, color]
            }
        })
        return items;
    }

    pushRender(printable) {
        /* A single entry to apply to the view log.
        This should manage the max count in history and only push one
        update to the visible stack. */
        this.messages.push(printable)
        let r= [], c = [];

        Object.values(printable).forEach((x)=> {
            r.push(x.string[0])
            c.push(x.string[1])
            // r = r.concat(x.string)
        })
        r = [r.join(' ')].concat(c)

        console.log.apply(console, r)
    }
}


class MultiLogger {
    /*
    Multilogger allows console.log like printing to the custom log.
    The name of the log stack defines which stack it logs into.

    The ui logger will present split divs.
     */
    constructor() {
        this.stacks = {}
    }

    enableSpy() {
        const innerLogger = this;
        this.origConsole = console
        let realLogger = this.realLogger = console.log.bind(this.origConsole)
        const consoleProxy = new Proxy(realLogger, {
            get(target, prop, receiver) {
                // log inspection.
                realLogger('printing', prop)
                return function wrapper() {
                    /* Replaces the orginal caller to capture
                    the incoming arguments.*/
                    innerLogger.log(prop, arguments)
                    realLogger(...arguments)
                }.bind(this.origConsole)
            }
        })

        log = function() {
            var context = "My Descriptive Logger Prefix:";
            logger.log(context)
            return Function.prototype.bind.call(console.log, console, context);
        }();

        // console = consoleProxy
        // console.log('Logger Installed')
    }

    create(name) {
        // All args are _pretty printed_ like the console logger.
        let stack = this.stacks[name] = new StackLog(name)
        return stack.log.bind(stack)
    }
}

logger = new MultiLogger
// logger.enableSpy()



// log('hello', 'world');



// ;log(
//   "Multiple styles: %cred %corange",
//   "color: red",
//   "color: orange",
//   "Additional unformatted message",
// );

// ;log(
//   "This is %cMy stylish message",
//   "color: yellow; font-style: italic; background-color: blue;padding: 2px",
//   "Additional unformatted message",
// );
