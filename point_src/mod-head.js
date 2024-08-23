import('./point-content.js')
const res = import('./point.js', { entryType: 'live'})

res.then(function(m){
    console.log('Imported point.js', m, m.Point)
})
// debugger

// export default function foo(){}