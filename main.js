// 1. render songs 
// 2. Scroll top
// 3. Play / pause / seek 
// 4. CD rotate
// 5. Next / Prev 
// 6. Random 
// 7. Next / Repeat when ended 
// 8. Active song 
// 9. Scroll active song into view 
// 10. Play song when click 

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE = 'PLAYER_F8'

const player = $('.player')
const playlist = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const nextPrev = $('.btn-prev')
const repeatBtn = $('.btn-repeat')
const randomBtn = $('.btn-random')
var count = 0
var arrayTemp = []


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem('PLAYER_STORAGE_KEY')) || {},
    songs: [
        { 
            name: 'Một Triệu Like',
            singer: 'Đen vâu',
            path: './assets/music/den1.mp3',
            img: './assets/img/den1.jpg'
        },
        { 
            name: 'MUỘN RỒI MÀ SAO CÒN',
            singer: 'Sơn Tùng',
            path: './assets/music/song2.mp3',
            img: './assets/img/sonTung2.jpg'
        },
        { 
            name: 'BIGCITYBOI',
            singer: 'TOULIVER x BINZ',
            path: './assets/music/song3.mp3',
            img: './assets/img/binz3.jpg'
        },
        { 
            name: 'The Man Who Can’t Be Moved ',
            singer: 'The Script',
            path: './assets/music/song4.mp3',
            img: './assets/img/theScrip4.jpg'
        },
        { 
            name: 'Tháng Mấy Em Nhớ Anh? ',
            singer: 'Hà Anh Tuấn',
            path: './assets/music/song5.mp3',
            img: './assets/img/haAnhTuan5.jpg'
        },
        { 
            name: 'Tháng Tư Là Lời Nói Dối Của Em ',
            singer: 'Hà Anh Tuấn',
            path: './assets/music/song6.mp3',
            img: './assets/img/haAnhTuan6.jpg'
        },
        { 
            name: 'BÔNG HOA ĐẸP NHẤT ',
            singer: 'Quân AP',
            path: './assets/music/song7.mp3',
            img: './assets/img/quanAp7.jpg'
        },
        { 
            name: 'Sài Gòn Buồn Qúa Em Ơi',
            singer: 'Dế Choắt',
            path: './assets/music/song8.mp3',
            img: './assets/img/deChoat8.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem('PLAYER_STORAGE_KEY', JSON.stringify(this.config))

    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.img}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
            
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this,'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        //xử lý cd quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {
                transform:'rotate(360deg)'
            }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity, // vô hạn
        })
        cdThumbAnimate.pause()
        


        // xử lý phóng to thu nhỏ cd
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth =  cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.opacity = newCdWidth / cdWidth 
        }

        // xử lý khi click playlist
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
               audio.play()
            }
        }

        //khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100)
                progress.value = progressPercent
            }
        }

        // xử lý khi tua song 
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
            audio.play() 
        }
       

        //khi next bài hát 
        nextBtn.onclick = function() {
            if (_this.isRandom) {            
            _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //khi prev bài hát 
        nextPrev.onclick = function() {
            if (_this.isRandom) {            
                _this.playRandomSong()
                } else {
                    _this.prevSong()
                }
                audio.play()
                _this.render()
                _this.scrollToActiveSong()
        }
        // xử lý random bật / tắt random song
        randomBtn.onclick = function(e) { 
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom) 
        }
        // xử lý lặp lại 1 song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // xử lý nextSong khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        // lắng nghe hành vi click vào playlist 
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }
                // xử lý khi click vào song option
                if (e.target.closest('.option')) {

                }
            }
        }
    }, 
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
        },300)
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }

        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }

        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        newIndex = Math.floor(Math.random() * this.songs.length)
        if (count > 0) {
            do {
                newIndex = Math.floor(Math.random() * this.songs.length)
                var isCheck = arrayTemp.includes(newIndex)
            } while (isCheck == true)

        }
        arrayTemp[count] = newIndex
        this.currentIndex = newIndex
        this.loadCurrentSong()
        if (count == this.songs.length - 1) {
            arrayTemp= []
            count = -1
        }
        count++;
    },

    start: function() {
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig
        // Định nghĩa các thuộc tính cho obj
        this.defineProperties()

        // lắng nghe và xử lý các sự kiện
        this.handleEvents()
        // tải thông tin bài hát đầu tiên khi UI khi chạy 
        this.loadCurrentSong()
        // playlist render
        this.render()
        // hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom) 
        repeatBtn.classList.toggle('active', this.isRepeat)
    }

    
}

app.start()