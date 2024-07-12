class OriginShiftConfigs {

    large(){

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
            , cols: 270
            , rows: 170

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
        return conf
    }

    small(){

        let radius = 40
        let gap = 10 // Math.floor(radius * .25)
        let conf = {
            /* The size of a single position for a path origin */
            positionSize: 4
            /* the size of the indicator at the end of a path */
            , tipRadius: 2
            , tipWidth: 1
            , tipColor: 'grey'
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
            , lineColor: '#880000'
            , originColor: 'red'
        }
        return conf
    }

}

const originShiftConfigs = new OriginShiftConfigs()