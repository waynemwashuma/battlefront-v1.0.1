AudioContext = window.AudioContext || window.webkitAudioContext;
    class audioHandler {
        constructor(params) {
            this.context = new AudioContext();
            this.oscillatorNode = this.context.createOscillator();
            this.gainNode = this.context.createGain();
            this.generalVolume = 1.0;
            this.source= this.context.createBufferSource();
            this.destination = this.context.destination;
            audioHandler.prototype.play = async function (buffer, options, time) {
                let source = this.context.createBufferSource();
                source.connect(gainNode);
                this.gainNode.connect(this.context.destination);
                source.buffer = buffer;
                source.connect(this.context.destination);
                source.start(time || 0);
                gainNode.gain.value = this.generalVolume;
            }
        }
        static createBuffer(url) {

        }
    }
    let a = new audioHandler();
    console.log(a.source);