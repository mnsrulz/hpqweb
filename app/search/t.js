const {EventEmitter} = require('stream')

let delay = (time) => new Promise(resolve => setTimeout(resolve, time));
const ee = new EventEmitter();
let counter = 0
const fn1 = async () => {
    counter++;
    delay(5000).then(t => { ee.emit('completed', counter); })

    return new Promise((res, rej) => {
        ee.on('completed', res);
    })
}

(async () => {
    const r1 = fn1()
    await delay(1000);
    const r2 = fn1()
    await delay(1000);
    const r3 = fn1()
    await delay(1000);
    const [v1, v2, v3] = await Promise.all([r1, r2, r3]);

    console.log(v1, v2, v3);
})();
