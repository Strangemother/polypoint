    /*
title: Upload Snapshots
categories: gif
files:
    head
    pointlist
    point
    stage
    mouse
    stroke
    ../point_src/random.js
    ../point_src/easing.js
    ../point_src/iter/lerp.js
---

Save many images on the server to generate an animated gif using the backend.
*/

// In your js file you can include this code block
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrf_token = getCookie("csrftoken");

const sendCache = {
    series_index: 0
}

const trimAsyncPost = async function(url, body) {

    let prom = new Promise(async (resolve, reject) => {

        try {
            const response = await fetch(url, {
                method: "POST",
                // DO NOT SET 'Content-Type' when using FormData!
                body: body
            })
            let d = await response.json()
            resolve(response);
        } catch (err) {
            reject(err);
        }
    });

    return prom
}

let runTrimForm = function(){
    let tf = new TrimForm()
    tf.addFields({
        "csrfmiddlewaretoken": csrf_token
        ,"theatre_filename": "gif-recorder"
        ,"series_index": sendCache.series_index
        // ,"image_file": [new Blob(), "filename.png"]
    });

    let url = "/examples/upload/image/"
    tf.post(url).then(console.log)
    return tf
};

class TrimForm extends FormData {
    /* This provides an interface to using form data for
    fast ajaxy posts to django

    */
    populateBody(fieldData=this._fieldBodyData, body=this) {
        for(let k in fieldData) {
            body.append(k, fieldData[k])
        }

        return body
    }

    addFields(dict) {
        for(let k in dict) {
            this.addField(k, dict[k])
        }
    }

    addField(name, value) {
        // if(this._fieldBodyData == undefined) {
        //     this._fieldBodyData = {}
        // }
        // this._fieldBodyData[name] = value
        this.append(name, value)

    }

    post(url) {
        // this.populateBody()
        return trimAsyncPost(url, this).then(console.log)
    }
}


const sendImage = async function(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(async (b) => {
            let body = new FormData();
            body.append("csrfmiddlewaretoken", csrf_token);
            body.append("image_file", b, "filename.png");
            body.append("theatre_filename", "gif-recorder");
            body.append("series_index", sendCache.series_index);

            try {
                const response = await fetch("/examples/upload/image/", {
                    method: "POST",
                    // DO NOT SET 'Content-Type' when using FormData!
                    body: body
                })
                let d = await response.json()
                console.log('response',d)
                if(d.series_index) {
                    console.log('Stashing series index', d.series_index)
                    sendCache.series_index = d.series_index
                }

                resolve(response);
            } catch (err) {
                reject(err);
            }
        });
    });
}


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let count = 50
        this.a = PointList.generate.random(count, [200,350, 20, 200], [60, 150, 1, 1])
        this.b = PointList.generate.radius({count, offset: {radius:3}}, 140, new Point(500, 300))
        this.c = PointList.generate.random(count)
    }

    onMousedown(e) {
        console.log('mousedown')
        this.update()
        this.draw(this.ctx)
        sendImage(this.canvas)
    }

    draw(ctx) {
        this.clear(ctx, '#010101')

        this.a.pen.indicator(ctx, 'green')
        this.b.pen.indicator(ctx, {color:'#333'})

        this.c.lerper.through(this.a, this.b, {seconds: 5,
                                        easing: linearInOut, fps: 30})
        this.c.pen.indicator(ctx, {color:'purple'})
    }
}


;stage = MainStage.go({
    loop: false
});