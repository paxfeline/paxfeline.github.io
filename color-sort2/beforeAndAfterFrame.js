/*
    code from
    https://github.com/andrewiggins/afterframe/blob/master/src/index.js
    found from
    https://nolanlawson.com/2019/08/11/high-performance-input-handling-on-the-web/
    which was also helpful and lead me to make some changes here
    */

/**
 * Queue of functions to invoke
 * @type {Array<(time: number) => void>}
 */
let beforeFrame_cb, afterFrame_cb;

let afterframe_channel = new MessageChannel();

let afterframe_postMessage = (function() {
  this.postMessage(undefined);
}).bind(afterframe_channel.port2);

// Flush the callback queue when a message is posted to the message channel
afterframe_channel.port1.onmessage = () => {
  // Reset the callback to empty in case callbacks call
  // afterFrame. These nested calls to afterFrame should queue up a new
  // callback to be flushed in the following frame and should not impact the
  // current queue being flushed
  let cb = afterFrame_cb;
  afterFrame_cb = null;
  cb();
};

// If the onmessage handler closes over the MessageChannel, the MessageChannel never gets GC'd:
afterframe_channel = null;

/**
 * Invoke the given callback after the browser renders the next frame
 * @param {(time: number) => void} callback The function to call after the browser renders
 * the next frame. The callback function is passed one argument, a DOMHighResTimeStamp
 * similar to the one returned by performance.now(), indicating the point in time when
 * afterFrame() starts to execute callback functions.
 */
function beforeAndAfterFrame(cb1, cb2)
{
    if (!beforeFrame_cb)
    {
        requestAnimationFrame(() =>
        {
            const cb = beforeFrame_cb;
            beforeFrame_cb = null;
            cb();
        })
    }
    beforeFrame_cb = cb1

    if (!afterFrame_cb)
    {
        requestAnimationFrame(afterframe_postMessage);
    }
    afterFrame_cb = cb2;
}