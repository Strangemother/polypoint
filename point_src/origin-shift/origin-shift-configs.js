class OriginShiftConfigs {

    large(kw){

        let radius = 5
        let gap = 0 // Math.floor(radius * .25)
        let conf = {
            /* The size of a single position for a path origin */
            positionSize: 1
            /* the size of the indicator at the end of a path */
            , tipRadius: 1
            , tipWidth: 1
            , tipColor: 'grey'
            , lineWidth: 1
            /* Position radius*/
            , radius
            /* How many items per row within the grid */
            , cols: 200
            , rows: 120

            /* Distance between nodes - not including extended draws*/
            , gap// Math.floor(radius * .25)
            /* Distance between points */
            , pointSpread: radius + gap
            /* How many move steps the origin should perform per draw() */
            , drawStepCount: 10
            , drawTip: false
            /* boolean to render the center position of every point*/
            , drawPosition: false
            , lineColor: 'white'
            , originColor: 'red'
        }
        return Object.assign(conf, kw)
    }

    medium(kw){

        let radius = 10
        let gap = 0 // Math.floor(radius * .25)
        let conf = {
            /* The size of a single position for a path origin */
            positionSize: 1
            /* the size of the indicator at the end of a path */
            , tipRadius: 1
            , tipWidth: 1
            , tipColor: 'grey'
            , lineWidth: 1
            /* Position radius*/
            , radius
            /* How many items per row within the grid */
            , cols: 100
            , rows: 50

            /* Distance between nodes - not including extended draws*/
            , gap// Math.floor(radius * .25)
            /* Distance between points */
            , pointSpread: radius + gap
            /* How many move steps the origin should perform per draw() */
            , drawStepCount: 10
            , drawTip: false
            /* boolean to render the center position of every point*/
            , drawPosition: false
            , lineColor: 'white'
            , originColor: 'red'
        }
        return Object.assign(conf, kw)
    }

    small(kw){

        let radius = 40
        let gap = 10 // Math.floor(radius * .25)
        let conf = {
            /* The size of a single position for a path origin */
            positionSize: 4
            /* the size of the indicator at the end of a path */
            , tipRadius: 2
            , tipWidth: 1
            , tipColor: 'pink'
            , lineWidth: 4
            /* Position radius*/
            , radius
            /* How many items per row within the grid */
            , cols: 20
            , rows: 10
            /* Distance between nodes - not including extended draws*/
            , gap// Math.floor(radius * .25)
            /* Distance between points */
            , pointSpread: radius + gap
            /* How many move steps the origin should perform per draw() */
            , drawStepCount: 3
            , drawTip: true
            /* boolean to render the center position of every point*/
            , drawPosition: true
            , lineColor: 'white'
            // , lineColor: '#880000'
            , originColor: 'red'
        }
        return Object.assign(conf, kw)
    }

    alienText(kw){
        let conf = this.small({
            drawTip: false
            , cols: 25
            , rows: 3
            , gap: 0
            , radius: 10
            , pointSpread: 40
            , lineWidth: 10
            , drawPosition: false
        })
        return Object.assign(conf, kw)
    }

    maze(kw) {
        let conf = {
            rows: 60
            , cols: 80
            , radius: 1
            , lineWidth: 10
            , pointSpread: 12
            , drawTip: false
            , drawPosition: false
            , lineColor: '#666'
            , lineCap: 'square'
        }
        return Object.assign(conf, kw)
    }

}

const originShiftConfigs = new OriginShiftConfigs()