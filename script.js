console.log("let's write javascript")
let currentSong = new Audio();
let songs = [];
let currfolder ="";
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);

    // Pad with leading zero if needed
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(sec).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`${folder}`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            let parts = element.href.split(`/${folder}/`);
            if (parts.length > 1) {
                songs.push(parts[1]);
            }
        }
    }

    let songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img src="music.svg" alt="" width="20px" class="invert">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Siddharth</div>
                                
                            </div>
                            
                            <div class="playnow">
                                <span> Play Now </span>
                                <img src="play.svg" alt="" width="30px" class="invert">
                            </div> </li>`;
    }
    // play the first song 

    // attach an event listener to each song
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })

    return songs


}

const playMusic = (track, pause = false) => {
    // let currentSong = new Audio() ;
    console.log("Track:", track);
    console.log("Current src:", `/${currfolder}/` + track);
    currentSong.src = `/${currfolder}/` + track
    if (!pause) {
        currentSong.play()

        document.querySelector("#play").src = "pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/Songs/`)
    let response = await a.text();
    //console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/Songs/")) {
            let folder = e.href.split("/").slice(-2)[0];
            console.log(folder)
            // get the metadata of the folder
            let a = await fetch(`/Songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder="${folder}" class="card">
                        <div class="play" >
                            <img src="Play-button.svg" alt="">
                        </div>
                      
                        <img src="/Songs/${folder}/Cover.jpg" alt="" >
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
            </div>

                    
        `
        
    }
  }

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e)
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset)
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })


}


async function main() {


    // get the list of the first song 
    await getSongs("Songs/ncs")
    console.log(songs)
    playMusic(songs[0], true)


    // display all the albums on the page 
    displayAlbums()

    // show all the songs in the playlist 


    //Attach an event listener to prev , play and next
    let playButton = document.querySelector("#play");
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            playButton.src = "pause.svg"
        }
        else {
            currentSong.pause()
            playButton.src = "play.svg"
        }
    })

    //Listen for time update event 
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)} `

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // add an event listener for hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style
            .left = "0"
    })
    // add an event listener for close button 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style
            .left = "-120%"
    })

    // add event listener to previous and next 
    prev.addEventListener("click", () => {
        currentSong.pause();


        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        currentSong.pause();

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        console.log(songs, index)

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }






    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        currentSong.volume = parseInt(e.target.value) / 100

    })

    //add event listener to mute the track 
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src= e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
            e.target.src =  e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume= 0.1;
        }
    })



}

main()



