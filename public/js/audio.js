'use strict'
AudioContext = window.AudioContext || window.webkitAudioContext;
let audioURLs = ['./res/sfx/tank.mp3']
class audioChain{
    constructor(context,buffer,options = {}){
        this.id;
        this.audioChains =[];
        this.pos = options.pos;
        this.source = context.createBufferSource();
        this.value = options.value;
        this.source.buffer = buffer;
        this.gain = context.createGain();
        this.source.connect(this.gain);
        audioChain.prototype.play = (destination,time,loop = false)=>{
            this.gain.connect(destination || context.destination);
            this.source.start(time);
            this.source.loop = loop;
        }
        audioChain.prototype.remove
        
    }
    set volume(x = 1){
        this.gain.gain.value = x;
    }
}
class audioHandler {
    constructor() {
        this.backgroundAudioPlayable = false;
        this.backgroundAudio;
        this.audiobuffers = [];
        this.audiochains = [];
        this.context = new AudioContext();
        this.source = this.context.createBufferSource();
        this.oscillatorNode = this.context.createOscillator();
        this.gainNode = this.context.createGain();
        this.generalVolume = 1.0;
        this.destination = this.context.destination;
        audioHandler.prototype.play = async function (buffer, options) {
            options = options || {
                volume: 1,
                time:0
            }
            let audio = new audioChain(this.context,buffer);
            this.audiochains.push(audio)
            audio.volume = options.volume
            audio.play(this.destination)
            audio.volume = options.volume
        }
        audioHandler.prototype.playBackground = () => {
            if(this.backgroundAudio && this.backgroundAudio instanceof audioChain)return;
            this.backgroundAudio = new audioChain(this.context,this.backgroundAudio,true);
            this.backgroundAudio.play(this.destination,0,true)
            this.backgroundAudio.volume = 1;
        }
    }
    static async populateAudioBuffer(handler, ...urls) {
        for (const url of urls) {
            await fetch(url, { method: 'get' })
                .then(data => data.arrayBuffer())
                .then(buffer => {
                    handler.context.decodeAudioData(buffer)
                        .then(data => handler.audiobuffers.push(data))
                });
        }
    }
    static async getBackgroundAudio(url) {
        await fetch(url, { method: 'get' })
            .then(data => data.arrayBuffer())
            .then(buffer => {
                audiohandler.context.decodeAudioData(buffer)
                    .then(data => (audiohandler.backgroundAudio = data) && (audiohandler.backgroundAudioPlayable = true));
            });
    }
};
let audiohandler = new audioHandler();
audioHandler.getBackgroundAudio('./res/sfx/background.mp3')
audioHandler.populateAudioBuffer(audiohandler, ...audioURLs);
window.onclick = () => audiohandler.playBackground();
//let timerId = setInterval(playAudioBackground,400)
// function playAudioBackground() {
//     if(audiohandler.context.state === 'running' && audiohandler.backgroundAudioPlayable) (audiohandler.playBackground()) &&(clearInterval(timerId));
//     console.log(timerId)

// }

